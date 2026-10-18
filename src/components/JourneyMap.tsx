import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Footprints, TramFront } from "lucide-react";
import { credit, dinner, legs, stay, stops, type PointKey } from "../content/itinerary";
import { journey } from "../content/site";
import { MapCanvas, points, type Size, type XY } from "./MapCanvas";
import { overlaps, placeCard, useMedia, type Rect } from "./mapUi";

const thumb = (name: string) => `/images/${name}-th.webp`;
const legIcons = { tram: TramFront, walk: Footprints };

type Place = { id: string; at: PointKey; name: string; photo: string; detail: string; day?: number; n?: number };

// Day 1 is the stay, Day 2 runs through the three stops, Day 3 is dinner at the market.
const route: Place[] = [
  { id: stay.id, at: stay.at, name: stay.name, photo: stay.photo, detail: stay.label, day: 1 },
  ...stops.map((s) => ({ id: s.id, at: s.at, name: s.name, photo: s.photo, detail: s.reason, n: s.n })),
  { id: dinner.id, at: dinner.at, name: dinner.name, photo: dinner.photo, detail: dinner.label, day: 3 },
];
const fit = route.map((p) => points[p.at]);

/** Bend of each leg as a share of its length; the signs alternate so the path winds like a level map. */
const BENDS = [0.3, 0.3, -0.2, 0.55];
/** Where the Day 2 checkpoint sits on the first leg, and the legs that carry the travel pills. */
const DAY2_T = 0.55;
const PILL_LEGS = [1, 2];
const STAGGER_MS = 400;

type Curve = { a: XY; c: XY; b: XY };
const curve = (a: XY, b: XY, bend: number): Curve => ({
  a,
  b,
  c: { x: (a.x + b.x) / 2 - (b.y - a.y) * bend, y: (a.y + b.y) / 2 + (b.x - a.x) * bend },
});
const pointOn = (q: Curve, t: number): XY => ({
  x: (1 - t) ** 2 * q.a.x + 2 * t * (1 - t) * q.c.x + t * t * q.b.x,
  y: (1 - t) ** 2 * q.a.y + 2 * t * (1 - t) * q.c.y + t * t * q.b.y,
});
const circleRect = (p: XY, r: number): Rect => ({ x: p.x - r, y: p.y - r, w: r * 2, h: r * 2 });
const inside = (b: Rect, size: Size) => b.x >= 8 && b.y >= 8 && b.x + b.w <= size.w - 8 && b.y + b.h <= size.h - 8;

/** First box near one of the anchors (points along a leg) that stays in the panel and clears the obstacles. */
function placeNear(anchors: XY[], w: number, h: number, obstacles: Rect[], size: Size, step: number): { rect: Rect; anchor: XY } {
  const dirs = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (let k = 1; k <= 8; k++)
    for (const anchor of anchors)
      for (const [dx, dy] of dirs) {
        const rect = { x: anchor.x - w / 2 + dx * step * k, y: anchor.y - h / 2 + dy * step * k, w, h };
        if (inside(rect, size) && !obstacles.some((o) => overlaps(rect, o))) return { rect, anchor };
      }
  const anchor = anchors[0];
  return {
    rect: { x: Math.min(Math.max(anchor.x - w / 2, 8), size.w - w - 8), y: Math.min(Math.max(anchor.y - h / 2, 8), size.h - h - 8), w, h },
    anchor,
  };
}

/** A thin line from a pill back to its leg when the pill had to move away from it. */
function leader(rect: Rect, to: XY) {
  const x = Math.min(Math.max(to.x, rect.x), rect.x + rect.w);
  const y = Math.min(Math.max(to.y, rect.y), rect.y + rect.h);
  return Math.hypot(to.x - x, to.y - y) > 12 ? { x1: x, y1: y, x2: to.x, y2: to.y } : null;
}

function placeLabel(c: XY, r: number, w: number, h: number, obstacles: Rect[], size: Size): Rect {
  const cx = Math.min(Math.max(c.x - w / 2, 8), size.w - 8 - w);
  const options: Rect[] = [
    { x: cx, y: c.y - r - 6 - h, w, h },
    { x: cx, y: c.y + r + 6, w, h },
    { x: c.x + r + 6, y: c.y - h / 2, w, h },
    { x: c.x - r - 6 - w, y: c.y - h / 2, w, h },
  ];
  return options.find((b) => inside(b, size) && !obstacles.some((o) => overlaps(b, o))) ?? options.find((b) => inside(b, size)) ?? options[0];
}

