import { BedDouble, Plane, Ship, Utensils, Compass, Star } from "lucide-react";
import { hero } from "../content/site";
import { Photo } from "./Photo";
import { WaitlistForm } from "./WaitlistForm";

const chipIcons = {
  Stays: BedDouble,
  Flights: Plane,
  Eats: Utensils,
  "Things to do": Compass,
  Reviews: Star,
};

export function Hero() {
  return (
    <section className="wrap hero" aria-labelledby="hero-title">
      <Photo file={hero.image} alt={hero.alt} sizes="(max-width: 767px) 320px, (min-width: 1248px) 1200px, 100vw" position="center 60%" eager className="hero-photo">
        <div className="hero-shade" />
        <div className="hero-cards" aria-hidden="true">
          <div className="fcard trip-card">
            <svg viewBox="0 0 252 120" className="mini-map" role="presentation">
              <rect width="252" height="120" rx="12" fill="#F1EDE4" />
              <path d="M0 84 C60 70 90 100 150 82 S230 60 252 70" stroke="#E4DDCE" strokeWidth="10" fill="none" />
              <path d="M40 90 C70 40 120 30 150 56 S200 40 214 30" stroke="#0B0B0C" strokeWidth="2" strokeDasharray="5 5" fill="none" strokeLinecap="round" />
              <circle cx="40" cy="90" r="6" fill="#0B0B0C" />
              <circle cx="150" cy="56" r="6" fill="#0B0B0C" />
              <circle cx="214" cy="30" r="6" fill="#0B0B0C" />
            </svg>
            <p className="trip-title">{hero.trip.title}</p>
            <p className="trip-meta">{hero.trip.meta}</p>
          </div>
          <div className="fcard flight-card">
            <span className="icon-dot">
              <Ship size={16} strokeWidth={1.75} />
            </span>
            {hero.flight}
          </div>
        </div>
        <div className="hero-copy">
          <h1 id="hero-title">
            <span>{hero.headline[0]}</span> <span>{hero.headline[1]}</span>
          </h1>
          <p className="hero-sub">{hero.subline}</p>
          <WaitlistForm className="hero-form" />
          <p className="note">{hero.note}</p>
        </div>
      </Photo>
      <ul className="chips" aria-label="What you can plan">
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
