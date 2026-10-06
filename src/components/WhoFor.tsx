import { who } from "../content/site";
import { Photo } from "./Photo";

export function WhoFor() {
  return (
    <section className="section wrap" aria-labelledby="who-title" data-reveal>
      <h2 id="who-title" className="h-xl">
        {who.headline}
      </h2>
      <ul className="who-row">
        {who.items.map((w) => (
          <li key={w.name}>
            <Photo file={w.image} alt={w.alt} sizes="(min-width: 1024px) 232px, 260px" position={w.position} className="who-card">
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
