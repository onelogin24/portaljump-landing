import { nav } from "../content/site";

export function TopBar() {
  return (
    <header className="topbar-wrap">
      <div className="topbar">
        <a href="#" className="brand">
          {nav.brand}
        </a>
        <nav className="topbar-links" aria-label="Primary">
          {nav.links.map((l) => (
            <a key={l} href="#waitlist">
              {l}
            </a>
          ))}
        </nav>
        <a href="#waitlist" className="btn">
          {nav.cta}
        </a>
      </div>
    </header>
  );
}
