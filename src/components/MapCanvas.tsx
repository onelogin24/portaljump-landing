import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import mapData from "../generated/map-points.json";

export type XY = { x: number; y: number };
export type View = { x: number; y: number; w: number; h: number };
export type Size = { w: number; h: number };
export type Reserve = { right: number; bottom: number };

export const MAP_W = mapData.width;
export const MAP_H = mapData.height;
export const points = mapData.points as Record<"chiado" | "lanes" | "graca" | "stay" | "market", XY>;

const TWEEN_MS = 1000;
const PAD = 0.18;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Fit the stops with 18% padding on every side, keeping the panel's aspect ratio. */
export function fitView(pts: XY[], size: Size, reserve: Reserve): View {
  const aw = Math.max(size.w - reserve.right, 120);
  const ah = Math.max(size.h - reserve.bottom, 120);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const bw = Math.max(maxX - minX, 40);
  const bh = Math.max(maxY - minY, 40);
  let k = Math.min(aw / (bw * (1 + 2 * PAD)), ah / (bh * (1 + 2 * PAD)), 2.5);
  k = Math.max(k, size.w / MAP_W, size.h / MAP_H); // never show beyond the map edge
  const w = size.w / k;
  const h = size.h / k;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const x = Math.min(Math.max(cx - aw / 2 / k, 0), MAP_W - w);
  const y = Math.min(Math.max(cy - ah / 2 / k, 0), MAP_H - h);
  return { x, y, w, h };
}

/** A gentle curve between two stops (not road routing). */
function legGeometry(a: XY, b: XY) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const c = { x: mx - dy * 0.14, y: my + dx * 0.14 };
  return {
    d: `M${a.x} ${a.y} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x} ${b.y}`,
    mid: { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y },
  };
}
export const legMid = (a: XY, b: XY) => legGeometry(a, b).mid;

export type PinData = {
  key: string;
  at: XY;
  photo: string;
  n?: number;
  icon?: "bed" | "fork";
  drop?: boolean;
};

export type LegState = "hidden" | "drawing" | "drawn";
export type LegData = { key: string; a: XY; b: XY; state: LegState };

const ICONS = {
  bed: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
  fork: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
};

function Leg({ leg, animate, uid }: { leg: LegData; animate: boolean; uid: string }) {
  const mask = useRef<SVGPathElement>(null);
  const { d } = legGeometry(leg.a, leg.b);
  useLayoutEffect(() => {
    const m = mask.current;
    if (!m) return;
    const len = m.getTotalLength();
    m.getAnimations().forEach((a) => a.cancel());
    m.style.strokeDasharray = `${len}`;
    if (leg.state === "hidden") {
      m.style.strokeDashoffset = `${len}`;
    } else {
      m.style.strokeDashoffset = "0";
      if (leg.state === "drawing" && animate) {
        m.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1200, easing: "ease-in-out" });
      }
    }
  }, [leg.state, animate, d]);
  return (
    <>
      <mask id={`${uid}-${leg.key}`} maskUnits="userSpaceOnUse" x="0" y="0" width={MAP_W} height={MAP_H}>
        <path ref={mask} d={d} fill="none" stroke="#fff" strokeWidth="30" strokeLinecap="round" />
      </mask>
      <path
        d={d}
        fill="none"
        stroke="#0B0B0C"
        strokeWidth="2"
        strokeDasharray="6 6"
        vectorEffect="non-scaling-stroke"
        mask={`url(#${uid}-${leg.key})`}
      />
    </>
  );
}

type Props = {
  fit: XY[];
  reserve?: Reserve;
  pins: PinData[];
  legs?: LegData[];
  animate: boolean;
  pinSize?: number;
  onSize?: (s: Size) => void;
  children?: (ctx: { toPx: (p: XY) => XY; size: Size }) => ReactNode;
  className?: string;
};

/** One inline SVG holds the base map, routes and photo pins, so they share a single coordinate system. */
export function MapCanvas({ fit, reserve = { right: 0, bottom: 0 }, pins, legs = [], animate, pinSize = 52, onSize, children, className = "" }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => {
      const next = { w: el.clientWidth, h: el.clientHeight };
      setSize((s) => (s.w === next.w && s.h === next.h ? s : next));
      onSize?.(next);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const target = size.w > 0 ? fitView(fit, size, reserve) : { x: 0, y: 0, w: MAP_W, h: MAP_H };
  const [view, setView] = useState<View>(target);
  const current = useRef<View>(target);
  const lastSize = useRef("");
  const raf = useRef(0);
  const sig = `${target.x.toFixed(2)},${target.y.toFixed(2)},${target.w.toFixed(2)},${target.h.toFixed(2)}`;

  useLayoutEffect(() => {
    cancelAnimationFrame(raf.current);
    const sizeKey = `${size.w}x${size.h}`;
    const snap = !animate || lastSize.current !== sizeKey || size.w === 0;
    lastSize.current = sizeKey;
    if (snap) {
      current.current = target;
      setView(target);
      return;
    }
    const from = current.current;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / TWEEN_MS, 1);
      const e = ease(t);
      const v = {
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
        h: from.h + (target.h - from.h) * e,
      };
      current.current = v;
      setView(v);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, size.w, size.h, animate]);

  const unit = size.w > 0 ? view.w / size.w : 1; // map units per screen px
  const toPx = (p: XY): XY => ({ x: ((p.x - view.x) / view.w) * size.w, y: ((p.y - view.y) / view.h) * size.h });
  const s = pinSize / 52;

  return (
    <div ref={box} className={`canvas ${className}`}>
      <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <filter id={`${uid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.22" />
          </filter>
          <clipPath id={`${uid}-clip`}>
            <circle r="23" />
          </clipPath>
        </defs>
        <image href="/map/lisbon.svg" x="0" y="0" width={MAP_W} height={MAP_H} preserveAspectRatio="none" />
        {legs.map((l) => (
          <Leg key={l.key} leg={l} animate={animate} uid={uid} />
        ))}
        {size.w > 0 &&
          pins.map((p) => (
            <g key={p.key} transform={`translate(${p.at.x} ${p.at.y}) scale(${unit * s})`}>
              <g className={p.drop && animate ? "pin-drop" : undefined}>
                <g filter={`url(#${uid}-shadow)`}>
                  <circle r="26" fill="#fff" />
                  <image
                    href={`/images/${p.photo}-sm.webp`}
                    x="-23"
                    y="-23"
                    width="46"
                    height="46"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#${uid}-clip)`}
                  />
                </g>
                <circle cx="18" cy="-18" r="10" fill="#0B0B0C" />
                {p.n !== undefined && (
                  <text x="18" y="-18" textAnchor="middle" dominantBaseline="central" className="pin-num">
                    {p.n}
                  </text>
                )}
                {p.icon && (
                  <g
                    transform="translate(12 -24) scale(0.5)"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dangerouslySetInnerHTML={{ __html: ICONS[p.icon] }}
                  />
                )}
              </g>
            </g>
          ))}
      </svg>
      {size.w > 0 && <div className="canvas-overlay">{children?.({ toPx, size })}</div>}
    </div>
  );
}
