import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ARCS, CHIPS, PINS, RINGS, TRAVELERS } from '../data';
import assets from '../generated/assets.json';
import {
  GLOBE_FILL,
  HORIZON_Z,
  INIT_LON,
  INIT_TILT,
  TILT_MAX,
  latLonToVec,
  makeRot,
  newProjected,
  projectCamera,
  projectVec,
  type Vec3,
} from '../globe/projection';
import type { GlobeApi } from '../globe/GlobeScene';
import { Icon } from './Icons';
import styles from './GlobeStage.module.css';

const AUTO_DEG_PER_SEC = 3.5;
const IDLE_BEFORE_AUTO_MS = 2000;
const INERTIA_DECAY = 3.2;
const ARC_SAMPLES = 56;
const RAD = Math.PI / 180;

type Pt = { x: number; y: number };

/** portraits ship as <name>-384.webp plus a -192 variant; anything else (e.g. an svg) has no srcset */
const avatarSrcSet = (src: string) => (src.endsWith('-384.webp') ? `${src.replace('-384', '-192')} 192w, ${src} 384w` : undefined);

// ---------- static globe-space geometry (computed once) ----------
const PIN_V: Vec3[] = PINS.map((p) => latLonToVec(p.lat, p.lon));

const dot3 = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const angle3 = (a: Vec3, b: Vec3) => Math.acos(Math.max(-1, Math.min(1, dot3(a, b))));

/** point at fraction t along the great circle from a to b */
function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const om = angle3(a, b);
  const so = Math.sin(om) || 1e-6;
  const ka = Math.sin((1 - t) * om) / so;
  const kb = Math.sin(t * om) / so;
  return [ka * a[0] + kb * b[0], ka * a[1] + kb * b[1], ka * a[2] + kb * b[2]];
}

const ARC_PTS: Vec3[][] = ARCS.map(([i, j]) => Array.from({ length: ARC_SAMPLES + 1 }, (_, k) => slerp(PIN_V[i], PIN_V[j], k / ARC_SAMPLES)));

/** where two arcs cross on the sphere (analytic great-circle intersection), excluding the pins themselves */
const NODE_V: Vec3[] = (() => {
  const out: Vec3[] = [];
  const onArc = (q: Vec3, a: Vec3, b: Vec3) => Math.abs(angle3(a, q) + angle3(q, b) - angle3(a, b)) < 1e-3;
  for (let i = 0; i < ARCS.length; i++) {
    for (let j = i + 1; j < ARCS.length; j++) {
      const [a1, b1] = [PIN_V[ARCS[i][0]], PIN_V[ARCS[i][1]]];
      const [a2, b2] = [PIN_V[ARCS[j][0]], PIN_V[ARCS[j][1]]];
      const p = cross3(cross3(a1, b1), cross3(a2, b2));
      if (Math.hypot(p[0], p[1], p[2]) < 1e-6) continue;
      const q = norm3(p);
      for (const s of [1, -1]) {
        const c: Vec3 = [q[0] * s, q[1] * s, q[2] * s];
        if (!onArc(c, a1, b1) || !onArc(c, a2, b2)) continue;
        if (PIN_V.some((pin) => angle3(pin, c) < 0.12)) continue;
        out.push(c);
      }
    }
  }
  // keep a calm, well-spread subset (the denser the arc network, the more crossings there are)
  const kept: Vec3[] = [];
  for (const c of out) {
    if (kept.length < 18 && kept.every((k) => angle3(k, c) > 0.2)) kept.push(c);
  }
  return kept;
})();

