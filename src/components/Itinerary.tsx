import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Footprints, TramFront } from "lucide-react";
import {
  credit,
  dayCardTravel,
  dinner,
  legs as legInfo,
  panelText,
  preferences,
  recText,
  recommendedTitle,
  stay,
  stops,
} from "../content/itinerary";
import { MapCanvas, legMid, points, type LegData, type LegState, type PinData, type Size, type XY } from "./MapCanvas";
import { recIcons, recPin, recs, type Rec } from "./recs";

const thumb = (name: string) => `/images/${name}-sm.webp`;
const CARD_OPEN_MS = 1600;
const CARD_SHRINK_MS = 300;
const REC_STAGGER_MS = 120;

const legIcons = { tram: TramFront, walk: Footprints };
const stopFit = [points.chiado, points.lanes, points.graca];
const dayFit = [...stopFit, ...recs.map((r) => r.at)];
const bookFit = [points.stay, points.market, points.graca];

function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof matchMedia === "function" && matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

type Rect = { x: number; y: number; w: number; h: number };
const overlaps = (a: Rect, b: Rect, pad = 4) =>
  a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

/** Pick right, left, above, then below: the first box that clears every obstacle and the panel edge. */
function placeCard(pin: XY, r: number, w: number, h: number, obstacles: Rect[], bounds: Size): Rect {
  const gap = 16;
  const options: Rect[] = [
    { x: pin.x + r + gap, y: pin.y - h / 2, w, h },
    { x: pin.x - r - gap - w, y: pin.y - h / 2, w, h },
    { x: pin.x - w / 2, y: pin.y - r - gap - h, w, h },
    { x: pin.x - w / 2, y: pin.y + r + gap, w, h },
  ];
  const inside = (b: Rect) => b.x >= 8 && b.y >= 8 && b.x + b.w <= bounds.w - 8 && b.y + b.h <= bounds.h - 8;
  return options.find((b) => inside(b) && !obstacles.some((o) => overlaps(b, o))) ?? options.find(inside) ?? options[0];
}

function leaderPoints(card: Rect, pin: XY, r: number) {
  const ax = Math.min(Math.max(pin.x, card.x), card.x + card.w);
  const ay = Math.min(Math.max(pin.y, card.y), card.y + card.h);
  const dx = pin.x - ax;
  const dy = pin.y - ay;
  const len = Math.hypot(dx, dy) || 1;
  return { x1: ax, y1: ay, x2: pin.x - (dx / len) * r, y2: pin.y - (dy / len) * r };
}

const nameLines = (text: string, perLine: number) => Math.max(1, Math.ceil(text.length / perLine));

