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
  subline: "Tell Portal Jump how you like to travel. It picks the places, puts them in the right order and shows how long it takes to get from one to the next. Your stays and bookings sit on the same map.",
  note: "Free to join. Only early access emails, nothing else.",
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
    { tab: "Your style", headline: ["Tell it what you love.", "It finds the rest."], body: "Slow mornings, street food, a good view at sunset. Pick what matters to you, and every place it suggests follows from that." },
    { tab: "Your day", headline: ["Your day,", "in the right order."], body: "Each stop is placed so you walk less and see more, with the travel time between them written on the map." },
    { tab: "Your bookings", headline: ["Your bookings,", "where they happen."], body: "Your stay, your dinner table and your tickets sit on the same map as your plans, not in ten different emails." },
  ] as StoryStep[],
};

export const features = {
  headline: ["Everything for the trip, on one page.", "Not in ten tabs."],
  cards: [
    { lead: "Map.", rest: "Every place you plan to go, pinned and in order.", kind: "map" },
    { lead: "Bookings.", rest: "Every confirmation in one list.", kind: "bookings" },
    { lead: "Picks.", rest: "Places chosen for how you travel.", kind: "picks" },
    { lead: "Reviews.", rest: "Notes from people who have been there.", kind: "reviews" },
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
    { name: "Families", line: "Shorter walks, earlier dinners, places kids enjoy.", image: "who-families.jpg", position: "center 50%", alt: "A family walking along a beach together" },
    { name: "Groups", line: "Everyone's must-sees in one day that works.", image: "who-groups.jpg", position: "center", alt: "A group of friends laughing around a table on holiday" },
    { name: "Creators", line: "The places worth photographing, in the best light.", image: "who-creators.jpg", position: "center 50%", alt: "A creator filming a street scene on a trip" },
  ],
};

export const pitch = {
  headline: ["A plan that fits you.", "Not a timetable."],
  items: [
    { n: "01", title: "Picked for you", body: "Tell it what you love. Every place it suggests is chosen for you, not for everyone." },
    { n: "02", title: "In the right order", body: "Stops are lined up so you walk less, wait less and see more." },
    { n: "03", title: "No clock-watching", body: "You see how far each stop is and how long the day runs. Never a list of times to keep." },
  ],
};

export const closing = {
  line1: "Your next trip, already mapped.",
  line2: "Be one of the first to try it.",
  note: "Free to join. Only early access emails, nothing else.",
};

export const form = {
  placeholder: "you@email.com",
  button: "Get early access",
  invalid: "Enter a valid email",
  failed: "Something went wrong. Try again.",
  success: "You're on the list.",
  subject: "Waitlist request",
};
