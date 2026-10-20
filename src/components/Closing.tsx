import { band, closing } from "../content/site";
import { Photo } from "./Photo";
import { WaitlistForm } from "./WaitlistForm";

export function Closing() {
  return (
    <section id="waitlist" className="section wrap" aria-labelledby="closing-title" data-reveal>
      <div className="scene scene-closing">
        <Photo file={band.image} alt={band.alt} sizes="(min-width: 1200px) 1200px, 100vw" position="center top" className="scene-img" />
        <div className="scene-copy">
          <h2 id="closing-title" className="closing-title">
            {closing.line1}
            <br />
            <span className="closing-line2">{closing.line2}</span>
          </h2>
          <WaitlistForm className="closing-form" />
          <p className="note">{closing.note}</p>
        </div>
      </div>
    </section>
  );
}
