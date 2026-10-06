export type LngLat = [number, number];

export type View = { center: LngLat; zoom: number; pitch: number; bearing: number };

export type Pin = {
  at: LngLat;
  kind: "num" | "plane" | "bed" | "fork" | "you";
  n?: number;
  label?: string;
};

export type MapStep = { view: View; pins: Pin[]; line: LngLat[] };

export const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

export const mapSteps: MapStep[] = [
  {
    view: { center: [-9.138, 38.7125], zoom: 13.4, pitch: 40, bearing: -12 },
    pins: [
      { at: [-9.1459, 38.7069], kind: "num", n: 1 },
      { at: [-9.1357, 38.7163], kind: "num", n: 2 },
      { at: [-9.1335, 38.7139], kind: "num", n: 3 },
      { at: [-9.1315, 38.7163], kind: "num", n: 4 },
    ],
    line: [
      [-9.1459, 38.7069],
      [-9.1357, 38.7163],
      [-9.1335, 38.7139],
      [-9.1315, 38.7163],
    ],
  },
  {
    view: { center: [-9.136, 38.742], zoom: 12.2, pitch: 30, bearing: 0 },
    pins: [
      { at: [-9.1342, 38.7742], kind: "plane", label: "Flight, Fri 9:40" },
      { at: [-9.13, 38.7114], kind: "bed", label: "Alfama Guesthouse, 12 to 17 Jun" },
      { at: [-9.1459, 38.7069], kind: "fork", label: "Dinner, Sat 20:00" },
    ],
    line: [],
  },
  {
    view: { center: [-9.1405, 38.7095], zoom: 15, pitch: 55, bearing: 20 },
    pins: [
      { at: [-9.1372, 38.7105], kind: "you" },
      { at: [-9.1459, 38.7069], kind: "fork" },
    ],
    line: [
      [-9.1372, 38.7105],
      [-9.1459, 38.7069],
    ],
  },
];

/** Lucide icon paths, drawn inside a 24px viewBox. */
export const pinIcons = {
  plane:
    '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  bed: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
  fork: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
} as const;
