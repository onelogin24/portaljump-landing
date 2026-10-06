import styles from './Sky.module.css';

// Sparse far-layer stars placed to match the reference frame (% of the hero).
const STARS = [
  { x: 11.9, y: 21.5, d: 0.4 },
  { x: 21.7, y: 24.2, d: 2.1 },
  { x: 67.6, y: 6.3, d: 1.2 },
  { x: 9.2, y: 57.6, d: 3.3 },
  { x: 92.8, y: 59.6, d: 0.9 },
  { x: 4, y: 12, d: 2.7 },
  { x: 33, y: 10, d: 1.7 },
  { x: 58, y: 17, d: 3.9 },
  { x: 78, y: 9, d: 0.2 },
  { x: 96, y: 40, d: 2.4 },
  { x: 6, y: 40, d: 1.4 },
  { x: 69.5, y: 83.7, d: 3.1 },
];

export default function Sky() {
  return (
    <div className={styles.sky} aria-hidden="true">
      <div className={styles.stars}>
        {STARS.map((s, i) => (
          <span key={i} className={styles.star} style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} />
        ))}
      </div>
      <div className={styles.grain} />
    </div>
  );
}
