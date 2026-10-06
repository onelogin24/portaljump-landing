import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Map as GLMap, StyleSpecification } from "maplibre-gl";
import { MAP_STYLE, mapSteps, pinIcons, type Pin } from "../content/map";

const COLORS = {
  land: "#F3EEE5",
  water: "#D9E1E2",
  park: "#E7EADF",
  building: "#EAE3D7",
  road: "#FFFFFF",
  casing: "#E6DFD3",
  text: "#8C8A86",
  ink: "#0B0B0C",
};

type Layer = StyleSpecification["layers"][number] & { "source-layer"?: string };

function safe(fn: () => void) {
  try {
    fn();
  } catch {
    /* a layer that lacks this property is simply left alone */
  }
}

/** Repaint the Positron style in the warm gallery palette. */
function restyle(map: GLMap) {
  const layers = (map.getStyle().layers ?? []) as Layer[];
  for (const l of layers) {
    const id = l.id;
    const sl = l["source-layer"] ?? "";
    const text = `${id} ${sl}`.toLowerCase();

    if (l.type === "background") {
      safe(() => map.setPaintProperty(id, "background-color", COLORS.land));
    } else if (l.type === "symbol") {
      if (/poi|transit|rail|station|airport|aeroway|aerialway|ferry/.test(text)) {
        safe(() => map.setLayoutProperty(id, "visibility", "none"));
      } else {
        safe(() => map.setPaintProperty(id, "text-color", COLORS.text));
        safe(() => map.setPaintProperty(id, "text-halo-color", COLORS.land));
        safe(() => map.setPaintProperty(id, "text-halo-width", 1.2));
        safe(() => map.setPaintProperty(id, "icon-opacity", 0));
      }
    } else if (l.type === "fill") {
      if (/water/.test(text)) safe(() => map.setPaintProperty(id, "fill-color", COLORS.water));
      else if (/building/.test(text)) safe(() => map.setPaintProperty(id, "fill-color", COLORS.building));
      else if (/park|wood|grass|forest|landcover|green/.test(text)) safe(() => map.setPaintProperty(id, "fill-color", COLORS.park));
      else if (/transportation|aeroway|pier/.test(text)) safe(() => map.setPaintProperty(id, "fill-color", COLORS.road));
      else safe(() => map.setPaintProperty(id, "fill-color", COLORS.land));
    } else if (l.type === "fill-extrusion") {
      safe(() => map.setPaintProperty(id, "fill-extrusion-color", COLORS.building));
    } else if (l.type === "line") {
      if (/rail|transit|aerialway|ferry/.test(text)) {
        safe(() => map.setLayoutProperty(id, "visibility", "none"));
      } else if (/waterway|water/.test(text)) {
        safe(() => map.setPaintProperty(id, "line-color", COLORS.water));
      } else if (/transportation|highway|road|bridge|tunnel|street|path/.test(text)) {
        if (/casing/.test(text)) {
          safe(() => map.setPaintProperty(id, "line-color", COLORS.casing));
        } else {
          safe(() => map.setPaintProperty(id, "line-color", COLORS.road));
          if (/minor|service|path|track|pedestrian|street_limited|residential/.test(text)) {
            safe(() => map.setPaintProperty(id, "line-opacity", 0.6));
          }
        }
      }
    }
  }
}

function pinElement(pin: Pin): HTMLElement {
  const el = document.createElement("div");
  el.className = `mk mk-${pin.kind}`;
  if (pin.kind === "num") {
    el.innerHTML = `<span class="pin">${pin.n}</span>`;
  } else if (pin.kind === "you") {
    el.innerHTML = `<span class="you-dot"></span>`;
  } else {
    const svg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pinIcons[pin.kind]}</svg>`;
    el.innerHTML = `<span class="pin">${svg}</span>`;
    if (pin.label) {
      const chip = document.createElement("span");
      chip.className = "pin-label";
      chip.textContent = pin.label;
      el.appendChild(chip);
    }
  }
  return el;
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function MapPanel({ active, children }: { active: number; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GLMap | null>(null);
  const activeRef = useRef(active);
  const markersRef = useRef<HTMLElement[][]>([]);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Load only when the panel is within 200px of the viewport.
  useEffect(() => {
    const el = box.current;
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
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near || !canvas.current) return;
    let cancelled = false;
    let map: GLMap | null = null;
    let timer = 0;

    (async () => {
      try {
        const mod = await import("maplibre-gl");
        await import("maplibre-gl/dist/maplibre-gl.css");
        if (cancelled || !canvas.current) return;
        const first = mapSteps[activeRef.current].view;
        map = new mod.Map({
          container: canvas.current,
          style: MAP_STYLE,
          center: first.center,
          zoom: first.zoom,
          pitch: first.pitch,
          bearing: first.bearing,
          interactive: false,
          attributionControl: {},
          fadeDuration: 0,
        });
        mapRef.current = map;
        const m = map;

        timer = window.setTimeout(() => {
          if (!m.loaded()) setFailed(true);
        }, 12000);
        m.on("error", () => {
          if (!m.isStyleLoaded()) setFailed(true);
        });

        m.on("load", () => {
          window.clearTimeout(timer);
          restyle(m);
          mapSteps.forEach((step, i) => {
            m.addSource(`route-${i}`, {
              type: "geojson",
              data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: step.line } },
            });
            m.addLayer({
              id: `route-${i}`,
              type: "line",
              source: `route-${i}`,
              layout: { "line-cap": "butt", "line-join": "round" },
              paint: {
                "line-color": COLORS.ink,
                "line-width": 2,
                "line-dasharray": [2, 2],
                "line-opacity": i === activeRef.current ? 1 : 0,
                "line-opacity-transition": { duration: 400, delay: 0 },
              },
            });
            markersRef.current[i] = step.pins.map((pin) => {
              const el = pinElement(pin);
              new mod.Marker({ element: el, anchor: pin.kind === "num" || pin.kind === "you" ? "center" : "bottom" })
                .setLngLat(pin.at)
                .addTo(m);
              return el;
            });
          });
          applyActive(m, activeRef.current, true);
          setReady(true);
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      map?.remove();
      mapRef.current = null;
      markersRef.current = [];
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near]);

  function applyActive(map: GLMap, index: number, instant: boolean) {
    mapSteps.forEach((_, i) => {
      safe(() => map.setPaintProperty(`route-${i}`, "line-opacity", i === index ? 1 : 0));
      markersRef.current[i]?.forEach((el) => el.classList.toggle("on", i === index));
    });
    const v = mapSteps[index].view;
    if (instant || reduced) {
      map.jumpTo({ center: v.center, zoom: v.zoom, pitch: v.pitch, bearing: v.bearing });
    } else {
      map.flyTo({ center: v.center, zoom: v.zoom, pitch: v.pitch, bearing: v.bearing, duration: 1600, easing: ease, essential: true });
    }
  }

  useEffect(() => {
    activeRef.current = active;
    const map = mapRef.current;
    if (map && ready) applyActive(map, active, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ready]);

  return (
    <div ref={box} className="map-panel">
      {!failed && <div ref={canvas} className="map-canvas" aria-hidden="true" />}
      {children}
    </div>
  );
}
