import type { CSSProperties } from "react";
import { who } from "../content/site";
import { Photo } from "./Photo";

export function WhoFor() {
  return (
    <section id="who-its-for" className="section wrap" aria-labelledby="who-title">
      <h2 id="who-title" className="h-xl" data-reveal>
        {who.headline[0]} <span className="soft">{who.headline[1]}</span>
      </h2>
      <ul className="who-row">
        {who.items.map((w, i) => (
          <li key={w.name} data-reveal style={{ "--i": i } as CSSProperties}>
            <Photo file={w.image} alt={w.alt} sizes="(min-width: 1024px) 232px, (min-width: 768px) 260px, 78vw" position={w.position} className="who-card">
              <div className="who-shade" />
              <div className="who-text">
                <h3>{w.name}</h3>
                <p>{w.line}</p>
              </div>
            </Photo>
          </li>
        ))}
      </ul>
    </section>
  );
}
