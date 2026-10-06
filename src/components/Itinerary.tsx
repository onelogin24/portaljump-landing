import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { credit, itinerary } from "../content/itinerary";
import { MapPin, MapStage, points, smoothPath, type Ctx, type XY } from "./MapStage";

const ZOOM_GO = 1.6;
const ZOOM_MS = 1200;
const WALK_MS = 8000;

const planPath = smoothPath([points.market, points.martim, points.castle, points.graca]);
const walkPath = (() => {
  const a = points.you;
  const b = points.market;
  const mid = { x: (a.x + b.x) / 2 + 26, y: (a.y + b.y) / 2 - 34 };
  return smoothPath([a, mid, b]);
})();

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function Itinerary({ active }: { active: number }) {
  const panel = useRef<HTMLDivElement>(null);
  const settle = useRef<HTMLDivElement>(null);
  const mask = useRef<SVGPathElement>(null);
  const walk = useRef<SVGPathElement>(null);
  const walker = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<Ctx | null>(null);
  const prevZoomed = useRef(false);

  const [started, setStarted] = useState(false);
  const [pins, setPins] = useState(0);
  const [rows, setRows] = useState(0);
  const [mapOn, setMapOn] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [walking, setWalking] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tab = itinerary[active];

  // Start once the panel is 30% visible.
  useEffect(() => {
    const el = panel.current;
    if (!el || !("IntersectionObserver" in window)) {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The sequence for each tab. It replays whenever the tab changes.
  useLayoutEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const n = tab.pins.length;
    const r = tab.rows.length;
    const m = mask.current;
    const len = m ? m.getTotalLength() : 0;
    if (m) {
      m.getAnimations().forEach((a) => a.cancel());
      m.style.strokeDasharray = `${len}`;
      m.style.strokeDashoffset = reduced ? "0" : `${len}`;
    }
    settle.current?.getAnimations().forEach((a) => a.cancel());

    if (reduced) {
      setMapOn(true);
      setPins(n);
      setRows(r);
      setZoomed(active === 2);
      setWalking(false);
      prevZoomed.current = active === 2;
      return;
    }
    if (!started && active === 0) {
      setMapOn(false);
      setPins(0);
      setRows(0);
      setZoomed(false);
      setWalking(false);
      return;
    }

    setPins(0);
    setRows(0);
    setWalking(false);
    setMapOn(true);
    setZoomed(active === 2);

    if (active === 0) {
      settle.current?.animate(
        [
          { opacity: 0, transform: "scale(1.04)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 1200, easing: "ease-out" },
      );
      for (let i = 0; i < n; i++) {
        at(1200 + i * 500, () => {
          setPins(i + 1);
          setRows(i + 1);
        });
      }
      if (m) {
        m.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 2200, delay: 1200, easing: "ease-in-out", fill: "both" });
      }
    } else if (active === 1) {
      const base = prevZoomed.current ? ZOOM_MS : 300;
      for (let i = 0; i < r; i++) at(base + i * 500, () => setRows(i + 1));
      for (let i = 0; i < n; i++) at(base + i * 500, () => setPins(i + 1));
    } else {
      at(ZOOM_MS, () => {
        setPins(n);
        setRows(r);
        setWalking(true);
      });
    }
    prevZoomed.current = active === 2;
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, started, reduced]);

  // The walker follows the dashed path to Time Out Market, 8 second loop.
  useEffect(() => {
    if (active !== 2) return;
    const el = walker.current;
    const path = walk.current;
    if (!el || !path) return;
    const place = (p: XY) => {
      const c = ctxRef.current;
      if (!c) return;
      const q = c.px(p);
      el.style.left = `${q.x}px`;
      el.style.top = `${q.y}px`;
    };
    place(points.you);
    if (!walking || reduced) return;
    const L = path.getTotalLength();
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = ((now - t0) % WALK_MS) / WALK_MS;
      const e = t < 0.85 ? ease(t / 0.85) : 1;
      const p = path.getPointAtLength(L * e);
      place({ x: p.x, y: p.y });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, walking, reduced, size.w, size.h, zoomed]);

  const animate = !reduced;

  return (
    <div ref={panel} className="map-panel" role="group" aria-label="Itinerary preview">
      <MapStage
        zoom={zoomed ? ZOOM_GO : 1}
        origin={points.you}
        animate={animate}
        settleRef={settle}
        settleHidden={!mapOn}
        onSize={(w, h) => setSize((s) => (s.w === w && s.h === h ? s : { w, h }))}
        svg={
          <>
            {active === 0 && (
              <>
                <mask id="route-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1600">
                  <path ref={mask} d={planPath} fill="none" stroke="#fff" strokeWidth="24" strokeLinecap="round" />
                </mask>
                <path
                  d={planPath}
                  fill="none"
                  stroke="#0B0B0C"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  vectorEffect="non-scaling-stroke"
                  mask="url(#route-mask)"
                />
              </>
            )}
            {active === 2 && (
              <path
                ref={walk}
                d={walkPath}
                fill="none"
                stroke="#0B0B0C"
                strokeWidth="2"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
                className={pins > 0 ? "route-on" : "route-off"}
              />
            )}
          </>
        }
      >
        {(ctx) => {
          ctxRef.current = ctx;
          return (
            <>
              {tab.pins.map((p, i) =>
                i < pins ? (
                  <MapPin
                    key={`${active}-${i}`}
                    at={ctx.px(points[p.at])}
                    kind={p.kind}
                    n={p.n}
                    chip={p.chip}
                    drop={animate}
                    animate={animate}
                  />
                ) : null,
              )}
              {active === 2 && <div ref={walker} className="walker" />}
            </>
          );
        }}
      </MapStage>

      <div className="itin-card card" aria-live="polite">
        <p className="card-title">{tab.title}</p>
        <ul className="itin-rows">
          {tab.rows.map((row, i) => (
            <li key={`${active}-${i}`} className={`itin-row ${i < rows ? "show" : ""}`}>
              {row.time && <span className="itin-time">{row.time}</span>}
              <span className="itin-place">{row.place}</span>
              {row.note && <span className="itin-note">{row.note}</span>}
              {row.pill && <span className="pill">{row.pill}</span>}
            </li>
          ))}
        </ul>
        {tab.footer && <p className={`itin-foot ${rows >= tab.rows.length ? "show" : ""}`}>{tab.footer}</p>}
      </div>

      <a className="map-credit" href={credit.href} target="_blank" rel="noopener noreferrer">
        {credit.text}
      </a>
    </div>
  );
}
