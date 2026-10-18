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

export type Social = { icon: "instagram" | "linkedin"; label: string; href: string };

/** Shown as icons in the footer bottom row; an entry only appears once its href is a real https URL. */
export const socials: Social[] = [
  { icon: "instagram", label: "Portal Jump on Instagram", href: "PASTE_INSTAGRAM_URL" },
  { icon: "linkedin", label: "Portal Jump on LinkedIn", href: "PASTE_LINKEDIN_URL" },
];

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
