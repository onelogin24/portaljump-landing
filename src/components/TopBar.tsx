import type { MouseEvent } from "react";
import { nav } from "../content/site";

function goToWaitlist(e: MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById("waitlist");
  if (!target || window.location.pathname !== "/") return;
  e.preventDefault();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", "/#waitlist");
  // Focus the email field only where a keyboard will not jump up (not on touch screens).
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  window.setTimeout(() => document.querySelector<HTMLInputElement>("#waitlist input[type=email]")?.focus({ preventScroll: true }), reduced ? 0 : 750);
}

export function TopBar() {
  return (
    <header className="topbar-wrap">
      <div className="topbar">
        <a href="/" className="brand">
          {nav.brand}
        </a>
        <nav className="topbar-links" aria-label="Primary">
          {nav.links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="/#waitlist" className="btn" onClick={goToWaitlist}>
          {nav.cta}
        </a>
      </div>
    </header>
  );
}
