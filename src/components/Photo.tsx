import { useState, type ReactNode } from "react";
import manifest from "../content/photos.json";

type Props = {
  file: string;
  alt: string;
  sizes?: string;
  position?: string;
  eager?: boolean;
  className?: string;
  children?: ReactNode;
};

type Meta = { width: number; height: number; smWidth: number; smHeight: number; xsWidth: number };
const meta = manifest as Record<string, Meta>;

/** Smallest to largest; when two sizes share a width, the larger file (higher quality) wins. */
function srcSet(name: string, m: Meta) {
  const sizes: [string, number][] = [
    [`/images/${name}-xs.webp`, m.xsWidth],
    [`/images/${name}-sm.webp`, m.smWidth],
    [`/images/${name}.webp`, m.width],
  ];
  return sizes.filter(([, w], i) => !sizes.slice(i + 1).some(([, w2]) => w2 === w)).map(([u, w]) => `${u} ${w}w`).join(", ");
}

/** Photo block; the warm gradient shows behind the image, and alone when the file is missing. */
export function Photo({ file, alt, sizes = "100vw", position = "center", eager, className = "", children }: Props) {
  const [failed, setFailed] = useState(false);
  const name = file.replace(/\.\w+$/, "");
  const m = meta[name];
  return (
    <div className={`photo ${m ? "has-img" : ""} ${className}`}>
      {!failed && m && (
        <picture>
          <source
            type="image/webp"
            srcSet={srcSet(name, m)}
            sizes={sizes}
          />
          <img
            src={`/images/${name}.jpg`}
            alt={alt}
            width={m.width}
            height={m.height}
            style={{ objectPosition: position }}
            loading={eager ? "eager" : "lazy"}
            decoding={eager ? "sync" : "async"}
            {...(eager ? { fetchPriority: "high" as const } : {})}
            onError={() => setFailed(true)}
          />
        </picture>
      )}
      {children}
    </div>
  );
}