function RecThumb({ rec, size }: { rec: Rec; size: number }) {
  const Icon = recIcons[rec.icon];
  return rec.photo ? (
    <img className="thumb" style={{ width: size, height: size }} src={thumb(rec.photo)} alt="" loading="lazy" />
  ) : (
    <span className="thumb thumb-icon" style={{ width: size, height: size }}>
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}

export function Itinerary({ active, onHold }: { active: number; onHold?: (held: boolean) => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef(0);
  const openBy = useRef<"hover" | "click">("click");

  const [started, setStarted] = useState(false);
  const [chips, setChips] = useState(0);
  const [pins, setPins] = useState(0);
  const [rows, setRows] = useState(0);
  const [cards, setCards] = useState<{ i: number; closing: boolean }[]>([]);
  const [legStates, setLegStates] = useState<LegState[]>(["hidden", "hidden"]);
  const [legChips, setLegChips] = useState(0);
  const [extra, setExtra] = useState(0);
  const [foot, setFoot] = useState(false);
  const [recShown, setRecShown] = useState(0);
  const [dayCards, setDayCards] = useState(false);
  const [openRec, setOpenRec] = useState<string | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [cardH, setCardH] = useState(0);
  const [, setSize] = useState<Size>({ w: 0, h: 0 });

  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const mobile = useMedia("(max-width: 767px)");

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

  // Measure the side card so the map can keep clear of it on small screens.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight));
    ro.observe(el);
    setCardH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  // The sequence for each tab. It replays whenever the tab changes.
  useLayoutEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const reset = () => {
      setChips(0);
      setPins(0);
      setRows(0);
      setCards([]);
      setLegStates(["hidden", "hidden"]);
      setLegChips(0);
      setExtra(0);
      setFoot(false);
      setRecShown(0);
      setDayCards(false);
      setOpenRec(null);
    };

    if (reduced) {
      reset();
      if (active === 0) {
        setChips(preferences.length);
        setPins(stops.length);
        setRows(stops.length);
        setRecShown(recs.length);
      } else if (active === 1) {
        setPins(stops.length);
        setRows(stops.length);
        setLegStates(["drawn", "drawn"]);
        setLegChips(legInfo.length);
        setFoot(true);
        setRecShown(recs.length);
        setDayCards(true);
      } else {
        setRows(panelText.bookings.length);
        setExtra(2);
      }
      return;
    }

    reset();
    if (!started && active === 0) return;

    if (active === 0) {
      preferences.forEach((_, i) => at(i * 300, () => setChips(i + 1)));
      stops.forEach((_, i) => {
        const t = 1200 + i * 600;
        at(t, () => {
          setPins(i + 1);
          setRows(i + 1);
          setCards((c) => [...c, { i, closing: false }]);
        });
        at(t + CARD_OPEN_MS, () => setCards((c) => c.map((x) => (x.i === i ? { ...x, closing: true } : x))));
        at(t + CARD_OPEN_MS + CARD_SHRINK_MS, () => setCards((c) => c.filter((x) => x.i !== i)));
      });
      const landed = 1200 + (stops.length - 1) * 600 + 700;
      recs.forEach((_, i) => at(landed + i * REC_STAGGER_MS, () => setRecShown(i + 1)));
    } else if (active === 1) {
      setRecShown(recs.length);
      stops.forEach((_, i) =>
        at(i * 200, () => {
          setPins(i + 1);
          setRows(i + 1);
        }),
      );
      at(1000, () => setLegStates(["drawing", "hidden"]));
      at(2200, () => {
        setLegStates(["drawn", "drawing"]);
        setLegChips(1);
      });
      at(3400, () => {
        setLegStates(["drawn", "drawn"]);
        setLegChips(2);
        setFoot(true);
        setDayCards(true);
      });
    } else {
      panelText.bookings.forEach((_, i) => at(1000 + i * 400, () => setRows(i + 1)));
      at(1000, () => setExtra(1));
      at(1500, () => setExtra(2));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active, started, reduced]);

  // A recommendation card holds the tab auto-advance; outside click or Escape closes it.
  useEffect(() => {
    onHold?.(openRec !== null);
    if (openRec === null) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.(".rec-ui")) setOpenRec(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenRec(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openRec, onHold]);

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      if (openBy.current === "hover") setOpenRec(null);
    }, 250);
  };

  const animate = !reduced;
  const stopPin = (i: number, drop: boolean): PinData => ({
    key: stops[i].id,
    at: points[stops[i].at],
    photo: stops[i].photo,
    n: stops[i].n,
    drop,
  });

  const recTarget = active === 0 ? 0.85 : active === 1 ? 0.45 : 0;
  const recPins: PinData[] = recs.map((r, i) => recPin(r, i < recShown ? recTarget : 0, added.includes(r.id)));

  let pinList: PinData[];
  if (active === 2) {
    const extras = [stay, dinner].slice(0, extra).map((e) => ({ key: e.id, at: points[e.at], photo: e.photo, icon: e.icon, drop: true }));
    pinList = [...recPins, stopPin(2, false), ...extras];
  } else {
    pinList = [...recPins, ...stops.slice(0, pins).map((_, i) => stopPin(i, true))];
  }

  const legList: LegData[] =
    active === 1
      ? [
          { key: "leg1", a: points.chiado, b: points.lanes, state: legStates[0] },
          { key: "leg2", a: points.lanes, b: points.graca, state: legStates[1] },
        ]
      : [];

  const reserve = mobile ? { right: 0, bottom: cardH + 48 } : { right: 348, bottom: 0 };
  const recsVisible = active !== 2;

  return (
    <div ref={panel} className="map-panel" role="group" aria-label="Itinerary preview">
      <MapCanvas fit={active === 2 ? bookFit : dayFit} reserve={reserve} pins={pinList} legs={legList} animate={animate} onSize={setSize}>
        {({ toPx, size }) => {
          // day photo cards: placed clear of pins, chips, the side card and each other
          const dayBoxes: { rect: Rect; pin: XY; i: number }[] = [];
          if (active === 1 && dayCards && !mobile) {
            const obstacles: Rect[] = [];
            stops.forEach((s) => {
              const p = toPx(points[s.at]);
              obstacles.push({ x: p.x - 26, y: p.y - 26, w: 52, h: 52 });
            });
            recs.forEach((r) => {
              const p = toPx(r.at);
              obstacles.push({ x: p.x - 18, y: p.y - 18, w: 36, h: 36 });
            });
            obstacles.push({ x: size.w - 24 - 300, y: 24, w: 300, h: cardH });
            legInfo.forEach((_, i) => {
              const m = toPx(legMid(legList[i].a, legList[i].b));
              obstacles.push({ x: m.x - 85, y: m.y - 20, w: 170, h: 40 });
            });
            stops.forEach((s, i) => {
              const pin = toPx(points[s.at]);
              const travel = dayCardTravel[i];
              const h = 16 + 72 + 6 + nameLines(s.name, 17) * 17 + (travel ? nameLines(travel, 19) * 17 + 2 : 0);
              const rect = placeCard(pin, 26, 128, h, obstacles, size);
              dayBoxes.push({ rect, pin, i });
              obstacles.push(rect);
            });
          }

          const open = openRec ? recs.find((r) => r.id === openRec) : undefined;
          let openStyle: { left: number; top: number } | null = null;
          if (open) {
            const p = toPx(open.at);
            const w = 188;
            const left = Math.min(Math.max(p.x > size.w * 0.5 ? p.x - 26 - w : p.x + 26, 8), size.w - w - 8);
            openStyle = { left, top: Math.min(Math.max(p.y - 70, 8), size.h - 200) };
          }

          return (
            <>
              {active === 0 && (
                <ul className="pref-chips">
                  {preferences.map((p, i) => (
                    <li key={p} className={`chip ${i < chips ? "show" : ""}`}>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
              {active === 0 &&
                cards.map(({ i, closing }) => {
                  const s = stops[i];
                  const p = toPx(points[s.at]);
                  const left = p.x > size.w * 0.5;
                  return (
                    <div key={s.id} className="pcard-pos" style={{ left: left ? p.x - 34 - 180 : p.x + 34, top: p.y }}>
                      <div className={`pcard card ${left ? "to-left" : ""} ${closing ? "closing" : ""}`}>
                        <img src={thumb(s.photo)} alt="" />
                        <p className="pcard-name">{s.name}</p>
                        <span className="pcard-tag">{s.reason}</span>
                      </div>
                    </div>
                  );
                })}
              {active === 1 && dayBoxes.length > 0 && (
                <svg className="leaders" aria-hidden="true">
                  {dayBoxes.map(({ rect, pin, i }) => {
                    const l = leaderPoints(rect, pin, 26);
                    return <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#0B0B0C" strokeWidth="1" />;
                  })}
                </svg>
              )}
              {active === 1 &&
                dayBoxes.map(({ rect, i }) => (
                  <div key={stops[i].id} className="daycard card" style={{ left: rect.x, top: rect.y, width: rect.w }}>
                    <img src={thumb(stops[i].photo)} alt="" />
                    <p className="daycard-name">{stops[i].name}</p>
                    {dayCardTravel[i] && <span className="daycard-travel">{dayCardTravel[i]}</span>}
                  </div>
                ))}
              {active === 1 &&
                legInfo.map((l, i) => {
                  if (i >= legChips) return null;
                  const m = toPx(legMid(legList[i].a, legList[i].b));
                  const Icon = legIcons[l.icon];
                  return (
                    <div key={l.text} className="leg-chip" style={{ left: m.x, top: m.y }}>
                      <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
                      <span>
                        {l.text}
                        {l.sub && <span className="leg-sub">{l.sub}</span>}
                      </span>
                    </div>
                  );
                })}
              {active === 2 &&
                [stay, dinner].slice(0, extra).map((e) => {
                  const p = toPx(points[e.at]);
                  return (
                    <div key={e.id} className="pin-chip" style={{ left: p.x, top: p.y - 36 }}>
                      {e.label}
                    </div>
                  );
                })}
              {recsVisible &&
                recs.map((r, i) => {
                  if (i >= recShown) return null;
                  const p = toPx(r.at);
                  const d = 36;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className="rec-hit rec-ui"
                      style={{ left: p.x - d / 2, top: p.y - d / 2, width: d, height: d }}
                      aria-label={`${r.name}, ${recText.recommended}`}
                      aria-expanded={openRec === r.id}
                      onPointerEnter={(e) => {
                        if (e.pointerType !== "mouse") return;
                        cancelClose();
                        openBy.current = "hover";
                        setOpenRec(r.id);
                      }}
                      onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
                      onClick={() => {
                        cancelClose();
                        if (openRec === r.id && openBy.current === "hover") {
                          openBy.current = "click";
                          return;
                        }
                        openBy.current = "click";
                        setOpenRec(openRec === r.id ? null : r.id);
                      }}
                    />
                  );
                })}
              {open && openStyle && (
                <div
                  className="rec-card rec-ui card"
                  style={openStyle}
                  onPointerEnter={cancelClose}
                  onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
                >
                  {open.photo ? (
                    <img src={thumb(open.photo)} alt="" />
                  ) : (
                    <span className="rec-card-icon">
                      {(() => {
                        const Icon = recIcons[open.icon];
                        return <Icon size={28} strokeWidth={1.5} aria-hidden="true" />;
                      })()}
                    </span>
                  )}
                  <p className="pcard-name">{open.name}</p>
                  <span className="pcard-tag">{open.reason}</span>
                  <span className="pcard-tag">{recText.walk(open.minutes)}</span>
                  <button
                    type="button"
                    className={`pill add-pill ${added.includes(open.id) ? "done" : ""}`}
                    onClick={() => setAdded((a) => (a.includes(open.id) ? a : [...a, open.id]))}
                  >
                    {added.includes(open.id) ? (
                      <>
                        <Check size={12} strokeWidth={2.5} aria-hidden="true" /> {recText.added}
                      </>
                    ) : (
                      recText.add
                    )}
                  </button>
                </div>
              )}
            </>
          );
        }}
      </MapCanvas>

      <div ref={cardRef} className="itin-card card" aria-live="polite">
        {active === 0 && (
          <>
            <p className="card-title">{panelText.styleTitle}</p>
            <ul className="itin-rows">
              {stops.map((s, i) => (
                <li key={s.id} className={`itin-row thumb-row ${i < rows ? "show" : ""}`}>
                  <img className="thumb thumb-40" src={thumb(s.photo)} alt="" loading="lazy" />
                  <span className="itin-text">
                    <span className="itin-place">{s.name}</span>
                    <span className="itin-note">{s.reason}</span>
                  </span>
                </li>
              ))}
            </ul>
            {recs.length > 0 && (
              <div className="itin-more">
                <p className="card-title">{recommendedTitle}</p>
                <ul className="itin-rows">
                  {recs.slice(0, 3).map((r, i) => (
                    <li key={r.id} className={`itin-row thumb-row ${i < recShown ? "show" : ""}`}>
                      <RecThumb rec={r} size={40} />
                      <span className="itin-text">
                        <span className="itin-place">{r.name}</span>
                        <span className="itin-note">{r.reason}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        {active === 1 && (
          <>
            <p className="card-title">{panelText.dayTitle}</p>
            <ul className="itin-rows timeline">
              {stops.map((s, i) => (
                <li key={s.id} className="timeline-item">
                  <div className={`itin-row thumb-row ${i < rows ? "show" : ""}`}>
                    <img className="thumb thumb-44" src={thumb(s.photo)} alt="" loading="lazy" />
                    <span className="itin-text">
                      <span className="itin-place">{s.name}</span>
                      <span className="itin-time">{s.when}</span>
                      <span className="itin-note">{s.stay}</span>
                    </span>
                  </div>
                  {i < legInfo.length && (
                    <p className={`itin-travel ${i < legChips ? "show" : ""}`}>
                      {legInfo[i].text}
                      {legInfo[i].sub ? `, ${legInfo[i].sub}` : ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <p className={`itin-foot ${foot ? "show" : ""}`}>{panelText.dayFooter}</p>
          </>
        )}
        {active === 2 && (
          <>
            <p className="card-title">{panelText.bookingsTitle}</p>
            <ul className="itin-rows">
              {panelText.bookings.map((b, i) => (
                <li key={b.place} className={`itin-row book-row ${i < rows ? "show" : ""}`}>
                  <span className="itin-text">
                    <span className="itin-place">{b.place}</span>
                    <span className="itin-note">{b.note}</span>
                  </span>
                  <span className="pill">{panelText.confirmed}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <a className="map-credit" href={credit.href} target="_blank" rel="noopener noreferrer">
        {credit.text}
      </a>
    </div>
  );
}
