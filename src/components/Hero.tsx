import { hero } from "../content/site";
import { Photo } from "./Photo";

export function Hero() {
  return (
    <section className="wrap hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        {hero.headline.join(" ")}
      </h1>
      <div className="scene scene-hero">
        <Photo file={hero.image} alt={hero.alt} sizes="(min-width: 1200px) 1200px, 100vw" position="center 10%" eager className="scene-img" />
      </div>
    </section>
  );
}
