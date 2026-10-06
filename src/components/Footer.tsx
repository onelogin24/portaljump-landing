import { footerColumns, footerMeta } from "../content/footer";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-top">
        <a href="#" className="brand">
          {footerMeta.brand}
        </a>
        <nav className="footer-cols" aria-label="Footer">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="wrap footer-bottom">
        <span>{footerMeta.copyright}</span>
        <a href={`mailto:${footerMeta.email}`}>{footerMeta.email}</a>
        <span>{footerMeta.credits}</span>
      </div>
    </footer>
  );
}
