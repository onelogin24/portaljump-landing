import { useEffect, useRef } from 'react';
import Nav from './components/Nav';
import Sky from './components/Sky';
import GlobeStage from './components/GlobeStage';
import styles from './App.module.css';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const heroRef = useRef<HTMLElement>(null);
  const frame = useRef(0);

  // --s = scale of the 1536x1024 reference stage; the headline and subhead are sized/placed in reference px x --s
  useEffect(() => {
    const setScale = () => document.documentElement.style.setProperty('--s', Math.min(window.innerWidth / 1536, window.innerHeight / 1024).toFixed(4));
    setScale();
    window.addEventListener('resize', setScale);
    return () => window.removeEventListener('resize', setScale);
  }, []);

  // Pointer parallax for stars/clouds: mouse only, off for reduced motion.
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const { clientX, clientY } = e;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = heroRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', (((clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty('--py', (((clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
  };

  return (
    <>
      <Nav />
      <main id="top">
        <section ref={heroRef} className={styles.hero} onPointerMove={onPointerMove}>
          <Sky />
          <div className={styles.copy}>
            <h1 className={styles.title}>
              Interest Media <span className={styles.accent}>Platform</span>
            </h1>
            <p className={styles.sub}>Everything you’re into. One place.</p>
          </div>

          <GlobeStage />

          <a className={styles.cue} href="#explore">
            <span className={styles.cueLine} aria-hidden="true" />
            Scroll to explore
          </a>
        </section>

        <section id="explore" className={styles.next}>
          <h2>Everything you’re into, in one place.</h2>
          <p>More of Portal Jump is on the way.</p>
        </section>
      </main>
    </>
  );
}
