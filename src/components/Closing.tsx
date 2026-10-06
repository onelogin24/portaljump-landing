import { closing } from "../content/site";
import { WaitlistForm } from "./WaitlistForm";

export function Closing() {
  return (
    <section id="waitlist" className="section wrap closing" aria-labelledby="closing-title" data-reveal>
      <h2 id="closing-title" className="h-closing">
        {closing.line1}
        <br />
        <span className="soft">{closing.line2}</span>
      </h2>
      <WaitlistForm className="closing-form" />
      <p className="note">{closing.note}</p>
    </section>
  );
}
