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

export type RecMeta = {
  id: string;
  name: string;
  descriptor: string;
  reason: string;
  icon: "landmark" | "church" | "lift" | "castle" | "binoculars";
};

export const recMeta: RecMeta[] = [
  { id: "rec-comercio", name: "Praca do Comercio", descriptor: "Riverside square", reason: "Because you like views", icon: "landmark" },
  { id: "rec-se", name: "Lisbon Cathedral", descriptor: "Se de Lisboa", reason: "On your way to Alfama", icon: "church" },
  { id: "rec-santajusta", name: "Santa Justa Lift", descriptor: "Elevador de Santa Justa", reason: "Short walk from Chiado", icon: "lift" },
  { id: "rec-castelo", name: "Sao Jorge Castle", descriptor: "Castelo de Sao Jorge", reason: "Because you like views", icon: "castle" },
  { id: "rec-santaluzia", name: "Miradouro de Santa Luzia", descriptor: "Viewpoint", reason: "Next to your route", icon: "binoculars" },
  { id: "rec-carmo", name: "Carmo Convent", descriptor: "Convento do Carmo", reason: "Quiet morning stop", icon: "church" },
];
