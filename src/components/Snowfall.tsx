"use client";

import { useMemo, type CSSProperties } from "react";

// Capas: lejos (pequeño, lento, tenue) → cerca (grande, rápido, desenfocado)
const LAYERS = [
  { size: 2, speed: 22, opacity: 0.4, blur: 0 },
  { size: 3.5, speed: 15, opacity: 0.65, blur: 0 },
  { size: 7, speed: 10, opacity: 0.8, blur: 1.6 },
];

export default function Snowfall() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 54 }, (_, i) => {
        const layer = LAYERS[i % 3];
        const jitter = ((i * 13) % 7) / 7; // 0 → 1, determinista

        return {
          id: i,
          left: `${((i * 37.7) % 100).toFixed(2)}%`,
          delay: `-${((i * 1.93) % layer.speed).toFixed(2)}s`,
          duration: `${(layer.speed + jitter * 5).toFixed(2)}s`,
          size: `${(layer.size + jitter * 1.5).toFixed(2)}px`,
          opacity: layer.opacity,
          blur: layer.blur,
          drift: `${(i % 2 ? 1 : -1) * (20 + ((i * 11) % 50))}px`,
        };
      }),
    []
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
      aria-hidden="true"
    >
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="snowflake absolute rounded-full bg-[#f4f9fb]"
          style={
            {
              left: flake.left,
              top: "-12px",
              width: flake.size,
              height: flake.size,
              opacity: flake.opacity,
              filter: flake.blur ? `blur(${flake.blur}px)` : undefined,
              animationDelay: flake.delay,
              animationDuration: flake.duration,
              "--drift": flake.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
