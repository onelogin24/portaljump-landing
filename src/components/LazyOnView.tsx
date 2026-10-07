import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

/** Mounts its children (a lazy component) once the box is within 400px of the viewport. */
export function LazyOnView({ children, fallback, className = "", ariaHidden }: { children: ReactNode; fallback: ReactNode; className?: string; ariaHidden?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} aria-hidden={ariaHidden}>
      {near ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
}
