import { band, closing } from "../content/site";
import { Photo } from "./Photo";
import { WaitlistForm } from "./WaitlistForm";

export function Closing() {
  return (
    <section id="waitlist" className="section wrap" aria-labelledby="closing-title" data-reveal>
      <Photo file={band.image} alt={band.alt} sizes="(max-width: 767px) 320px, (min-width: 1248px) 1200px, 100vw" position="center 45%" className="closing-photo">
        <div className="closing-wash" />
        <div className="closing-copy">
          <h2 id="closing-title" className="closing-title">
            {closing.line1}
            <br />
            <span className="closing-line2">{closing.line2}</span>
          </h2>
          <WaitlistForm className="closing-form" />
        </div>
      </Photo>
    </section>
  );
}
