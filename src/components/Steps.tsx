import type { CSSProperties } from "react";
import { Compass, MapPin, Route } from "lucide-react";
import { steps } from "../content/site";

const stepIcons = { compass: Compass, pin: MapPin, route: Route };

export function Steps() {
  return (
    <section id="how-it-works" className="section wrap steps" aria-labelledby="steps-title">
      <h2 id="steps-title" className="h-xl" data-reveal="fade">
        {steps.headline[0]}
        {steps.headline[1] && (
          <>
            {" "}
            <span className="soft">{steps.headline[1]}</span>
          </>
        )}
      </h2>
      <ol className="steps-row" role="list">
        {steps.items.map((s, i) => {
          const Icon = stepIcons[s.icon];
          return (
            <li key={s.title} className="step" data-reveal="fade" style={{ "--i": i + 1 } as CSSProperties}>
              <Icon className="step-icon" size={22} strokeWidth={1.5} aria-hidden="true" />
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
