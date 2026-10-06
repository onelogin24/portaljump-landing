import { Star } from "lucide-react";
import { features } from "../content/site";

const gradients = ["#EDE6DA,#D9CFC0", "#DDE6E0,#BFD0C6", "#EBDDD6,#D8BFB2"];

function Illustration({ kind }: { kind: (typeof features.cards)[number]["kind"] }) {
  switch (kind) {
    case "map":
      return (
        <div className="ill ill-map" aria-hidden="true">
          <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
            <path d="M0 150 C80 120 140 190 230 150 S360 110 400 130" stroke="#E4DDCE" strokeWidth="18" fill="none" />
            <path d="M60 60 C120 30 170 120 220 90 S320 40 350 150" stroke="#0B0B0C" strokeWidth="2" strokeDasharray="6 6" fill="none" strokeLinecap="round" />
          </svg>
          {[
            ["60px", "60px", 1],
            ["32%", "42%", 2],
            ["55%", "40%", 3],
            ["87%", "68%", 4],
          ].map(([l, t, n]) => (
            <span key={n} className="pin" style={{ left: l as string, top: t as string }}>
              {n}
            </span>
          ))}
        </div>
      );
    case "bookings":
      return (
        <div className="ill ill-bookings" aria-hidden="true">
          {features.bookings.map((b, i) => (
            <div key={b.title} className="card booking" style={{ marginLeft: i * 14 }}>
              <strong>{b.title}</strong>
              <span>{b.date}</span>
            </div>
          ))}
        </div>
      );
    case "picks":
      return (
        <div className="ill ill-picks" aria-hidden="true">
          {features.picks.map((p, i) => (
            <div key={p} className="card pick">
              <div className="thumb" style={{ background: `linear-gradient(135deg, ${gradients[i % 3].split(",")[0]}, ${gradients[i % 3].split(",")[1]})` }} />
              <span>{p}</span>
            </div>
          ))}
        </div>
      );
    case "reviews":
      return (
        <div className="ill ill-reviews" aria-hidden="true">
          <div className="card review">
            <div className="stars">
              {[0, 1, 2, 3, 4].map((n) => (
                <Star key={n} size={16} strokeWidth={1.75} fill="#0B0B0C" />
              ))}
            </div>
            <p>{features.review.text}</p>
            <span>{features.review.meta}</span>
          </div>
        </div>
      );
  }
}

export function FeatureGrid() {
  return (
    <section className="section wrap" aria-labelledby="features-title" data-reveal>
      <p className="tag">{features.tag}</p>
      <h2 id="features-title" className="h-xl">
        {features.headline[0]} <span className="soft">{features.headline[1]}</span>
      </h2>
      <div className="feature-grid">
        {features.cards.map((c) => (
          <article key={c.kind} className="card feature">
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
