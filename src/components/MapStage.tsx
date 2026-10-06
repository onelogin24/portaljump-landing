import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { Bed, Utensils } from "lucide-react";
import mapData from "../generated/map-points.json";

export type XY = { x: number; y: number };
export type Ctx = { px: (p: XY) => XY };

export const MAP_W = mapData.width;
export const MAP_H = mapData.height;
export const points = mapData.points as Record<"market" | "martim" | "castle" | "graca" | "alfama" | "you", XY>;

/** Smooth Catmull-Rom curve through the points, as an SVG path (not road routing). */
export function smoothPath(pts: XY[]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x} ${p2.y}`;
  }
  return d;
}

type StageProps = {
  zoom: number;
  origin: XY;
  animate?: boolean;
  settleRef?: Ref<HTMLDivElement>;
  settleHidden?: boolean;
  /** routes, in map units (same viewBox as the base map) */
  svg?: ReactNode;
  /** HTML pins, placed with ctx.px */
  children?: (ctx: Ctx) => ReactNode;
  onSize?: (w: number, h: number) => void;
  className?: string;
};

/** Base map image and overlay share one box and one slice scale, so they always line up. */
export function MapStage({ zoom, origin, animate, settleRef, settleHidden, svg, children, onSize, className = "" }: StageProps) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
      onSize?.(w, h);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = Math.max(size.w / MAP_W, size.h / MAP_H);
  const offX = (size.w - MAP_W * s) / 2;
  const offY = (size.h - MAP_H * s) / 2;
  const base = (p: XY): XY => ({ x: p.x * s + offX, y: p.y * s + offY });
  const o = base(origin);
  const px = (p: XY): XY => {
    const b = base(p);
    return { x: o.x + (b.x - o.x) * zoom, y: o.y + (b.y - o.y) * zoom };
  };
  const ready = size.w > 0;

  return (
    <div ref={box} className={`stage ${animate ? "stage-animate" : ""} ${className}`}>
      <div className="stage-zoom" style={{ transformOrigin: `${o.x}px ${o.y}px`, transform: `scale(${zoom})` }}>
        <div ref={settleRef} className="stage-settle" style={settleHidden ? { opacity: 0 } : undefined}>
          <img src="/map/lisbon.svg" alt="" width={MAP_W} height={MAP_H} loading="lazy" decoding="async" />
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {svg}
          </svg>
        </div>
      </div>
      <div className="stage-pins">{ready && children?.({ px })}</div>
    </div>
  );
}

type PinProps = {
  at: XY;
  kind: "num" | "bed" | "fork";
  n?: number;
  chip?: string;
  drop?: boolean;
  animate?: boolean;
};

export function MapPin({ at, kind, n, chip, drop, animate }: PinProps) {
  return (
    <div className={`mk mk-${kind} ${animate ? "mk-move" : ""}`} style={{ left: at.x, top: at.y }}>
      <div className={`mk-in ${drop ? "drop" : ""}`}>
        {chip && <span className="pin-label">{chip}</span>}
        <span className="mk-pin">
          {kind === "num" && n}
          {kind === "bed" && <Bed size={14} strokeWidth={1.75} aria-hidden="true" />}
          {kind === "fork" && <Utensils size={14} strokeWidth={1.75} aria-hidden="true" />}
        </span>
      </div>
    </div>
  );
}
