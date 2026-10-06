import { pitch } from "../content/site";

export function Pitch() {
  return (
    <section className="section wrap" aria-labelledby="pitch-title" data-reveal>
      <h2 id="pitch-title" className="h-xl">
        {pitch.headline[0]} <span className="soft">{pitch.headline[1]}</span>
      </h2>
      <ol className="pitch">
        {pitch.items.map((p) => (
          <li key={p.n} className="pitch-col">
            <span className="pitch-n">{p.n}</span>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
