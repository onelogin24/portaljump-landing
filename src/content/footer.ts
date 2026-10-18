import { CONTACT_EMAIL } from "../config";

export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };

export const footerBrand = {
  line: "Your whole trip. One map.",
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Journey", href: "/#journey" },
      { label: "Who it's for", href: "/#who-its-for" },
    ],
  },
  { title: "Partners", links: [{ label: "Travel agencies", href: "/#for-agencies" }] },
  { title: "Company", links: [{ label: "Contact", href: `mailto:${CONTACT_EMAIL}` }] },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

/** Add a URL to show the Social column; entries without one stay hidden. */
export const socials: FooterLink[] = [
  { label: "Instagram", href: "" },
  { label: "X", href: "" },
  { label: "LinkedIn", href: "" },
];
export const socialTitle = "Social";

export const footerMeta = {
  brand: "Portal Jump",
  copyright: "© 2026 APLUSB DECOR PRIVATE LIMITED",
  email: CONTACT_EMAIL,
  credits: {
    before: "Photography via Unsplash and PAKUTASO. Map data ",
    link: { label: "OpenStreetMap", href: "https://www.openstreetmap.org/copyright" },
    after: ".",
  },
};
