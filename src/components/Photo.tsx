import { useState, type ReactNode } from "react";

type Props = {
  file: string;
  alt: string;
  eager?: boolean;
  className?: string;
  children?: ReactNode;
};

/** Photo block with a warm gradient that shows until the file exists. */
export function Photo({ file, alt, eager, className = "", children }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`photo ${className}`}>
      {!failed && (
        <img
          src={`/images/${file}`}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding={eager ? "sync" : "async"}
          {...(eager ? { fetchPriority: "high" as const } : {})}
          onError={() => setFailed(true)}
        />
      )}
      {children}
    </div>
  );
}
