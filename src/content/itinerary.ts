export type PointKey = "chiado" | "lanes" | "graca" | "stay" | "market";

export type Stop = {
  id: string;
  n?: number;
  at: PointKey;
  photo: string;
  name: string;
  /** time of day word */
  when: string;
  /** how long to spend there */
  stay: string;
  /** the preference chip that picked it */
  chip: string;
  reason: string;
};

export const credit = {
  text: "Map data © OpenStreetMap contributors",
  href: "https://www.openstreetmap.org/copyright",
};

export const preferences = ["Slow mornings", "Street food", "Views"];

export const stops: Stop[] = [
  {
    id: "chiado",
    n: 1,
    at: "chiado",
    photo: "pick-nata",
    name: "Pasteis de nata in Chiado",
    when: "Slow morning",
    stay: "About 1 hour",
    chip: "Slow mornings",
    reason: "Because you like slow mornings",
  },
  {
    id: "lanes",
    n: 2,
    at: "lanes",
    photo: "pick-golden",
    name: "Wander the Alfama lanes",
    when: "Late morning",
    stay: "About 2 hours",
    chip: "Street food",
    reason: "Because you love street food",
  },
  {
    id: "graca",
    n: 3,
    at: "graca",
    photo: "pick-miradouro",
    name: "Miradouro da Graca",
    when: "Golden hour",
    stay: "Stay for sunset",
    chip: "Views",
    reason: "Because you like views",
  },
];

export const stay = { id: "stay", at: "stay" as PointKey, photo: "who-solo", name: "Alfama Guesthouse", label: "5 nights", icon: "bed" as const };
export const dinner = { id: "dinner", at: "market" as PointKey, photo: "pick-golden", name: "Dinner at the market", label: "Saturday night", icon: "fork" as const };

export const legs = [
  { icon: "tram" as const, text: "About 10 min by tram 28", sub: "or 20 min walk" },
  { icon: "walk" as const, text: "About 12 min walk, uphill" },
];

export const panelText = {
  styleTitle: "Picked for you",
  dayTitle: "Day 2, Lisbon",
  dayFooter: "About 5 hours, 2.4 km, mostly on foot",
  bookingsTitle: "Bookings",
  confirmed: "Confirmed",
  bookings: [
    { place: "Flight to Lisbon", note: "Friday" },
    { place: "Alfama Guesthouse", note: "5 nights" },
    { place: "Dinner at the market", note: "Saturday night" },
    { place: "Tram 28 day pass", note: "Sunday" },
  ],
};
