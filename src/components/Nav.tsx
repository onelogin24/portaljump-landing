import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from './Icons';
import styles from './Nav.module.css';

const LINKS = ['Explore', 'People', 'Interests', 'About'];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = 'hidden';
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={`${styles.nav} ${scrolled ? `glass ${styles.scrolled}` : ''}`}>
      <div className={styles.bar}>
        <a className={styles.brand} href="#top" aria-label="Portal Jump, home">
          Portal Jump
        </a>

        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l} href="#explore">
              {l}
            </a>
          ))}
        </nav>

        <a className={styles.cta} href="#explore">
          Get Started <ArrowRight />
        </a>

        <button
          ref={toggleRef}
          type="button"
          className={`glass ${styles.burger}`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true" className={styles.burgerLines} data-open={open} />
        </button>
      </div>

      <div id="mobile-menu" className={styles.sheet} data-open={open} hidden={!open}>
        <nav aria-label="Mobile">
          {LINKS.map((l, i) => (
            <a key={l} ref={i === 0 ? firstLinkRef : undefined} href="#explore" onClick={() => setOpen(false)}>
              {l}
            </a>
          ))}
          <a className={styles.sheetCta} href="#explore" onClick={() => setOpen(false)}>
            Get Started <ArrowRight />
          </a>
        </nav>
      </div>
    </header>
  );
}
