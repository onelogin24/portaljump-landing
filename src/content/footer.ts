export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };

const stub = (labels: string[]): FooterLink[] => labels.map((label) => ({ label, href: "#" }));

export const footerColumns: FooterColumn[] = [
  { title: "Product", links: stub(["Stays", "Flights", "Eats", "Things to do", "Trips"]) },
  { title: "Company", links: stub(["About", "Contact", "Privacy", "Terms"]) },
  { title: "Social", links: stub(["Instagram", "X", "LinkedIn"]) },
];

export const footerMeta = {
  brand: "Portal Jump",
  copyright: "© 2026 APLUSB DECOR PRIVATE LIMITED",
  email: "hello@portaljump.co",
  credits: "Photos: credits on file",
};
