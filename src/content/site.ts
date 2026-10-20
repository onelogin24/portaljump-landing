export const nav = {
  brand: "Portal Jump",
  links: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Who it's for", href: "#who-its-for" },
    { label: "For agencies", href: "#for-agencies" },
  ],
  cta: "Get early access",
};

export const hero = {
  headline: ["Your whole trip.", "One Map."] as const,
  subline: "Booking, plans, picks and reviews, pinned where they happen.",
  note: "Free to join. Only early access emails.",
  image: "closing-roadtrip.jpg",
  alt: "Illustration of friends on a road trip",
  chips: ["Stays", "Flights", "Eats", "Things to do", "Reviews"] as const,
};

/** A headline with an optional second part shown in the soft color. */
export type Headline = [string, string?];

export type StoryStep = {
  tab: string;
  headline: Headline;
  body: string;
};

export const story = {
  steps: [
    { tab: "Your picks", headline: ["Your taste.", "Your map."], body: "Tell us what you love. We'll take it from there." },
    { tab: "Your day", headline: ["Your day,", "in the right order."], body: "Stops placed so you walk less and see more, with travel time on the map." },
    { tab: "Your bookings", headline: ["Your bookings,", "where they happen."], body: "Your stay, your table and your tickets, on the same map as your plans." },
  ] as StoryStep[],
};

export const features = {
  headline: ["Keep your itinerary, bookings, and favourite places in one\u00a0view."] as Headline,
  cards: [
    { lead: "Map.", rest: "Every place you plan to go, in order.", kind: "map" },
    { lead: "Bookings.", rest: "Every confirmation in one list.", kind: "bookings" },
    { lead: "Picks.", rest: "Chosen for how you travel.", kind: "picks" },
    { lead: "Reviews.", rest: "Notes from people who went.", kind: "reviews" },
  ] as const,
  confirmed: "Confirmed",
  bookings: [
    { icon: "plane", title: "Flight to Lisbon", date: "Fri 12 Jun" },
    { icon: "bed", title: "Alfama Guesthouse", date: "12 to 17 Jun" },
    { icon: "fork", title: "Dinner at Taberna", date: "Saturday night" },
    { icon: "ticket", title: "Tram 28 day pass", date: "Sun" },
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
  image: "closing-final.jpg",
  alt: "Illustration of a road trip",
};

export const who = {
  headline: ["A trip that feels right for\u00a0everyone."] as Headline,
  items: [
    { name: "Solo", line: "Your pace. Your places.", image: "who-solo.jpg", position: "center", alt: "Illustration of a traveller in a pink hat reading a map" },
    { name: "Couples", line: "Picks that suit you both.", image: "who-couples.jpg", position: "center", alt: "Illustration of a couple sharing an ice cream" },
    { name: "Families", line: "Shorter walks, places kids enjoy.", image: "who-families.jpg", position: "center", alt: "Illustration of a mother carrying her child on her shoulders" },
    { name: "Groups", line: "Everyone's must-sees, in one day.", image: "who-groups.jpg", position: "center", alt: "Illustration of three friends taking a selfie" },
    { name: "Creators", line: "The best places, in the best light.", image: "who-creators.jpg", position: "center", alt: "Illustration of a photographer raising her camera" },
  ],
};

export const steps = {
  headline: ["Plan your trip in three simple\u00a0steps."] as Headline,
  items: [
    { icon: "compass", title: "Explore", body: "Places chosen for how you travel." },
    { icon: "pin", title: "Pin", body: "Every stop on one map, in order." },
    { icon: "route", title: "Go", body: "Travel time between stops, never clock times." },
  ] as const,
};

export const agencies = {
  headline: ["For travel agencies.", "Your brand, our map."],
  body: "Give every client a live trip map. We share the revenue on what they book.",
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

export const closing = {
  line1: "Every trip mapped.",
  line2: "Start with yours.",
  note: "Free to join. Only early access emails.",
};

export const form = {
  placeholder: "you@email.com",
  button: "Get early access",
  invalid: "Enter a valid email",
  failed: "Something went wrong. Try again.",
  success: "You're on the list.",
  subject: "Waitlist request",
};
