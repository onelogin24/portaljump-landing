import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { story, type StoryStep } from "../content/site";
import { MapPanel } from "./MapPanel";

const INTERVAL_MS = 6000;

function StoryCard({ step }: { step: StoryStep }) {
  const { card } = step;
  return (
    <div className="story-card">
      {card.kind === "list" ? (
        <ul className="card ui-card list-card">
          {card.items.map((i) => (
            <li key={i}>
              <span className="tick">
                <Check size={12} strokeWidth={2.5} aria-hidden="true" />
              </span>
              {i}
            </li>
          ))}
        </ul>
      ) : (
        <div className="card ui-card">
          <p className="card-title">{card.title}</p>
          <p className="card-text">{card.text}</p>
        </div>
      )}
      {step.chips && (
        <ul className="chips left">
          {step.chips.map((c) => (
            <li key={c} className="chip">
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Story() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = story.steps.length;

  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (paused || stopped || reduced) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % count), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [active, paused, stopped, reduced, count]);

  function choose(i: number) {
    setStopped(true);
    setActive(i);
  }

  function onKeyDown(e: KeyboardEvent) {
    let next = -1;
    if (e.key === "ArrowRight") next = (active + 1) % count;
    else if (e.key === "ArrowLeft") next = (active - 1 + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    if (next < 0) return;
    e.preventDefault();
    choose(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section
      className="section wrap story"
      aria-labelledby={`story-title-${active}`}
      data-reveal
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="tabs" role="tablist" aria-label="How it works" onKeyDown={onKeyDown}>
        {story.steps.map((s, i) => (
          <button
            key={s.tab}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${i}`}
            aria-selected={active === i}
            aria-controls="story-panel"
            tabIndex={active === i ? 0 : -1}
            className="tab"
            onClick={() => choose(i)}
          >
            {s.tab}
          </button>
        ))}
      </div>
      <div className="slides">
        {story.steps.map((s, i) => (
          <div key={s.tab} aria-hidden={active !== i} className={`slide ${active === i ? "active" : ""}`}>
            <h2 className="h-lg" id={`story-title-${i}`}>
              {s.headline[0]} <span className="soft">{s.headline[1]}</span>
            </h2>
            <p className="body">{s.body}</p>
          </div>
        ))}
      </div>
      <div id="story-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
        <MapPanel active={active}>
          {story.steps.map((s, i) => (
            <div key={s.tab} aria-hidden={active !== i} className={`slide story-overlay ${active === i ? "active" : ""}`}>
              <StoryCard step={s} />
            </div>
          ))}
        </MapPanel>
      </div>
    </section>
  );
}
