import type { CSSProperties } from "react";
import { Bed, Plane, Star, Ticket, Utensils } from "lucide-react";
import { features } from "../content/site";
import { MapPin, MapStage, points, smoothPath } from "./MapStage";
import { Photo } from "./Photo";

const bookingIcons = { plane: Plane, bed: Bed, fork: Utensils, ticket: Ticket };

const route = smoothPath([points.market, points.martim, points.castle, points.graca]);
const centre = {
  x: (points.market.x + points.martim.x + points.castle.x + points.graca.x) / 4,
  y: (points.market.y + points.martim.y + points.castle.y + points.graca.y) / 4,
};
const numbered = [points.market, points.martim, points.castle, points.graca];

function Illustration({ kind }: { kind: (typeof features.cards)[number]["kind"] }) {
  switch (kind) {
    case "map":
      return (
        <div className="ill ill-map" aria-hidden="true">
          <MapStage
            zoom={1.9}
            origin={centre}
            svg={
              <path d={route} fill="none" stroke="#0B0B0C" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
            }
          >
            {(ctx) => numbered.map((p, i) => <MapPin key={i} at={ctx.px(p)} kind="num" n={i + 1} />)}
          </MapStage>
        </div>
      );
    case "bookings":
      return (
        <ul className="ill ill-bookings">
          {features.bookings.map((b) => {
            const Icon = bookingIcons[b.icon];
            return (
              <li key={b.title} className="card booking">
                <span className="booking-icon">
                  <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="booking-text">
                  <strong>{b.title}</strong>
                  <span>{b.date}</span>
                </span>
                <span className="pill">{features.confirmed}</span>
              </li>
            );
          })}
        </ul>
      );
    case "picks":
      return (
        <ul className="ill ill-picks">
          {features.picks.map((p) => (
            <li key={p.name} className="pick">
              <Photo file={p.image} alt={p.alt} sizes="(min-width: 768px) 180px, 30vw" className="pick-photo" />
              <span className="pick-name">{p.name}</span>
              <span className="pick-tag">{p.tag}</span>
            </li>
          ))}
        </ul>
      );
    case "reviews":
      return (
        <ul className="ill ill-reviews">
          {features.reviews.map((r) => (
            <li key={r.meta} className="card review">
              <span className="stars" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((n) => (
                  <Star key={n} size={16} strokeWidth={1.75} fill="#0B0B0C" aria-hidden="true" />
                ))}
              </span>
              <p>{r.text}</p>
              <span className="review-meta">{r.meta}</span>
            </li>
          ))}
        </ul>
      );
  }
}

export function FeatureGrid() {
  return (
    <section className="section wrap" aria-labelledby="features-title">
      <h2 id="features-title" className="h-xl" data-reveal>
        {features.headline[0]} <span className="soft">{features.headline[1]}</span>
      </h2>
      <div className="feature-grid">
        {features.cards.map((c, i) => (
          <article key={c.kind} className="card feature" data-reveal style={{ "--i": i } as CSSProperties}>
            <h3>
              {c.lead} <span className="soft">{c.rest}</span>
            </h3>
            <Illustration kind={c.kind} />
          </article>
        ))}
      </div>
    </section>
  );
}
