import assets from '../generated/assets.json';
import styles from './Sky.module.css';

// Sparse stars and four-point sparkles, placed to match the reference frame (% of the hero).
const STARS = [
  { x: 11.9, y: 21.5, s: 1.6, d: 0.4 },
  { x: 21.7, y: 24.2, s: 1.2, d: 2.1 },
  { x: 67.6, y: 6.3, s: 1.6, d: 1.2 },
  { x: 9.2, y: 57.6, s: 1.2, d: 3.3 },
  { x: 92.8, y: 59.6, s: 1.4, d: 0.9 },
  { x: 4, y: 12, s: 1.2, d: 2.7 },
  { x: 33, y: 10, s: 1.2, d: 1.7 },
  { x: 58, y: 17, s: 1.2, d: 3.9 },
  { x: 78, y: 9, s: 1.4, d: 0.2 },
  { x: 96, y: 40, s: 1.2, d: 2.4 },
  { x: 6, y: 40, s: 1.4, d: 1.4 },
  { x: 69.5, y: 83.7, s: 1.4, d: 3.1 },
];
const SPARKLES = [
  { x: 15, y: 31, s: 14 },
  { x: 86.9, y: 33.6, s: 10 },
  { x: 12.3, y: 48, s: 9 },
  { x: 93.2, y: 47.5, s: 8 },
];

const { left, right } = assets.clouds;

export default function Sky() {
  return (
    <div className={styles.sky} aria-hidden="true">
      <div className={styles.layerFar}>
        {STARS.filter((_, i) => i % 2 === 0).map((s, i) => (
          <span key={i} className={`${styles.star} ${i % 2 === 0 ? styles.twinkle : ''}`} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
        ))}
      </div>
      <div className={styles.layerMid}>
        {STARS.filter((_, i) => i % 2 === 1).map((s, i) => (
          <span key={i} className={`${styles.star} ${i % 2 === 0 ? styles.twinkle : ''}`} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
        ))}
        {SPARKLES.map((s, i) => (
          <svg key={i} className={`${styles.sparkle} ${styles.twinkle}`} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${i * 1.3}s` }} viewBox="0 0 24 24">
            <path d="M12 0c.8 6.7 5.3 11.2 12 12-6.7.8-11.2 5.3-12 12-.8-6.7-5.3-11.2-12-12C6.7 11.2 11.2 6.7 12 0z" fill="#fff" />
          </svg>
        ))}
      </div>

      <img className={styles.moon} src="/moon.webp" width="70" height="70" alt="" decoding="async" />

      <div className={styles.cloudsLayer}>
        <img
          className={styles.cloudLeft}
          src={left.src}
          srcSet={`${left.small} ${left.smallW}w, ${left.src} ${left.w}w`}
          sizes="(min-width: 1080px) 36vw, 78vw"
          width={left.w}
          height={Math.round((left.w * 740) / 1100)}
          alt=""
          decoding="async"
        />
        <img
          className={styles.cloudRight}
          src={right.src}
          srcSet={`${right.small} ${right.smallW}w, ${right.src} ${right.w}w`}
          sizes="(min-width: 1080px) 42vw, 84vw"
          width={right.w}
          height={Math.round((right.w * 600) / 1280)}
          alt=""
          decoding="async"
        />
      </div>
    </div>
  );
}
