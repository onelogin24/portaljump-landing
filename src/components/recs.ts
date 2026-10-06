import { ArrowUpFromLine, Binoculars, Castle, Church, Landmark } from "lucide-react";
import photos from "../content/photos.json";
import { recMeta, type RecMeta } from "../content/itinerary";
import { geo, recPoints, type PinData, type XY } from "./MapCanvas";

export const recIcons = {
  landmark: Landmark,
  church: Church,
  lift: ArrowUpFromLine,
  castle: Castle,
  binoculars: Binoculars,
};

export type Rec = RecMeta & { at: XY; lon: number; lat: number; photo?: string; minutes: number };

const WALK_M_PER_MIN = 4500 / 60; // 4.5 km per hour

function metres(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const itineraryStops = [geo.chiado, geo.lanes, geo.graca];

/** Only places that resolved at build time are kept; photos only when a file was processed. */
export const recs: Rec[] = recMeta.flatMap((m) => {
  const p = recPoints.find((r) => r.id === m.id);
  if (!p) return [];
  const nearest = Math.min(...itineraryStops.map((s) => metres(s, [p.lon, p.lat])));
  return [
    {
      ...m,
      at: { x: p.x, y: p.y },
      lon: p.lon,
      lat: p.lat,
      photo: (photos as Record<string, unknown>)[m.id] ? m.id : undefined,
      minutes: Math.max(1, Math.ceil(nearest / WALK_M_PER_MIN)),
    },
  ];
});

export const REC_REL = 36 / 52;

export function recPin(r: Rec, opacity: number, added = false): PinData {
  return {
    key: r.id,
    at: r.at,
    photo: r.photo,
    Fallback: recIcons[r.icon],
    rel: REC_REL,
    opacity,
    ringDark: added,
  };
}
