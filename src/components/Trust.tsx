import { Download, Lock, Share2 } from "lucide-react";
import { trust } from "../content/site";

const icons = { lock: Lock, share: Share2, download: Download };

export function Trust() {
  return (
    <section className="section wrap" aria-label="Privacy and ownership">
      <div className="trust">
        {trust.map((t) => {
          const Icon = icons[t.icon];
          return (
            <div key={t.title} className="card trust-card" data-reveal>
              <span className="trust-icon">
                <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
