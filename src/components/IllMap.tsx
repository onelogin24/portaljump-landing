import { MapCanvas, points, type LegData, type PinData } from "./MapCanvas";
import { recPin, recs } from "./recs";
import { stops } from "../content/itinerary";

const fit = [points.chiado, points.lanes, points.graca, ...recs.map((r) => r.at)];
const mapPins: PinData[] = [
  ...recs.map((r) => recPin(r, 0.45)),
  ...stops.map((s) => ({ key: s.id, at: points[s.at], photo: s.photo, n: s.n })),
];
const mapLegs: LegData[] = [
  { key: "leg1", a: points.chiado, b: points.lanes, state: "drawn" },
  { key: "leg2", a: points.lanes, b: points.graca, state: "drawn" },
];

export default function IllMap() {
  return <MapCanvas fit={fit} pins={mapPins} legs={mapLegs} animate={false} pinSize={40} />;
}
