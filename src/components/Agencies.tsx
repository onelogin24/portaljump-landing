import { Bed, Ticket, Utensils } from "lucide-react";
import { CONTACT_EMAIL } from "../config";
import { agencies } from "../content/site";

const bookingIcons = { bed: Bed, fork: Utensils, ticket: Ticket };

export function Agencies() {
  return (
    <section id="for-agencies" className="section wrap" aria-labelledby="agencies-title" data-reveal>
      <div className="card feature agency">
        <div className="agency-copy">
          <h2 id="agencies-title" className="h-xl">
            {agencies.headline[0]} <span className="soft">{agencies.headline[1]}</span>
          </h2>
          <p className="body">{agencies.body}</p>
          <a className="btn agency-cta" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(agencies.subject)}`}>
            {agencies.cta}
          </a>
        </div>
        <div className="agency-trip">
          <p className="card-title">{agencies.cardLabel}</p>
          <ul className="ill-bookings">
            {agencies.bookings.map((b) => {
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
                  <span className="pill">{agencies.confirmed}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