function RoutePath({ d, size, started, reduced }: { d: string; size: Size; started: boolean; reduced: boolean }) {
  const mask = useRef<SVGPathElement>(null);
  const played = useRef(false);
  const id = useId().replace(/:/g, "");
  useLayoutEffect(() => {
    const m = mask.current;
    if (!m) return;
    const len = m.getTotalLength();
    m.getAnimations().forEach((a) => a.cancel());
    m.style.strokeDasharray = `${len}`;
    if (!started && !reduced) {
      m.style.strokeDashoffset = `${len}`;
      return;
    }
    m.style.strokeDashoffset = "0";
    if (!reduced && !played.current) {
      played.current = true;
      m.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: (route.length + 1) * STAGGER_MS, easing: "ease-in-out" });
    }
  }, [d, started, reduced]);
  return (
    <svg className="jr-path" width={size.w} height={size.h} aria-hidden="true">
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width={size.w} height={size.h}>
        <path ref={mask} d={d} fill="none" stroke="#fff" strokeWidth="24" strokeLinecap="round" />
      </mask>
      <g mask={`url(#${id})`} fill="none">
        <path d={d} stroke="#fff" strokeOpacity="0.85" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke="#0B0B0C" strokeWidth="2" strokeDasharray="6 6" />
      </g>
    </svg>
  );
}

function Detail({ place, id, className, style }: { place: Place; id: string; className: string; style?: CSSProperties }) {
  return (
    <div id={id} className={`card jr-ui ${className}`} style={style}>
      <img src={thumb(place.photo)} alt={journey.photoAlt[place.photo] ?? ""} width={320} height={200} decoding="async" />
      <div>
        <p className="pcard-name">{place.name}</p>
        <span className="pcard-tag">{place.detail}</span>
      </div>
    </div>
  );
}

