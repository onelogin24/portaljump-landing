export const nav = {
  brand: "Portal Jump",
  links: ["Stays", "Flights", "Eats", "Things to do", "Trips"],
  cta: "Join waitlist",
};

export const hero = {
  headline: "Your whole trip. One map.",
  subline: "Bookings, plans, picks and reviews, pinned where they happen.",
  image: "hero.jpg",
  alt: "A traveller looking out over a sunlit coastal city",
  trip: { title: "Lisbon, 5 days", meta: "2 stays, 1 flight, 9 places" },
  flight: "Flight booked, Fri 9:40",
  chips: ["Stays", "Flights", "Eats", "Things to do", "Reviews"] as const,
};

export type StoryStep = {
  headline: [string, string];
  body: string;
  image: string;
  alt: string;
  chips?: string[];
  card: { kind: "text"; text: string } | { kind: "list"; items: string[] };
};

export const story = {
  tag: "How it works",
  steps: [
    {
      headline: ["Plan it", "like you."],
      body: "Tell it how you travel. Every pick fits.",
      image: "story-plan.jpg",
      alt: "Travellers walking through a lively old town market",
      chips: ["Street food first", "Walkable", "Kid friendly"],
      card: { kind: "text", text: "Day 2: market, tram 28, sunset at Graca" },
    },
    {
      headline: ["Book it", "in one place."],
      body: "Flights, stays and tables, kept together.",
      image: "story-book.jpg",
      alt: "A cosy hotel room with a window overlooking the city",
      card: { kind: "list", items: ["Flight", "Hotel", "Dinner"] },
    },
    {
      headline: ["Go with", "the map."],
      body: "Your plans, live on the map while you travel.",
      image: "story-go.jpg",
      alt: "A traveller walking a cobbled street while checking a map",
      card: { kind: "text", text: "Next: Time Out Market, 6 min walk" },
    },
  ] as StoryStep[],
};

export const features = {
  tag: "One trip, one place",
  headline: ["Everything in one trip.", "Nothing in ten tabs."],
  cards: [
    { lead: "Map.", rest: "Every stop, pinned.", kind: "map" },
    { lead: "Bookings.", rest: "Every confirmation, one list.", kind: "bookings" },
    { lead: "Picks.", rest: "Places that fit your style.", kind: "picks" },
    { lead: "Reviews.", rest: "From people who went.", kind: "reviews" },
  ] as const,
  bookings: [
    { title: "Flight to Lisbon", date: "Fri 12 Jun, 9:40" },
    { title: "Alfama Guesthouse", date: "12 to 17 Jun" },
    { title: "Dinner at Taberna", date: "Sat 13 Jun, 20:00" },
  ],
  picks: ["Time Out Market", "Miradouro", "Pasteis stop"],
  review: {
    text: "Easy walk from the tram, great for a slow lunch. Book ahead on weekends.",
    meta: "Visited in May",
  },
};

export const band = {
  image: "band.jpg",
  alt: "A quiet temple garden in Kyoto at golden hour",
  card: {
    title: "Kyoto trip",
    items: [
      { label: "Flight confirmed", done: true },
      { label: "Ryokan booked", done: true },
      { label: "Tea class Saturday", done: false },
    ],
  },
};

export const who = {
  tag: "Who it's for",
  headline: "Built for every kind of trip.",
  items: [
    { name: "Solo", line: "Go where you want, when you want.", image: "who-solo.jpg", alt: "A solo traveller with a backpack on a mountain trail" },
    { name: "Couples", line: "Plan together, in one place.", image: "who-couples.jpg", alt: "A couple sharing a map at a seaside cafe" },
    { name: "Families", line: "Everyone's plans, one map.", image: "who-families.jpg", alt: "A family walking along a beach together" },
    { name: "Groups", line: "No more group chat chaos.", image: "who-groups.jpg", alt: "A group of friends laughing around a table on holiday" },
    { name: "Creators", line: "Share the trips you love.", image: "who-creators.jpg", alt: "A creator filming a street scene on a trip" },
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
  success: "You're on the list.",
  subject: "Waitlist request",
};
