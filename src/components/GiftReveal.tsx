"use client";

import { useEffect, useRef, useState } from "react";
import { Bow } from "@/components/Ornaments";

type GiftRevealProps = {
  day: number;
  onComplete: () => void;
};

export default function GiftReveal({ day, onComplete }: GiftRevealProps) {
  const [opening, setOpening] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startTimer = window.setTimeout(() => setOpening(true), 600);
    const finishTimer = window.setTimeout(() => onCompleteRef.current(), 2900);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(finishTimer);
    };
  }, [day]);

  return (
    <div
      className="noche fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-pine-deep px-4"
      role="status"
      aria-label={`Abriendo regalo del día ${day}`}
    >
      <div className="relative z-20 mb-14 text-center">
        <p className="mb-2 font-hand text-3xl text-glow">
          Día {day} de diciembre
        </p>

        <h2 className="titulo text-3xl md:text-4xl">Una sorpresa para ti…</h2>
      </div>

      <div
        className={`gift-container relative z-10 h-48 w-48 ${
          opening ? "gift-opening" : ""
        }`}
      >
        {/* Destello */}
        <div className="gift-light pointer-events-none absolute left-1/2 top-1/2 z-30 h-32 w-32 rounded-full bg-[#ffe9a0] opacity-0 blur-2xl" />

        {/* Chispas */}
        <div className="gift-particles pointer-events-none absolute inset-0 z-40">
          {Array.from({ length: 16 }, (_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const distance = 100 + (i % 4) * 25;

            return (
              <span
                key={i}
                className="gift-particle absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#ffe9a0] opacity-0 shadow-[0_0_12px_#ffe9a0]"
                style={
                  {
                    "--tx": `${Math.cos(angle) * distance}px`,
                    "--ty": `${Math.sin(angle) * distance}px`,
                    animationDelay: `${0.9 + (i % 4) * 0.06}s`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>

        {/* Caja envuelta en papel rojo con cinta de estraza */}
        <div className="gift-box absolute bottom-0 left-0 z-10 h-36 w-48 overflow-hidden rounded-md bg-holly shadow-2xl">
          <div className="absolute inset-0 bg-[image:var(--grain-light)] opacity-60" />
          <div className="absolute left-1/2 top-0 h-full w-9 -translate-x-1/2 bg-kraft shadow-[inset_2px_0_0_rgba(0,0,0,0.1),inset_-2px_0_0_rgba(255,255,255,0.25)]" />
        </div>

        {/* Tapa con lazo */}
        <div className="gift-lid absolute -left-2 top-7 z-20 h-12 w-[208px] rounded-md bg-holly-soft shadow-xl">
          <div className="absolute inset-0 rounded-md bg-[image:var(--grain-light)] opacity-60" />
          <div className="absolute left-1/2 top-0 h-full w-9 -translate-x-1/2 bg-kraft" />
          <Bow className="absolute -top-[26px] left-1/2 h-14 w-20 -translate-x-1/2 text-[#2f7a53] drop-shadow-[0_2px_1px_rgba(0,0,0,0.35)]" />
        </div>
      </div>

      <p className="relative z-10 mt-16 animate-pulse font-hand text-3xl text-paper/90">
        Hecho con mucho amor
      </p>
    </div>
  );
}
