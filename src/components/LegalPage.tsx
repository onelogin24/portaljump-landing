import { Fragment, useEffect, useState, type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";

type Block =
  | { t: "h2" | "h3"; text: string; id: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][] };

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

function parse(md: string): Block[] {
  const lines = md.split("\n");
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
    } else if (line.startsWith("### ") || line.startsWith("## ")) {
      const t = line.startsWith("### ") ? "h3" : "h2";
      const text = line.replace(/^#+\s*/, "");
      out.push({ t, text, id: slug(text) });
      i++;
    } else if (line.startsWith("|")) {
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].startsWith("|")) rows.push(cells(lines[i++]));
      out.push({ t: "table", head, rows });
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) items.push(lines[i++].slice(2));
      out.push({ t: "ul", items });
    } else {
      out.push({ t: "p", text: line });
      i++;
    }
  }
  return out;
}

function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const b = part.match(/^\*\*([^*]+)\*\*$/);
    if (b) return <strong key={i}>{b[1]}</strong>;
    const l = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (l) return <a key={i} href={l[2]}>{l[1]}</a>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function LegalPage({ title, source }: { title: string; source: string }) {
  useEffect(() => {
    document.title = `${title} | Portal Jump`;
  }, [title]);
  const [wide] = useState(() => typeof matchMedia === "function" && matchMedia("(min-width: 768px)").matches);
  const blocks = parse(source);
  const toc = blocks.filter((b): b is Extract<Block, { id: string }> => b.t === "h2");
  return (
    <>
      <TopBar />
      <main className="legal">
        <article className="legal-col">
          <h1>{title}</h1>
          <p className="legal-date">Effective October 7, 2026</p>
          <nav aria-label="Contents">
            <details className="legal-toc" open={wide}>
              <summary>Contents</summary>
              <ol>
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>{h.text.replace(/^\d+\.\s*/, "")}</a>
                </li>
              ))}
              </ol>
            </details>
          </nav>
          {blocks.map((b, i) => {
            if (b.t === "h2") return <h2 key={i} id={b.id}>{b.text}</h2>;
            if (b.t === "h3") return <h3 key={i} id={b.id}>{b.text}</h3>;
            if (b.t === "ul")
              return (
                <ul key={i}>
                  {b.items.map((it, j) => (
                    <li key={j}>{inline(it)}</li>
                  ))}
                </ul>
              );
            if (b.t === "table")
              return (
                <div className="legal-table" key={i} role="region" aria-label="Table" tabIndex={0}>
                  <table>
                    <thead>
                      <tr>
                        {b.head.map((h, j) => (
                          <th key={j}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((r, j) => (
                        <tr key={j}>
                          {r.map((c, k) => (
                            <td key={k}>{inline(c)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            return <p key={i}>{inline(b.text)}</p>;
          })}
        </article>
      </main>
      <Footer />
    </>
  );
}
