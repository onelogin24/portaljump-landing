import { footerBrand, footerColumns, footerMeta, socials } from "../content/footer";
import { InstagramIcon, LinkedinIcon, XIcon } from "./SocialIcons";
import { WaitlistForm } from "./WaitlistForm";

const socialIcons = { instagram: InstagramIcon, linkedin: LinkedinIcon, x: XIcon };
// Placeholders stay hidden until a real URL is filled in.
const liveSocials = socials.filter((s) => /^https:\/\//.test(s.href));

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-main">
          <div className="footer-brand">
            <a href="/" className="brand">
              {footerMeta.brand}
            </a>
            <p className="footer-line">{footerBrand.line}</p>
            <div id="waitlist">
              <WaitlistForm className="footer-form" />
            </div>
          </div>
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
        <div className="footer-bottom-row">
          <span>{footerMeta.copyright}</span>
          <a href={`mailto:${footerMeta.email}`}>{footerMeta.email}</a>
          {liveSocials.length > 0 && (
            <ul className="footer-social">
              {liveSocials.map((s) => {
                const Icon = socialIcons[s.icon];
                return (
                  <li key={s.icon}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                      <Icon size={18} />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