export default function GlobeStage({ poster = false }: { poster?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const pinEls = useRef<(HTMLDivElement | null)[]>([]);
  const chipEls = useRef<(HTMLAnchorElement | null)[]>([]);
  const lineEls = useRef<(SVGPathElement | null)[]>([]);
  const arcEls = useRef<(SVGPathElement | null)[]>([]);
  const arcGradEls = useRef<(SVGLinearGradientElement | null)[]>([]);
  const nodeEls = useRef<(SVGGElement | null)[]>([]);
  const travEls = useRef<(SVGGElement | null)[]>([]);
  const ringBackEls = useRef<(SVGPathElement | null)[]>([]);
  const ringFrontEls = useRef<(SVGPathElement | null)[]>([]);
  const maskGradRef = useRef<SVGRadialGradientElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const drag = dragRef.current!;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    const hiRes = poster || (!coarse && window.innerWidth >= 1080);
    const orbit = window.matchMedia('(min-width: 1080px)');
    const dprCap = coarse ? 1.5 : 2;

    const st = {
      lon: INIT_LON,
      tilt: INIT_TILT,
      vLon: 0,
      vTilt: 0,
      dragging: false,
      lastX: 0,
      lastY: 0,
      lastT: 0,
      idleSince: -Infinity,
      ready: false,
      onscreen: true,
      size: 0,
      ox: 0, // globe centre, in root coordinates
      oy: 0,
    };

    let globe: GlobeApi | null = null;
    let raf = 0;
    let disposed = false;
    let last = performance.now();
    let lastDraw = 0;

    const proj = newProjected();
    const pp: Pt[] = PINS.map(() => ({ x: 0, y: 0 }));
    const pf: number[] = PINS.map(() => 0);
    const anchors: Pt[] = CHIPS.map(() => ({ x: 0, y: 0 }));

    // ---- static rings: two tilted ellipses, split into the part behind the globe and the part in front
    const buildRings = () => {
      const half = st.size / 2;
      const tmp = { nx: 0, ny: 0 };
      RINGS.forEach((ring, k) => {
        const a = ring.tilt * RAD;
        const b = ring.roll * RAD;
        const N = 200;
        let back = '';
        let front = '';
        let lastBack = -1;
        let lastFront = -1;
        let prev: Pt & { z: number } | null = null;
        for (let i = 0; i <= N; i++) {
          const phi = (i / N) * Math.PI * 2;
          const x0 = ring.r * Math.cos(phi);
          const y0 = ring.r * Math.sin(phi) * Math.cos(a);
          const z = ring.r * Math.sin(phi) * Math.sin(a);
          const x = x0 * Math.cos(b) - y0 * Math.sin(b);
          const y = x0 * Math.sin(b) + y0 * Math.cos(b);
          projectCamera(x, y, z, tmp);
          const cur = { x: st.ox + tmp.nx * half, y: st.oy - tmp.ny * half, z };
          if (prev) {
            const isFront = (prev.z + cur.z) / 2 > 0;
            const seg = `${isFront ? (lastFront === i - 1 ? 'L' : `M${prev.x.toFixed(1)} ${prev.y.toFixed(1)}L`) : lastBack === i - 1 ? 'L' : `M${prev.x.toFixed(1)} ${prev.y.toFixed(1)}L`}${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
            if (isFront) {
              front += seg;
              lastFront = i;
            } else {
              back += seg;
              lastBack = i;
            }
          }
          prev = cur;
        }
        ringBackEls.current[k]?.setAttribute('d', back);
        ringFrontEls.current[k]?.setAttribute('d', front);
      });
    };

    const layout = () => {
      st.size = stage.clientWidth;
      const S = st.size;
      st.ox = stage.offsetLeft + S / 2;
      st.oy = stage.offsetTop + S / 2;
      const R = (S * GLOBE_FILL) / 2;

      // limb mask: arcs and nodes fade out softly before the silhouette
      const g = maskGradRef.current;
      if (g) {
        g.setAttribute('cx', String(st.ox));
        g.setAttribute('cy', String(st.oy));
        g.setAttribute('r', String(R));
      }

      // chip dots (desktop): centre of the chip is a % of the hero; the dot sits just outside the globe-facing edge
      const rw = root.clientWidth;
      const rh = root.clientHeight;
      CHIPS.forEach((c, i) => {
        const el = chipEls.current[i];
        const w = el ? el.offsetWidth : 120;
        anchors[i].x = (c.x / 100) * rw + (c.side === 'right' ? 1 : -1) * (w / 2 + 9);
        anchors[i].y = (c.y / 100) * rh;
      });
      buildRings();
      if (globe) globe.resize(S, Math.min(window.devicePixelRatio || 1, dprCap));
    };

    const update = (time: number) => {
      const S = st.size;
      if (!S) return;
      const half = S / 2;
      const rot = makeRot(st.lon, st.tilt);

      // pins
      for (let i = 0; i < PINS.length; i++) {
        projectVec(PIN_V[i], rot, proj);
        pp[i].x = st.ox + proj.nx * half;
        pp[i].y = st.oy - proj.ny * half;
        pf[i] = proj.facing;
        const el = pinEls.current[i];
        if (!el) continue;
        if (proj.facing < 0.01) {
          el.style.visibility = 'hidden';
        } else {
          el.style.visibility = 'visible';
          el.style.opacity = proj.facing.toFixed(3);
          el.style.transform = `translate3d(${pp[i].x.toFixed(1)}px,${pp[i].y.toFixed(1)}px,0) scale(${(0.9 + 0.1 * proj.facing).toFixed(3)})`;
        }
      }

      // great-circle arcs on the surface (front hemisphere only; the limb mask feathers the ends)
      for (let k = 0; k < ARCS.length; k++) {
        const path = arcEls.current[k];
        if (!path) continue;
        let d = '';
        let pen = false;
        let x0 = 0;
        let y0 = 0;
        let x1 = 0;
        let y1 = 0;
        for (const v of ARC_PTS[k]) {
          projectVec(v, rot, proj);
          if (proj.z > HORIZON_Z + 0.005) {
            x1 = st.ox + proj.nx * half;
            y1 = st.oy - proj.ny * half;
            if (!d) {
              x0 = x1;
              y0 = y1;
            }
            d += `${pen ? 'L' : 'M'}${x1.toFixed(1)} ${y1.toFixed(1)}`;
            pen = true;
          } else {
            pen = false;
          }
        }
        path.setAttribute('d', d);
        const grad = arcGradEls.current[k];
        if (grad && d) {
          grad.setAttribute('x1', x0.toFixed(1));
          grad.setAttribute('y1', y0.toFixed(1));
          grad.setAttribute('x2', x1.toFixed(1));
          grad.setAttribute('y2', y1.toFixed(1));
        }
      }

      // glowing nodes where arcs cross
      for (let k = 0; k < NODE_V.length; k++) {
        const g = nodeEls.current[k];
        if (!g) continue;
        projectVec(NODE_V[k], rot, proj);
        if (proj.facing < 0.01) {
          g.style.opacity = '0';
        } else {
          g.setAttribute('transform', `translate(${(st.ox + proj.nx * half).toFixed(1)} ${(st.oy - proj.ny * half).toFixed(1)})`);
          g.style.opacity = proj.facing.toFixed(2);
        }
      }

      // a few nodes drifting along arcs
      const t = time / 1000;
      for (let n = 0; n < TRAVELERS.length; n++) {
        const g = travEls.current[n];
        if (!g) continue;
        if (reduceMotion) {
          g.style.opacity = '0';
          continue;
        }
        const [i, j] = ARCS[TRAVELERS[n]];
        const u = (t / (18 + n * 5) + n * 0.37) % 1;
        projectVec(slerp(PIN_V[i], PIN_V[j], u), rot, proj);
        if (proj.facing < 0.01) {
          g.style.opacity = '0';
        } else {
          g.setAttribute('transform', `translate(${(st.ox + proj.nx * half).toFixed(1)} ${(st.oy - proj.ny * half).toFixed(1)})`);
          g.style.opacity = (proj.facing * Math.sin(Math.PI * u)).toFixed(2);
        }
      }

      // dotted curves from each chip's dot to its pin (desktop)
      if (orbit.matches) {
        const cx = st.ox;
        const cy = st.oy;
        for (let i = 0; i < CHIPS.length; i++) {
          const path = lineEls.current[i];
          if (!path) continue;
          const pi = CHIPS[i].pin;
          const f = pf[pi];
          if (f < 0.01) {
            path.style.setProperty('--v', '0');
            continue;
          }
          const a = anchors[i];
          const b = pp[pi];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const vx = b.x - a.x;
          const vy = b.y - a.y;
          const len = Math.hypot(vx, vy) || 1;
          let nx = -vy / len;
          let ny = vx / len;
          if (nx * (mx - cx) + ny * (my - cy) < 0) {
            nx = -nx;
            ny = -ny;
          }
          const k = len * 0.14;
          path.setAttribute('d', `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${(mx + nx * k).toFixed(1)} ${(my + ny * k).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
          path.style.setProperty('--v', f.toFixed(2));
        }
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!st.dragging) {
        st.lon += st.vLon * dt;
        st.tilt = Math.max(-TILT_MAX, Math.min(TILT_MAX, st.tilt + st.vTilt * dt));
        const decay = Math.exp(-INERTIA_DECAY * dt);
        st.vLon *= decay;
        st.vTilt *= decay;
        if (!reduceMotion && !poster && st.ready && now - st.idleSince > IDLE_BEFORE_AUTO_MS) {
          st.lon -= AUTO_DEG_PER_SEC * dt;
        }
      }

      // gentle idle drift does not need 60fps: halve the shader/DOM work unless the user is dragging or flinging
      const calm = !st.dragging && Math.abs(st.vLon) < 1 && Math.abs(st.vTilt) < 1;
      if (calm && now - lastDraw < 30) return schedule();
      lastDraw = now;
      update(now);
      globe?.render(st.lon, st.tilt);
      schedule();
    };

    const shouldRun = () => st.onscreen && !document.hidden;
    const schedule = () => {
      if (raf || disposed || !shouldRun()) return;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const resume = () => {
      if (!shouldRun()) return stop();
      last = performance.now();
      schedule();
    };

    // ---- pointer drag (mouse + touch); the drag disc is touch-action: pan-y so vertical scroll is never trapped
    const degPerPx = () => 180 / Math.PI / ((st.size * GLOBE_FILL) / 2);
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      st.dragging = true;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.lastT = e.timeStamp;
      st.vLon = 0;
      st.vTilt = 0;
      drag.setPointerCapture(e.pointerId);
      drag.dataset.dragging = 'true';
    };
    const onMove = (e: PointerEvent) => {
      if (!st.dragging) return;
      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      const dt = Math.max(0.008, (e.timeStamp - st.lastT) / 1000);
      const k = degPerPx();
      st.lon -= dx * k;
      st.tilt = Math.max(-TILT_MAX, Math.min(TILT_MAX, st.tilt + dy * k * 0.6));
      st.vLon = st.vLon * 0.4 + ((-dx * k) / dt) * 0.6;
      st.vTilt = st.vTilt * 0.4 + ((dy * k * 0.6) / dt) * 0.6;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.lastT = e.timeStamp;
      if (!raf) update(performance.now());
    };
    const onUp = (e: PointerEvent) => {
      if (!st.dragging) return;
      st.dragging = false;
      st.idleSince = performance.now();
      if (e.timeStamp - st.lastT > 80) {
        st.vLon = 0;
        st.vTilt = 0;
      }
      st.vLon = Math.max(-240, Math.min(240, st.vLon));
      st.vTilt = Math.max(-120, Math.min(120, st.vTilt));
      delete drag.dataset.dragging;
    };

    // ---- lifecycle
    const ro = new ResizeObserver(() => {
      layout();
      update(performance.now());
      globe?.render(st.lon, st.tilt);
    });
    ro.observe(root);
    ro.observe(stage);

    const io = new IntersectionObserver(([entry]) => {
      st.onscreen = entry.isIntersecting;
      resume();
    });
    io.observe(stage);

    const onVisibility = () => resume();
    document.addEventListener('visibilitychange', onVisibility);
    const onOrbitChange = () => {
      layout();
      update(performance.now());
    };
    orbit.addEventListener('change', onOrbitChange);

    if (!poster) {
      drag.addEventListener('pointerdown', onDown);
      drag.addEventListener('pointermove', onMove);
      drag.addEventListener('pointerup', onUp);
      drag.addEventListener('pointercancel', onUp);
    }

    layout();
    update(performance.now());
    resume();
    // chip widths depend on the web font; re-measure the line anchors once it is in
    void document.fonts?.ready.then(() => {
      if (!disposed) layout();
    });

    // ---- lazy-load Three.js; the pre-rendered poster covers the gap and any failure
    const load = () => {
      import('../globe/GlobeScene')
        .then((m) =>
          m.createGlobe(canvas, {
            albedoUrl: hiRes ? '/textures/earth-albedo-4096.webp' : '/textures/earth-albedo-2048.webp',
            albedoUrlHi: hiRes ? '/textures/earth-albedo-8192.webp' : undefined,
            antialias: !coarse,
          }),
        )
        .then((g) => {
          if (disposed) return g.dispose();
          globe = g;
          layout();
          g.render(st.lon, st.tilt);
          st.ready = true;
          st.idleSince = performance.now();
          setReady(true);
          if (poster) document.documentElement.dataset.globeReady = '1';
        })
        .catch(() => {
          /* no WebGL / load failure: the poster image stays as the fallback */
        });
    };

    // Start the WebGL swap on the first sign of user intent, or ~3.5s after the page has loaded, whichever
    // comes first. The poster is pixel-identical to the first WebGL frame, so waiting costs nothing visually
    // and keeps shader compilation / texture upload off the main thread while the page is becoming interactive.
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const intentEvents = ['pointerdown', 'pointermove', 'touchstart', 'wheel', 'keydown', 'scroll'] as const;
    let started = false;
    let timer = 0;
    let idle = 0;
    const dropIntentListeners = () => intentEvents.forEach((n) => window.removeEventListener(n, start));
    function start() {
      if (started || disposed) return;
      started = true;
      dropIntentListeners();
      window.clearTimeout(timer);
      load();
    }
    const scheduleFallback = () => {
      timer = window.setTimeout(() => {
        if (hasIdle) idle = window.requestIdleCallback(start, { timeout: 1500 });
        else start();
      }, 3500);
    };
    if (poster) {
      start();
    } else {
      intentEvents.forEach((n) => window.addEventListener(n, start, { passive: true }));
      if (document.readyState === 'complete') scheduleFallback();
      else window.addEventListener('load', scheduleFallback, { once: true });
    }

    return () => {
      disposed = true;
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      orbit.removeEventListener('change', onOrbitChange);
      drag.removeEventListener('pointerdown', onDown);
      drag.removeEventListener('pointermove', onMove);
      drag.removeEventListener('pointerup', onUp);
      drag.removeEventListener('pointercancel', onUp);
      dropIntentListeners();
      window.removeEventListener('load', scheduleFallback);
      window.clearTimeout(timer);
      if (hasIdle && idle) window.cancelIdleCallback(idle);
      globe?.dispose();
    };
  }, [poster]);

  const activePin = active == null ? -1 : CHIPS[active].pin;

  return (
    <div ref={rootRef} className={styles.root} data-poster={poster || undefined}>
      {!poster && (
        <svg className={styles.ringsBack} aria-hidden="true" focusable="false">
          {RINGS.map((_, k) => (
            <path key={k} ref={(el) => void (ringBackEls.current[k] = el)} className={styles.ring} />
          ))}
        </svg>
      )}

      <figure ref={stageRef} className={`${styles.stage} ${ready ? styles.ready : ''}`}>
        <figcaption className="sr-only">
          An illustrated globe. Members are pinned in {PINS.map((p) => p.name).join(', ')}. Drag to rotate it.
        </figcaption>
        <img
          className={styles.poster}
          src="/globe-poster.webp"
          srcSet="/globe-poster-640.webp 640w, /globe-poster.webp 1280w"
          sizes="(min-width: 1080px) min(61svh, 44vw), min(118vw, 640px)"
          width={1280}
          height={1280}
          alt=""
          {...{ fetchpriority: 'high' }}
          decoding="async"
        />
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      </figure>

      {!poster && (
        <>
          <div className={styles.cushion} aria-hidden="true">
            <img
              className={styles.cushionImg}
              src={assets.clouds.cushion.src}
              srcSet={`${assets.clouds.cushion.half} ${assets.clouds.cushion.halfW}w, ${assets.clouds.cushion.src} ${assets.clouds.cushion.w}w`}
              sizes="(min-width: 1080px) 28vw, 74vw"
              width={assets.clouds.cushion.w}
              height={assets.clouds.cushion.h}
              alt=""
              decoding="async"
            />
          </div>

          <svg className={styles.overlay} aria-hidden="true" focusable="false">
            <defs>
              <radialGradient id="limb-fade" ref={maskGradRef} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#e8c27a" />
                <stop offset="0.88" stopColor="#e8c27a" />
                <stop offset="0.985" stopColor="#000" />
              </radialGradient>
              {ARCS.map((_, k) => (
                <linearGradient key={k} id={`arc-fade-${k}`} ref={(el) => void (arcGradEls.current[k] = el)} gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#e8c27a" stopOpacity="0" />
                  <stop offset="0.2" stopColor="#e8c27a" stopOpacity="1" />
                  <stop offset="0.8" stopColor="#e8c27a" stopOpacity="1" />
                  <stop offset="1" stopColor="#e8c27a" stopOpacity="0" />
                </linearGradient>
              ))}
              <mask id="limb-mask" maskUnits="userSpaceOnUse" x="-20%" y="-20%" width="140%" height="140%">
                <rect x="-20%" y="-20%" width="140%" height="140%" fill="url(#limb-fade)" />
              </mask>
            </defs>

            {RINGS.map((_, k) => (
              <path key={`rf${k}`} ref={(el) => void (ringFrontEls.current[k] = el)} className={styles.ring} />
            ))}

            <g mask="url(#limb-mask)">
              {ARCS.map((_, k) => (
                <path key={`a${k}`} ref={(el) => void (arcEls.current[k] = el)} className={styles.arc} stroke={`url(#arc-fade-${k})`} />
              ))}
              {NODE_V.map((_, k) => (
                <g key={`n${k}`} ref={(el) => void (nodeEls.current[k] = el)} className={styles.node}>
                  <circle r="8" className={styles.nodeGlow} />
                  <circle r="3.4" className={styles.nodeCore} />
                </g>
              ))}
              {TRAVELERS.map((_, n) => (
                <g key={`t${n}`} ref={(el) => void (travEls.current[n] = el)} className={styles.node}>
                  <circle r="6" className={styles.travGlow} />
                  <circle r="1.5" className={styles.travCore} />
                </g>
              ))}
            </g>

            {CHIPS.map((c, i) => (
              <path
                key={`l${c.label}`}
                ref={(el) => void (lineEls.current[i] = el)}
                className={`${styles.chipLine} ${active === i ? styles.lineActive : ''}`}
              />
            ))}
          </svg>

          <div ref={dragRef} className={styles.drag} />

          {PINS.map((p, i) => (
            <div key={p.id} ref={(el) => void (pinEls.current[i] = el)} className={styles.pin} aria-hidden="true">
              <div className={`${styles.pinInner} ${activePin === i ? styles.pinActive : ''}`}>
                <img src={assets.avatars[i]} srcSet={avatarSrcSet(assets.avatars[i])} sizes="(min-width: 1080px) 6vw, 14vw" width={128} height={128} alt="" draggable={false} />
                <span className={styles.status} />
              </div>
            </div>
          ))}

          <ul className={styles.chips}>
            {CHIPS.map((c, i) => (
              <li key={c.label} className={styles.chipPos} data-side={c.side} style={{ '--x': `${c.x}%`, '--y': `${c.y}%`, '--i': i } as CSSProperties}>
                <a
                  ref={(el) => void (chipEls.current[i] = el)}
                  href="#explore"
                  className={`glass ${styles.chip} ${active === i ? styles.chipActive : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  <span className={styles.icon}>
                    <Icon name={c.icon} />
                  </span>
                  <span>{c.label}</span>
                  <span className={styles.dot} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {poster && <div ref={dragRef} hidden />}
    </div>
  );
}
