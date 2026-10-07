export const nav = {
  brand: "Portal Jump",
  links: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Who it's for", href: "#who-its-for" },
  ],
  cta: "Get early access",
};

export const hero = {
  headline: "Your trip, mapped.",
  subline: "Places picked for you, in the right order.",
  image: "hero.jpg",
  alt: "A traveller looking out over a sunlit coastal city",
  trip: { title: "Amalfi Coast, 5 days", meta: "2 stays, 1 ferry, 9 places" },
};

export type StoryStep = {
  tab: string;
  headline: [string, string];
};

export const story = {
  steps: [
    { tab: "Your style", headline: ["Pick what you love.", "We find the rest."] },
    { tab: "Your day", headline: ["Your day, in order.", "With time between stops."] },
    { tab: "Your bookings", headline: ["Bookings on the map.", "Stays, tables, tickets."] },
  ] as StoryStep[],
};

export const features = {
  headline: ["One trip.", "One page."],
  cards: [
    { lead: "Map.", rest: "Every stop, in order.", kind: "map" },
    { lead: "Bookings.", rest: "All in one list.", kind: "bookings" },
    { lead: "Picks.", rest: "Chosen for you.", kind: "picks" },
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
  headline: ["For every kind of trip.", ""],
  items: [
    { name: "Solo", line: "Your pace.", image: "who-solo.jpg", position: "center 60%", alt: "A solo traveller with a backpack on a mountain trail" },
    { name: "Couples", line: "Picks for two.", image: "who-couples.jpg", position: "center 55%", alt: "A couple sharing a map at a seaside cafe" },
    { name: "Families", line: "Easy days out.", image: "who-families.jpg", position: "center 50%", alt: "A family walking along a beach together" },
    { name: "Groups", line: "Everyone's favourites.", image: "who-groups.jpg", position: "center", alt: "A group of friends laughing around a table on holiday" },
    { name: "Creators", line: "The best light.", image: "who-creators.jpg", position: "center 50%", alt: "A creator filming a street scene on a trip" },
  ],
};

export const pitch = {
  headline: ["Fits you.", "Not a timetable."],
  items: [
    { n: "01", title: "Picked for you", body: "Chosen for your taste." },
    { n: "02", title: "In the right order", body: "Walk less, see more." },
    { n: "03", title: "No clock-watching", body: "Travel times, not timetables." },
  ],
};

export const closing = {
  line1: "Your next trip, mapped.",
  line2: "Be first to try it.",
};

export const form = {
  placeholder: "you@email.com",
  button: "Get early access",
  invalid: "Enter a valid email",
  failed: "Something went wrong. Try again.",
  success: "You're on the list.",
  subject: "Waitlist request",
};
