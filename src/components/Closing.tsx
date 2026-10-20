import { band } from "../content/site";
import { Photo } from "./Photo";

export function Closing() {
  return (
    <section className="section wrap" data-reveal>
      <div className="scene scene-closing">
        <Photo file={band.image} alt={band.alt} sizes="(min-width: 1200px) 1200px, 100vw" position="center top" className="scene-img" />
      </div>
    </section>
  );
}
