"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "@/components/Ornaments";

type RomanticLetterProps = {
  title: string;
  message: string;
};

export default function RomanticLetter({
  title,
  message,
}: RomanticLetterProps) {
  const [opened, setOpened] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function toggleLetter() {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (opened) {
      setShowLetter(false);
      setOpened(false);
    } else {
      setOpened(true);
      timerRef.current = setTimeout(() => setShowLetter(true), 500);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg text-center">
      <p className="mb-1 font-hand text-3xl text-holly">
        Una carta escrita para ti
      </p>

      <p className="mb-5 text-sm italic text-ink-soft">
        {opened
          ? "Cada palabra es para ti"
          : "Hay algo especial dentro de este sobre…"}
      </p>

      <div
        className={`relative mx-auto w-full max-w-[380px] transition-[height] duration-700 ${
          opened ? "h-[520px]" : "h-[230px]"
        }`}
      >
        {/* CARTA: no existe visualmente hasta abrir */}
        {showLetter && (
          <div
            className="absolute inset-x-2 top-0 z-30 max-h-[370px] overflow-y-auto rounded-sm border border-kraft bg-[#fffbee] px-5 pb-5 pt-6 text-left shadow-2xl sm:px-7"
            style={{ animation: "letter-rise 0.65s ease-out both" }}
          >
            <h3 className="mb-2 text-center font-display text-2xl leading-tight text-holly">
              {title}
            </h3>

            <p className="renglones whitespace-pre-line font-hand text-[1.55rem] text-ink">
              {message}
            </p>

            <p className="mt-2 text-right font-hand text-2xl text-holly">
              Con todo mi amor
              <Heart className="ml-1.5 inline-block h-[0.75em] w-[0.75em]" />
            </p>
          </div>
        )}

        {/* SOBRE DE PAPEL DE ESTRAZA */}
        <div className="absolute inset-x-0 bottom-0 mx-auto h-[185px] w-full max-w-[360px]">
          {/* Parte trasera */}
          <div className="absolute inset-0 rounded-md bg-[#b99660] shadow-[0_15px_30px_rgba(40,20,5,0.35)]" />

          {/* Interior */}
          <div className="absolute inset-x-2 top-2 h-28 rounded-sm bg-[#8e6c3b]" />

          {/* Solapa superior */}
          <div
            className={`absolute inset-x-0 top-0 z-20 h-[105px] origin-top transition-transform duration-700 ${
              opened ? "[transform:rotateX(180deg)]" : ""
            }`}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            <svg
              viewBox="0 0 360 105"
              preserveAspectRatio="none"
              className="h-full w-full"
              aria-hidden="true"
            >
              <path d="M0 0 H360 L180 105 Z" fill="#d3b27c" />
              <path
                d="M12 5 H348 L180 96 Z"
                fill="none"
                stroke="#8d1c24"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                opacity="0.55"
              />
            </svg>
          </div>

          {/* Parte delantera */}
          <svg
            viewBox="0 0 360 185"
            preserveAspectRatio="none"
            className="absolute inset-0 z-10 h-full w-full"
            aria-hidden="true"
          >
            <path d="M0 0 L180 105 L360 0 V185 H0 Z" fill="#cdab72" />
            <path d="M0 185 L180 72 L360 185 Z" fill="#c29d63" />
            <path
              d="M0 0 L180 105 L360 0"
              fill="none"
              stroke="#8d1c24"
              strokeWidth="1.500"
              strokeDasharray="5 4"
              opacity="0.5"
            />
            <path
              d="M12 173 H348"
              stroke="#8d1c24"
              strokeWidth="1.200"
              strokeDasharray="5 4"
              opacity="0.4"
            />
          </svg>

          {/* Sello de lacre */}
          {!opened && (
            <div className="pointer-events-none absolute left-1/2 top-[76px] z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_28%,#e2575d,#b5262e_55%,#7d1820)] text-[#f4b6b6] shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_0_0_3px_rgba(125,24,32,0.55)]">
              <Heart className="h-6 w-6 drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]" />
            </div>
          )}

          {/* Botón del sobre */}
          <button
            type="button"
            onClick={toggleLetter}
            aria-expanded={opened}
            aria-label={opened ? "Guardar la carta" : "Abrir el sobre"}
            className="absolute inset-0 z-40 cursor-pointer rounded-md focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-holly"
          >
            <span className="sr-only">{opened ? "Cerrar" : "Abrir"}</span>
          </button>
        </div>
      </div>

      <p className="mt-5 font-hand text-2xl text-ink-soft">
        {opened ? "Toca el sobre para guardar la carta" : "Toca el sello para abrirla"}
      </p>

      <style jsx>{`
        @keyframes letter-rise {
          from {
            opacity: 0;
            transform: translateY(90px) scale(0.9);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes letter-rise {
            from,
            to {
              opacity: 1;
              transform: none;
            }
          }
        }
      `}</style>
    </section>
  );
}
