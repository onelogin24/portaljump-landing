export const nav = {
  brand: "Portal Jump",
  links: ["Stays", "Flights", "Eats", "Things to do", "Trips"],
  cta: "Join waitlist",
};

export const hero = {
  headline: "Your whole trip. One map.",
  subline: "A personal itinerary map. Places picked for you, in the right order, with how long between them.",
  image: "hero.jpg",
  alt: "A traveller looking out over a sunlit coastal city",
  trip: { title: "Amalfi Coast, 5 days", meta: "2 stays, 1 ferry, 9 places" },
  flight: "Ferry to Positano, about 40 min",
  chips: ["Stays", "Flights", "Eats", "Things to do", "Reviews"] as const,
};

export type StoryStep = {
  tab: string;
  headline: [string, string];
  body: string;
};

export const story = {
  steps: [
    { tab: "Your style", headline: ["Tell it", "how you travel."], body: "Pick what you love. It recommends the rest." },
    { tab: "Your day", headline: ["Your day,", "mapped."], body: "Stops in the right order, with how long between them." },
    { tab: "Your bookings", headline: ["Everything in", "one place."], body: "Stays, tables and tickets, pinned where they happen." },
  ] as StoryStep[],
};

export const features = {
  headline: ["Everything in one trip.", "Nothing in ten tabs."],
  cards: [
    { lead: "Map.", rest: "Every stop, pinned.", kind: "map" },
    { lead: "Bookings.", rest: "Every confirmation, one list.", kind: "bookings" },
    { lead: "Picks.", rest: "Places that fit your style.", kind: "picks" },
    { lead: "Reviews.", rest: "From people who went.", kind: "reviews" },
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
  image: "band.jpg",
  alt: "A quiet temple garden in Kyoto in autumn",
};

export const who = {
  headline: "Built for every kind of trip.",
  items: [
    { name: "Solo", line: "Go where you want, when you want.", image: "who-solo.jpg", position: "center 60%", alt: "A solo traveller with a backpack on a mountain trail" },
    { name: "Couples", line: "Plan together, in one place.", image: "who-couples.jpg", position: "center 55%", alt: "A couple sharing a map at a seaside cafe" },
    { name: "Families", line: "Everyone's plans, one map.", image: "who-families.jpg", position: "center 50%", alt: "A family walking along a beach together" },
    { name: "Groups", line: "No more group chat chaos.", image: "who-groups.jpg", position: "center", alt: "A group of friends laughing around a table on holiday" },
    { name: "Creators", line: "Share the trips you love.", image: "who-creators.jpg", position: "center 50%", alt: "A creator filming a street scene on a trip" },
  ],
};

export const trust = [
  { icon: "lock", title: "Your trips stay private.", body: "Only you see your plans unless you share them." },
  { icon: "share", title: "Share what you choose.", body: "Send one day or the whole trip." },
  { icon: "download", title: "Yours to keep.", body: "Export your trip any time." },
] as const;

export const closing = {
  line1: "Every trip, mapped.",
  line2: "Start with yours.",
  note: "We'll only email you about early access.",
};

export const form = {
  placeholder: "you@email.com",
  button: "Join waitlist",
  invalid: "Enter a valid email",
  failed: "Something went wrong. Try again.",
  success: "You're on the list.",
  subject: "Waitlist request",
};
