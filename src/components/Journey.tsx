import { lazy } from "react";
import { journey } from "../content/site";
import { LazyOnView } from "./LazyOnView";

const JourneyMap = lazy(() => import("./JourneyMap"));

export function Journey() {
  return (
    <section id="journey" className="section wrap" aria-labelledby="journey-title" data-reveal>
      <div className="journey-head">
        <h2 id="journey-title" className="h-xl">
          {journey.headline}
        </h2>
        <p className="body">{journey.body}</p>
      </div>
      <LazyOnView fallback={<div className="map-panel journey-panel" />}>
        <JourneyMap />
      </LazyOnView>
    </section>
  );
}
