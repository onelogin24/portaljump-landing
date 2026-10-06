import { Check, Circle } from "lucide-react";
import { band } from "../content/site";
import { Photo } from "./Photo";

export function ImageBand() {
  return (
    <section className="section wrap" aria-label="Trip checklist example" data-reveal>
      <Photo file={band.image} alt={band.alt} sizes="(min-width: 1248px) 1200px, 100vw" position="center 45%" className="band">
        <div className="card band-card">
          <p className="band-title">{band.card.title}</p>
          <ul>
            {band.card.items.map((i) => (
              <li key={i.label}>
                {i.done ? (
                  <span className="tick">
                    <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                ) : (
                  <Circle size={20} strokeWidth={1.5} className="empty" aria-hidden="true" />
                )}
                {i.label}
              </li>
            ))}
          </ul>
        </div>
      </Photo>
    </section>
  );
}
