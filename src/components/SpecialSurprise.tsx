"use client";

import { useState, type CSSProperties } from "react";
import { Bow, Heart, Tree } from "@/components/Ornaments";

type SpecialSurpriseProps = {
  day: number;
  title: string;
  message: string;
  emoji?: string;
  songUrl?: string;
};

const PARTICLES = Array.from({ length: 22 }, (_, index) => {
  const angle = (index / 22) * Math.PI * 2;
  const distance = 85 + (index % 4) * 24;

  return {
    id: index,
    x: `${Math.cos(angle) * distance}px`,
    y: `${Math.sin(angle) * distance}px`,
    delay: `${(index % 5) * 0.06}s`,
  };
});

export default function SpecialSurprise({
  day,
  title,
  message,
  emoji = "✨",
  songUrl,
}: SpecialSurpriseProps) {
  const [revealed, setRevealed] = useState(false);

  const isChristmasFinale = day === 24;

  const safeSongUrl = (() => {
    if (!songUrl) return null;

    try {
      const parsed = new URL(songUrl);

      return parsed.protocol === "https:" ? parsed.href : null;
    } catch {
      return null;
    }
  })();

  return (
    <section className="relative mx-auto w-full max-w-lg text-center">
      {!revealed ? (
        <div className="space-y-4">
          <p className="font-hand text-3xl text-holly">
            {isChristmasFinale
              ? "La última sorpresa de Navidad"
              : "Una sorpresa diferente"}
          </p>

          <p className="text-sm italic text-ink-soft">
            Hay algo especial esperando por ti…
          </p>

          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="special-mystery relative mx-auto block aspect-square w-full max-w-[215px] overflow-hidden rounded-md bg-holly shadow-[0_20px_34px_-8px_rgba(84,30,36,0.6)] transition-transform hover:scale-[1.04] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-holly"
            aria-label="Descubrir sorpresa especial"
          >
            <div className="pointer-events-none absolute inset-0 bg-[image:var(--grain-light)] opacity-60" />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-1/2 w-9 -translate-x-1/2 bg-kraft shadow-[inset_2px_0_0_rgba(0,0,0,0.1),inset_-2px_0_0_rgba(255,255,255,0.3)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 bg-kraft shadow-[inset_0_2px_0_rgba(0,0,0,0.1),inset_0_-2px_0_rgba(255,255,255,0.3)]"
            />

            {isChristmasFinale ? (
              <Tree className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-[#1f6b45] drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]" />
            ) : (
              <Bow className="absolute left-1/2 top-1/2 h-16 w-24 -translate-x-1/2 -translate-y-[60%] text-[#2f7a53] drop-shadow-[0_2px_1px_rgba(0,0,0,0.35)]" />
            )}
          </button>

          <p className="font-hand text-2xl text-ink-soft">
            {isChristmasFinale
              ? "El mejor regalo es compartir la Navidad contigo"
              : "Las mejores sorpresas se descubren juntos"}
          </p>
        </div>
      ) : (
        <div className="special-revealed relative">
          {/* Partículas decorativas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-16 z-10 overflow-visible"
          >
            {PARTICLES.map((particle) => (
              <span
                key={particle.id}
                className="special-sparkle absolute left-1/2 top-0 text-lg text-holly-soft"
                style={
                  {
                    "--spark-x": particle.x,
                    "--spark-y": particle.y,
                    animationDelay: particle.delay,
                  } as CSSProperties
                }
              >
                {particle.id % 3 === 0 ? "♥" : "✦"}
              </span>
            ))}
          </div>

          <div className="relative rounded-md bg-[#fffbee] px-5 py-7 shadow-[0_10px_24px_-10px_rgba(60,30,10,0.5)] sm:px-8">
            <div className="cinta" />

            <p className="mb-2 font-hand text-3xl text-holly">
              {isChristmasFinale
                ? "Feliz Navidad, mi amor"
                : "Un momento solo nuestro"}
            </p>

            <div className="special-main-emoji mb-3 text-6xl">{emoji}</div>

            <h3 className="mb-4 font-display text-2xl leading-tight text-holly-deep sm:text-3xl">
              {title}
            </h3>

            <div className="mx-auto mb-5 h-px w-28 border-t-2 border-dashed border-kraft" />

            <p className="whitespace-pre-line font-hand text-[1.6rem] leading-snug text-ink">
              {message}
            </p>

            {safeSongUrl && (
              <a
                href={safeSongUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-holly px-6 py-2.5 font-display text-base text-paper shadow-[0_3px_0_var(--color-holly-deep)] transition hover:bg-holly-soft"
              >
                <span aria-hidden="true">♫</span>
                Escuchar nuestra canción
              </a>
            )}

            {isChristmasFinale && (
              <div className="special-finale mt-7 rounded-md border-2 border-dashed border-holly-soft bg-[#fff4cf] px-4 py-5">
                <div className="mb-3 flex items-center justify-center gap-3">
                  <Tree className="h-7 w-7 text-[#1f6b45]" />
                  <Heart className="h-6 w-6 text-holly" />
                  <Tree className="h-7 w-7 text-[#1f6b45]" />
                </div>

                <p className="font-display text-xl leading-snug text-holly">
                  Y que nos queden muchas Navidades juntos
                </p>

                <p className="mt-2 font-hand text-2xl text-ink-soft">
                  Fin del calendario, pero no de nuestros recuerdos.
                </p>
              </div>
            )}

            <p className="mt-6 font-hand text-2xl text-holly">
              Hecho con todo mi amor
              <Heart className="ml-1.5 inline-block h-[0.75em] w-[0.75em]" />
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
