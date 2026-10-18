import { useEffect, useState } from "react";
import type { Size, XY } from "./MapCanvas";

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof matchMedia === "function" && matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export type Rect = { x: number; y: number; w: number; h: number };
export const overlaps = (a: Rect, b: Rect, pad = 4) =>
  a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

/** Pick right, left, above, then below: the first box that clears every obstacle and the panel edge. */
export function placeCard(pin: XY, r: number, w: number, h: number, obstacles: Rect[], bounds: Size): Rect {
  const gap = 16;
  const options: Rect[] = [
    { x: pin.x + r + gap, y: pin.y - h / 2, w, h },
    { x: pin.x - r - gap - w, y: pin.y - h / 2, w, h },
    { x: pin.x - w / 2, y: pin.y - r - gap - h, w, h },
    { x: pin.x - w / 2, y: pin.y + r + gap, w, h },
  ];
  const inside = (b: Rect) => b.x >= 8 && b.y >= 8 && b.x + b.w <= bounds.w - 8 && b.y + b.h <= bounds.h - 8;
  return options.find((b) => inside(b) && !obstacles.some((o) => overlaps(b, o))) ?? options.find(inside) ?? options[0];
}
