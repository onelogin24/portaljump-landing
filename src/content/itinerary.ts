export type PointKey = "market" | "martim" | "castle" | "graca" | "alfama" | "you";

export type Row = { time?: string; place: string; note?: string; pill?: string };

export type PinSpec = {
  at: PointKey;
  kind: "num" | "bed" | "fork";
  n?: number;
  chip?: string;
};

export type Tab = {
  title: string;
  rows: Row[];
  footer?: string;
  pins: PinSpec[];
};

export const credit = {
  text: "Map data © OpenStreetMap contributors",
  href: "https://www.openstreetmap.org/copyright",
};

export const itinerary: Tab[] = [
  {
    title: "Day 2, Lisbon",
    rows: [
      { time: "09:30", place: "Time Out Market", note: "Breakfast at the market" },
      { time: "11:00", place: "Martim Moniz", note: "Tram 28 up the hill" },
      { time: "12:30", place: "Sao Jorge Castle", note: "Views over the river" },
      { time: "19:30", place: "Miradouro da Graca", note: "Sunset" },
    ],
    footer: "4 stops, 3.1 km",
    pins: [
      { at: "market", kind: "num", n: 1 },
      { at: "martim", kind: "num", n: 2 },
      { at: "castle", kind: "num", n: 3 },
      { at: "graca", kind: "num", n: 4 },
    ],
  },
  {
    title: "Bookings",
    rows: [
      { time: "Fri 9:40", place: "Flight to Lisbon", pill: "Confirmed" },
      { time: "5 nights", place: "Alfama Guesthouse", pill: "Confirmed" },
      { time: "Sat 20:00", place: "Dinner", pill: "Confirmed" },
    ],
    pins: [
      { at: "alfama", kind: "bed", chip: "12 to 17 Jun" },
      { at: "market", kind: "fork", chip: "Sat 20:00" },
    ],
  },
  {
    title: "Next: Time Out Market",
    rows: [{ place: "6 min walk", note: "Table for 2 at 20:00" }],
    pins: [{ at: "market", kind: "fork" }],
  },
];
