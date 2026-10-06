import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Footprints, TramFront } from "lucide-react";
import { credit, dinner, legs as legInfo, panelText, preferences, stay, stops } from "../content/itinerary";
import { MapCanvas, legMid, points, type LegData, type LegState, type PinData, type Size } from "./MapCanvas";

const thumb = (name: string) => `/images/${name}-sm.webp`;
const CARD_OPEN_MS = 1600;
const CARD_SHRINK_MS = 300;

const legIcons = { tram: TramFront, walk: Footprints };
const dayFit = [points.chiado, points.lanes, points.graca];
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

export function Itinerary({ active }: { active: number }) {
  const panel = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [started, setStarted] = useState(false);
  const [chips, setChips] = useState(0);
  const [pins, setPins] = useState(0);
  const [rows, setRows] = useState(0);
  const [cards, setCards] = useState<{ i: number; closing: boolean }[]>([]);
  const [legStates, setLegStates] = useState<LegState[]>(["hidden", "hidden"]);
  const [legChips, setLegChips] = useState(0);
  const [extra, setExtra] = useState(0);
  const [foot, setFoot] = useState(false);
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
    };

    if (reduced) {
      reset();
      if (active === 0) {
        setChips(preferences.length);
        setPins(stops.length);
        setRows(stops.length);
      } else if (active === 1) {
        setPins(stops.length);
        setRows(stops.length);
        setLegStates(["drawn", "drawn"]);
        setLegChips(legInfo.length);
        setFoot(true);
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
    } else if (active === 1) {
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
      });
    } else {
      panelText.bookings.forEach((_, i) => at(1000 + i * 400, () => setRows(i + 1)));
      at(1000, () => setExtra(1));
      at(1500, () => setExtra(2));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active, started, reduced]);

  const animate = !reduced;
  const stopPin = (i: number, drop: boolean): PinData => ({
    key: stops[i].id,
    at: points[stops[i].at],
    photo: stops[i].photo,
    n: stops[i].n,
    drop,
  });

  let pinList: PinData[];
  if (active === 2) {
    const extras = [stay, dinner].slice(0, extra).map((e) => ({ key: e.id, at: points[e.at], photo: e.photo, icon: e.icon, drop: true }));
    pinList = [stopPin(2, false), ...extras];
  } else {
    pinList = stops.slice(0, pins).map((_, i) => stopPin(i, true));
  }

  const legList: LegData[] =
    active === 1
      ? [
          { key: "leg1", a: points.chiado, b: points.lanes, state: legStates[0] },
          { key: "leg2", a: points.lanes, b: points.graca, state: legStates[1] },
        ]
      : [];

  const reserve = mobile ? { right: 0, bottom: cardH + 48 } : { right: 348, bottom: 0 };

  return (
    <div ref={panel} className="map-panel" role="group" aria-label="Itinerary preview">
      <MapCanvas
        fit={active === 2 ? bookFit : dayFit}
        reserve={reserve}
        pins={pinList}
        legs={legList}
        animate={animate}
        onSize={setSize}
      >
        {({ toPx, size }) => (
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
                      {"sub" in l && l.sub && <span className="leg-sub">{l.sub}</span>}
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
          </>
        )}
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
                      {"sub" in legInfo[i] ? `, ${(legInfo[i] as { sub: string }).sub}` : ""}
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
