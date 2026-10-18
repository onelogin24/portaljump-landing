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

export type Social = { icon: "instagram" | "linkedin" | "x"; label: string; href: string };

/** Shown as icons in the footer bottom row; an entry only appears when its href is an https URL. */
export const socials: Social[] = [
  { icon: "instagram", label: "Portal Jump on Instagram", href: "https://www.instagram.com/portaljump.ai/" },
  { icon: "linkedin", label: "Portal Jump on LinkedIn", href: "https://www.linkedin.com/company/portal-jump" },
  { icon: "x", label: "Portal Jump on X", href: "https://x.com/portaljumpai" },
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