export default function JourneyMap() {
  const panel = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLLIElement | null)[]>([]);
  const detailId = useId().replace(/:/g, "") + "-detail";
  const [started, setStarted] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [pillSizes, setPillSizes] = useState<Size[]>(() => legs.map((l) => ({ w: l.text.length * 7 + 52, h: 28 })));

  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const mobile = useMedia("(max-width: 767px)");
  const R = mobile ? { day: 18, stop: 17 } : { day: 24, stop: 22 };

  // Draw the path once the panel is 30% visible.
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

  // The pills wrap on phones, so place them by their real size.
  useLayoutEffect(() => {
    const next = pillRefs.current.map((el, i) => (el ? { w: el.offsetWidth, h: el.offsetHeight } : pillSizes[i]));
    if (next.some((s, i) => Math.abs(s.w - pillSizes[i].w) > 0.5 || Math.abs(s.h - pillSizes[i].h) > 0.5)) setPillSizes(next);
  });

  // Outside tap or Escape closes the details card.
  useEffect(() => {
    if (sel === null) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.(".jr-ui")) setSel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSel(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [sel]);

  const selected = route.find((p) => p.id === sel);
  const radius = (p: Place) => (p.day ? R.day : R.stop);
  const open = (id: string) => setSel(id);

  return (
    <div className="journey">
      <div ref={panel} className={`map-panel journey-panel ${started || reduced ? "jr-go" : ""}`} role="group" aria-label={journey.label}>
        <MapCanvas fit={fit} pins={[]} animate={false}>
          {({ toPx, size }) => {
            // Screen positions; a checkpoint sitting on top of a nearby pin is pushed clear of it.
            const pos = route.map((p) => toPx(points[p.at]));
            route.forEach((p, i) => {
              if (!p.day) return;
              route.forEach((q, j) => {
                if (i === j) return;
                const need = radius(p) + radius(q) + 10;
                const dx = pos[i].x - pos[j].x;
                const dy = pos[i].y - pos[j].y;
                const dist = Math.hypot(dx, dy);
                if (dist > 0 && dist < need) pos[i] = { x: pos[j].x + (dx / dist) * need, y: pos[j].y + (dy / dist) * need };
              });
              const r = radius(p) + 8;
              pos[i] = { x: Math.min(Math.max(pos[i].x, r), size.w - r), y: Math.min(Math.max(pos[i].y, r), size.h - r) };
            });

            const curves = pos.slice(1).map((b, i) => curve(pos[i], b, BENDS[i] ?? 0));
            const d = curves.reduce(
              (acc, q) => `${acc} Q${q.c.x.toFixed(1)} ${q.c.y.toFixed(1)} ${q.b.x.toFixed(1)} ${q.b.y.toFixed(1)}`,
              `M${pos[0].x.toFixed(1)} ${pos[0].y.toFixed(1)}`,
            );
            const day2 = pointOn(curves[0], DAY2_T);

            const obstacles: Rect[] = [...route.map((p, i) => circleRect(pos[i], radius(p))), circleRect(day2, R.day)];
            obstacles.push({ x: size.w - 12 - 215, y: size.h - 8 - 20, w: 215, h: 20 }); // map credit

            const labelSize = { w: 52, h: 22 };
            const labels = new Map<number, Rect>();
            const days = [...route.flatMap((p, i) => (p.day ? [{ day: p.day, c: pos[i] }] : [])), { day: 2, c: day2 }];
            days.forEach(({ day, c }) => {
              const rect = placeLabel(c, R.day, labelSize.w, labelSize.h, obstacles, size);
              labels.set(day, rect);
              obstacles.push(rect);
            });

            const placed = PILL_LEGS.map((leg, i) => {
              const anchors = [0.5, 0.35, 0.65].map((t) => pointOn(curves[leg], t));
              const spot = placeNear(anchors, pillSizes[i].w, pillSizes[i].h, obstacles, size, mobile ? 12 : 14);
              obstacles.push(spot.rect);
              return spot;
            });
            const pills = placed.map((p) => p.rect);
            const leaders = placed.flatMap((p) => leader(p.rect, p.anchor) ?? []);

            let cardRect: Rect | null = null;
            if (selected && !mobile) {
              const i = route.indexOf(selected);
              const lines = Math.max(1, Math.ceil(selected.name.length / 24));
              const h = 8 + 128 + 8 + lines * 19 + 17 + 8;
              const others = obstacles.filter((o) => !overlaps(o, circleRect(pos[i], radius(selected)), -1));
              cardRect = placeCard(pos[i], radius(selected), 220, h, others, size);
            }

            const label = (day: number, c: XY, r: number) => {
              const rect = labels.get(day)!;
              return (
                <span className="jr-label" style={{ left: rect.x - (c.x - r), top: rect.y - (c.y - r) }}>
                  {journey.day(day)}
                </span>
              );
            };
            const nodeStyle = (c: XY, r: number, order: number) =>
              ({ left: c.x - r, top: c.y - r, width: r * 2, height: r * 2, "--d": `${order * STAGGER_MS}ms` }) as CSSProperties;

            const items: JSX.Element[] = [];
            route.forEach((p, i) => {
              const r = radius(p);
              const button = {
                type: "button" as const,
                "aria-expanded": sel === p.id,
                "aria-controls": sel === p.id ? detailId : undefined,
                onFocus: () => open(p.id),
                onClick: () => open(p.id),
                onPointerEnter: (e: ReactPointerEvent) => e.pointerType === "mouse" && open(p.id),
              };
              items.push(
                <li key={p.id} className="jr-node" style={nodeStyle(pos[i], r, i + (i > 0 ? 1 : 0))}>
                  {p.day ? (
                    <button {...button} className="jr-day jr-hit jr-ui" aria-label={`${journey.day(p.day)}, ${p.name}`}>
                      <span aria-hidden="true">{p.day}</span>
                      {label(p.day, pos[i], r)}
                    </button>
                  ) : (
                    <button {...button} className="jr-pin jr-hit jr-ui" aria-label={`${p.n}. ${p.name}`}>
                      <img src={thumb(p.photo)} alt="" width={64} height={64} decoding="async" />
                      <span className="jr-num" aria-hidden="true">
                        {p.n}
                      </span>
                    </button>
                  )}
                </li>,
              );
              if (i === 0)
                items.push(
                  <li key="day2" className="jr-node" style={nodeStyle(day2, R.day, 1)}>
                    <span className="jr-day">
                      <span aria-hidden="true">2</span>
                      {label(2, day2, R.day)}
                    </span>
                  </li>,
                );
              const pill = PILL_LEGS.indexOf(i);
              if (pill >= 0) {
                const l = legs[pill];
                const Icon = legIcons[l.icon];
                items.push(
                  <li
                    key={l.text}
                    ref={(el) => {
                      pillRefs.current[pill] = el;
                    }}
                    className="leg-chip jr-pill"
                    style={{ left: pills[pill].x, top: pills[pill].y, "--d": `${(i + 1.5) * STAGGER_MS}ms` } as CSSProperties}
                  >
                    <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
                    <span>{l.text}</span>
                  </li>,
                );
              }
            });

            return (
              <>
                <RoutePath d={d} size={size} started={started} reduced={reduced} />
                {leaders.length > 0 && (
                  <svg className="leaders jr-leaders" aria-hidden="true">
                    {leaders.map((l) => (
                      <line key={`${l.x2},${l.y2}`} {...l} stroke="#0B0B0C" strokeWidth="1" />
                    ))}
                  </svg>
                )}
                <ol className="jr-nodes">{items}</ol>
                {selected && cardRect && (
                  <Detail place={selected} id={detailId} className="jr-card" style={{ left: cardRect.x, top: cardRect.y, width: cardRect.w }} />
                )}
              </>
            );
          }}
        </MapCanvas>
        <a className="map-credit" href={credit.href} target="_blank" rel="noopener noreferrer">
          {credit.text}
        </a>
      </div>
      {mobile && selected && <Detail place={selected} id={detailId} className="jr-sheet" />}
    </div>
  );
}
