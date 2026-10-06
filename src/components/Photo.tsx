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

type Meta = { width: number; height: number; smWidth: number; smHeight: number };
const meta = manifest as Record<string, Meta>;

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
            srcSet={`/images/${name}-sm.webp ${m.smWidth}w, /images/${name}.webp ${m.width}w`}
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
