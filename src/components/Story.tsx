import { Check } from "lucide-react";
import { story, type StoryStep } from "../content/site";
import { Photo } from "./Photo";

function StoryCard({ card }: { card: StoryStep["card"] }) {
  if (card.kind === "list") {
    return (
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
    );
  }
  return <p className="card ui-card">{card.text}</p>;
}

export function Story() {
  return (
    <section className="section wrap" aria-labelledby="story-title" data-reveal>
      <p className="tag" id="story-title">
        {story.tag}
      </p>
      <div className="story-rows">
        {story.steps.map((s, i) => (
          <div key={s.image} className={`story-row ${i % 2 === 1 ? "flip" : ""}`}>
            <div className="story-text">
              <h2 className="h-lg">
                {s.headline[0]} <span className="soft">{s.headline[1]}</span>
              </h2>
              <p className="body">{s.body}</p>
              {s.chips && (
                <ul className="chips left">
                  {s.chips.map((c) => (
                    <li key={c} className="chip">
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Photo file={s.image} alt={s.alt} className="story-photo">
              <div className="story-card">
                <StoryCard card={s.card} />
              </div>
            </Photo>
          </div>
        ))}
      </div>
    </section>
  );
}
