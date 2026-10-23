export const nav = {
  brand: "Portal Jump",
  links: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Who it's for", href: "#who-its-for" },
    { label: "For agencies", href: "#for-agencies" },
  ],
  cta: "Private beta",
};

export const hero = {
  headline: ["Your whole trip.", "One Map."] as const,
  subline: "Booking, plans, picks and reviews, pinned where they happen.",
  image: "closing-roadtrip-v2.jpg",
  alt: "Illustration of friends on a road trip",
  chips: ["Hotels", "Flights", "Eats", "Things to do", "Reviews"] as const,
};

/** A headline with an optional second part shown in the soft color. */
export type Headline = [string, string?];

export const mapCredit = { text: "© OpenStreetMap contributors", href: "https://www.openstreetmap.org/copyright" };

export const features = {
  headline: ["Keep your itinerary, bookings, and favourite places in one\u00a0view."] as Headline,
  cards: [
    { lead: "Map.", rest: "Explore the map. Pin every stop.", kind: "map" },
    { lead: "Bookings.", rest: "Every booking, in one list.", kind: "bookings" },
    { lead: "Picks.", rest: "Chosen. Curated for you.", kind: "picks" },
    { lead: "Reviews.", rest: "Notes from people who went.", kind: "reviews" },
  ] as const,
  confirmed: "Confirmed",
  bookings: [
    { icon: "plane", title: "Flight to Lisbon", date: "Friday" },
    { icon: "bed", title: "Alfama Guesthouse", date: "5 nights" },
    { icon: "fork", title: "Dinner at the market", date: "Saturday night" },
    { icon: "ticket", title: "Tram 28 day pass", date: "Sunday" },
  ] as const,
  picks: [
    { image: "pick-nata.jpg", alt: "Pasteis de nata on a plate", name: "Pasteis de nata", tag: "Saved" },
    { image: "pick-miradouro.jpg", alt: "Viewpoint over Lisbon rooftops", name: "Miradouro de Graca", tag: "Fits your style" },
    { image: "pick-golden.jpg", alt: "A street in golden hour light", name: "Golden hour walk", tag: "Saved" },
  ],
  reviews: [
    { text: "Slow lunch, easy walk from the tram.", meta: "Visited in May" },
    { text: "Get there before 10. Quiet, cool, and the view is worth the climb.", meta: "Visited in June" },
  ],
};

export const band = {
  image: "closing-final-v2.jpg",
  alt: "Illustration of a road trip",
};

export const who = {
  headline: ["A trip that feels right for\u00a0everyone."] as Headline,
  items: [
    { name: "Solo", line: "Your pace. Your places.", image: "who-solo.jpg", position: "center", alt: "Illustration of a traveller in a pink hat reading a map" },
    { name: "Couples", line: "Picks that suit you both.", image: "who-couples.jpg", position: "center", alt: "Illustration of a couple sharing an ice cream" },
    { name: "Families", line: "Easy walks, fun for kids.", image: "who-families.jpg", position: "center", alt: "Illustration of a mother carrying her child on her shoulders" },
    { name: "Groups", line: "Every must-see, together.", image: "who-groups.jpg", position: "center", alt: "Illustration of three friends taking a selfie" },
    { name: "Creators", line: "Best places, best light.", image: "who-creators.jpg", position: "center", alt: "Illustration of a photographer raising her camera" },
  ],
};

export const steps = {
  headline: ["Plan your trip in three simple\u00a0steps."] as Headline,
  items: [
    { icon: "compass", title: "Explore", body: "Discover places you'll want to go." },
    { icon: "pin", title: "Pin", body: "Save the places you want to visit." },
    { icon: "route", title: "Go", body: "Your entire journey, mapped in one place." },
  ] as const,
};

export const agencies = {
  headline: ["For travel agencies.", "Your brand, our map."],
  body: "A bespoke trip map for every client, under your brand.",
  cta: "Talk to us",
  subject: "Travel agency partnership",
  cardLabel: "Your agency name",
  confirmed: "Confirmed",
  bookings: [
    { icon: "bed", title: "Alfama Guesthouse", date: "5 nights" },
    { icon: "fork", title: "Dinner at the market", date: "Saturday night" },
    { icon: "ticket", title: "Tram 28 day pass", date: "Sunday" },
  ] as const,
};

export const form = {
  placeholder: "you@email.com",
  button: "Private beta",
  invalid: "Enter a valid email",
  failed: "Something went wrong. Try again.",
  success: "You're on the list.",
  subject: "Waitlist request",
};

export const NOTICE_VERSION = "2026-10-21";

export const waitlistNotice = {
  text: "By joining, you agree to receive Portal Jump launch emails. We save your email and approximate location.",
  linkLabel: "Privacy Policy",
  href: "/privacy",
};
