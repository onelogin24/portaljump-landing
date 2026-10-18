import { footerColumns, footerMeta, footerTop, socials, socialTitle } from "../content/footer";
import { WaitlistForm } from "./WaitlistForm";

export function Footer() {
  const live = socials.filter((s) => s.href);
  const columns = live.length ? [...footerColumns, { title: socialTitle, links: live }] : footerColumns;
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <h2 className="footer-line">{footerTop.line}</h2>
          <WaitlistForm className="footer-form" />
        </div>
        <nav className="footer-cols" aria-label="Footer">
          {columns.map((col) => (
            <div key={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} {...(/^https?:/.test(l.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className="footer-wordmark" aria-hidden="true">
          {footerMeta.brand}
        </p>
        <div className="footer-bottom-row">
          <span>{footerMeta.copyright}</span>
          <a href={`mailto:${footerMeta.email}`}>{footerMeta.email}</a>
          <span>
            {footerMeta.credits.before}
            <a href={footerMeta.credits.link.href} target="_blank" rel="noopener noreferrer">
              {footerMeta.credits.link.label}
            </a>
            {footerMeta.credits.after}
          </span>
        </div>
      </div>
    </footer>
  );
}
