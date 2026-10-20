import { useLayoutEffect, useRef, useState } from "react";
import { BedDouble, Plane, Utensils, Compass, Star } from "lucide-react";
import { hero } from "../content/site";
import { credit, legs as legText, stops } from "../content/itinerary";
import mapData from "../generated/map-points.json";
import { WaitlistForm } from "./WaitlistForm";

const chipIcons = {
  Stays: BedDouble,
  Flights: Plane,
  Eats: Utensils,
  "Things to do": Compass,
  Reviews: Star,
};

const PAD = 0.2;
const MAP_W = mapData.width;
const MAP_H = mapData.height;
const POINTS = mapData.points as Record<string, { x: number; y: number }>;
const PILL_EDGE = 12;

type Pt = { x: number; y: number };

/** Same fit as scripts/build-og.mjs: the 3 stops with 20% padding, filling the box. */
function fit(w: number, h: number) {
  const raw = stops.map((s) => POINTS[s.at]);
  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const bw = Math.max(...xs) - Math.min(...xs);
  const bh = Math.max(...ys) - Math.min(...ys);
  const k = Math.min(w / (bw * (1 + 2 * PAD)), h / (bh * (1 + 2 * PAD)));
  const vw = w / k;
  const vh = h / k;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const vx = Math.min(Math.max(cx - vw / 2, 0), MAP_W - vw);
  const vy = Math.min(Math.max(cy - vh / 2, 0), MAP_H - vh);
  const pts: Pt[] = raw.map((p) => ({ x: (p.x - vx) * k, y: (p.y - vy) * k }));
  return { k, vx, vy, pts };
}

function curve(a: Pt, b: Pt) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const c = { x: mx - (b.y - a.y) * 0.14, y: my + (b.x - a.x) * 0.14 };
  return {
    d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
    mid: { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y },
  };
}

function HeroMap() {
  const box = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pillW, setPillW] = useState<number[]>([0, 0]);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const next = pillRefs.current.map((p) => p?.offsetWidth ?? 0);
    setPillW((prev) => (prev.every((v, i) => v === next[i]) ? prev : next));
  }, [size.w]);

  const f = size.w > 0 && size.h > 0 ? fit(size.w, size.h) : null;
  const lines = f ? [curve(f.pts[0], f.pts[1]), curve(f.pts[1], f.pts[2])] : [];

  return (
    <div className="hero-map" ref={box}>
      {f && (
        <div className="hero-art" aria-hidden="true">
          <picture>
            <source type="image/webp" srcSet="/map/lisbon-1600.webp 1x, /map/lisbon-3200.webp 2x" />
            <img
              className="hero-map-img"
              src="/map/lisbon-1600.webp"
              alt=""
              width={MAP_W}
              height={MAP_H}
              style={{ width: MAP_W * f.k, height: MAP_H * f.k, left: -f.vx * f.k, top: -f.vy * f.k }}
              decoding="async"
              fetchPriority="high"
            />
          </picture>
          <svg className="hero-legs" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`}>
            <defs>
              {lines.map((l, i) => (
                <mask key={i} id={`hero-leg-mask-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={size.w} height={size.h}>
                  <path className="hero-leg-reveal" style={{ ["--i" as string]: i }} d={l.d} pathLength={1} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
                </mask>
              ))}
            </defs>
            {lines.map((l, i) => (
              <g key={i} mask={`url(#hero-leg-mask-${i})`}>
                <path d={l.d} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
                <path d={l.d} fill="none" stroke="#0B0B0C" strokeWidth={3} strokeLinecap="round" strokeDasharray="2 9" />
              </g>
            ))}
          </svg>
          {stops.map((s, i) => (
            <span key={s.id} className="hero-pin" style={{ left: f.pts[i].x, top: f.pts[i].y, ["--i" as string]: i }}>
              <span className="hero-pin-inner">
                <img src={`/images/${s.photo}-th.webp`} alt="" width={72} height={72} loading="eager" decoding="async" />
                <b className="hero-badge">{s.n}</b>
              </span>
            </span>
          ))}
          {lines.map((l, i) => {
            const half = (pillW[i] || 0) / 2;
            const x = Math.min(Math.max(l.mid.x, half + PILL_EDGE), Math.max(size.w - half - PILL_EDGE, half + PILL_EDGE));
            return (
              <span
                key={i}
                ref={(el) => {
                  pillRefs.current[i] = el;
                }}
                className="hero-pill glass"
                style={{ left: x, top: l.mid.y, ["--i" as string]: i }}
              >
                {legText[i].text}
              </span>
            );
          })}
        </div>
      )}
      <a className="map-credit" href={credit.href} target="_blank" rel="noopener noreferrer">
        {credit.text}
      </a>
    </div>
  );
}

export function Hero() {
  return (
    <section className="wrap hero" aria-labelledby="hero-title">
      <div className="hero-card">
        <div className="hero-words">
          <h1 id="hero-title">
            <span>{hero.headline[0]}</span> <span>{hero.headline[1]}</span>
          </h1>
          <p className="hero-sub">{hero.subline}</p>
          <WaitlistForm className="hero-form" />
          <p className="note">{hero.note}</p>
        </div>
        <HeroMap />
      </div>
      <ul className="chips hero-chips" aria-label="What you can plan">
        {hero.chips.map((c) => {
          const Icon = chipIcons[c];
          return (
            <li key={c} className="chip">
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" /> {c}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
