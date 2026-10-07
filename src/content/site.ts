export const nav = {
  brand: "Portal Jump",
  links: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Who it's for", href: "#who-its-for" },
  ],
  cta: "Get early access",
};

export const hero = {
  headline: "Every day of your trip, mapped for you.",
  subline: "Places picked for your taste, in the right order, with travel time between each stop.",
  note: "Free to join. Only early access emails.",
  image: "hero.jpg",
  alt: "A traveller looking out over a sunlit coastal city",
  trip: { title: "Amalfi Coast, 5 days", meta: "2 stays, 1 ferry, 9 places" },
  flight: "Ferry to Positano, about 40 min",
};

export type StoryStep = {
  tab: string;
  headline: [string, string];
  body: string;
};

export const story = {
  steps: [
    { tab: "Your style", headline: ["Tell it what you love.", "It finds the rest."], body: "Slow mornings, street food, a view at sunset. Every pick follows from that." },
    { tab: "Your day", headline: ["Your day,", "in the right order."], body: "Stops placed so you walk less and see more, with travel time on the map." },
    { tab: "Your bookings", headline: ["Your bookings,", "where they happen."], body: "Your stay, your table and your tickets, on the same map as your plans." },
  ] as StoryStep[],
};

export const features = {
  headline: ["Everything for the trip, on one page.", "Not in ten tabs."],
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
  image: "band.jpg",
  alt: "A quiet temple garden in Kyoto in autumn",
};

export const who = {
  headline: ["Whoever you travel with,", "it plans around them."],
  items: [
    { name: "Solo", line: "Your pace. Your places.", image: "who-solo.jpg", position: "center 60%", alt: "A solo traveller with a backpack on a mountain trail" },
    { name: "Couples", line: "Picks that suit you both.", image: "who-couples.jpg", position: "center 55%", alt: "A couple sharing a map at a seaside cafe" },
    { name: "Families", line: "Shorter walks, places kids enjoy.", image: "who-families.jpg", position: "center 50%", alt: "A family walking along a beach together" },
    { name: "Groups", line: "Everyone's must-sees, in one day.", image: "who-groups.jpg", position: "center", alt: "A group of friends laughing around a table on holiday" },
    { name: "Creators", line: "The best places, in the best light.", image: "who-creators.jpg", position: "center 50%", alt: "A creator filming a street scene on a trip" },
  ],
};

export const pitch = {
  headline: ["A plan that fits you.", "Not a timetable."],
  items: [
    { n: "01", title: "Picked for you", body: "Tell it what you love. Every suggestion is chosen for you." },
    { n: "02", title: "In the right order", body: "Stops lined up so you walk less and see more." },
    { n: "03", title: "No clock-watching", body: "How far each stop is and how long the day runs. Never a timetable." },
  ],
};

export const closing = {
  line1: "Your next trip, already mapped.",
  line2: "Be one of the first to try it.",
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
