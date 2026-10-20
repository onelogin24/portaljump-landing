import { BedDouble, Plane, Utensils, Compass, Star } from "lucide-react";
import { hero } from "../content/site";
import { Photo } from "./Photo";
import { WaitlistForm } from "./WaitlistForm";

const chipIcons = {
  Hotels: BedDouble,
  Flights: Plane,
  Eats: Utensils,
  "Things to do": Compass,
  Reviews: Star,
};

export function Hero() {
  return (
    <section className="wrap hero" aria-labelledby="hero-title">
      <div className="scene scene-hero">
        <Photo file={hero.image} alt={hero.alt} sizes="(min-width: 1200px) 1200px, 100vw" position="center 10%" eager className="scene-img" />
        <div className="scene-copy">
          <h1 id="hero-title">
            <span>{hero.headline[0]}</span> <span>{hero.headline[1]}</span>
          </h1>
          <p className="hero-sub">{hero.subline}</p>
          <div id="waitlist">
            <WaitlistForm className="hero-form" />
          </div>
          <p className="note">{hero.note}</p>
        </div>
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
