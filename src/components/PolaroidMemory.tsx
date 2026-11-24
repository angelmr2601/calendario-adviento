"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "@/components/Ornaments";

type PolaroidMemoryProps = {
  title: string;
  message: string;
  image?: string;
};

export default function PolaroidMemory({
  title,
  message,
  image,
}: PolaroidMemoryProps) {
  const [flipped, setFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasImage = Boolean(image) && !imageError;

  return (
    <section className="mx-auto w-full max-w-md text-center">
      <p className="mb-1 font-hand text-3xl text-holly">
        Un pedacito de nuestra historia
      </p>

      <p className="mb-8 text-sm italic text-ink-soft">
        {flipped
          ? "Un momento que guardo en mi corazón"
          : "Hay un recuerdo esperando por ti…"}
      </p>

      <div className="polaroid-scene mx-auto w-full max-w-[310px]">
        <button
          type="button"
          onClick={() => setFlipped((current) => !current)}
          className="polaroid-button block w-full cursor-pointer border-0 bg-transparent p-0 focus-visible:rounded-lg focus-visible:outline-4 focus-visible:outline-offset-8 focus-visible:outline-holly"
          aria-label={
            flipped
              ? "Volver a poner la fotografía boca abajo"
              : "Dar la vuelta a la fotografía"
          }
          aria-pressed={flipped}
        >
          <div
            className={`polaroid-card relative aspect-[4/5] w-full ${
              flipped ? "is-flipped" : ""
            }`}
          >
            {/* REVERSO: cartulina de estraza */}
            <div className="polaroid-face polaroid-back absolute inset-0 flex flex-col items-center justify-center bg-[#d3b27c] p-5 shadow-[0_16px_28px_rgba(56,32,15,0.35)]">
              <div className="cinta" />

              <Heart className="mb-4 h-14 w-14 text-holly" />

              <p className="font-hand text-4xl leading-none text-holly-deep">
                Un recuerdo nuestro
              </p>

              <p className="mt-5 text-sm italic text-ink/70">
                Para descubrirlo,
                <br />
                dale la vuelta
              </p>
            </div>

            {/* ANVERSO: la foto */}
            <div className="polaroid-face polaroid-front absolute inset-0 border-[12px] border-[#fdfaf0] bg-[#fdfaf0] shadow-[0_16px_28px_rgba(56,32,15,0.35)]">
              <div className="cinta" />

              <div className="relative h-[78%] w-full overflow-hidden bg-[#e5dac4]">
                {hasImage ? (
                  <Image
                    src={image!}
                    alt={title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 80vw, 310px"
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-5 text-ink-soft">
                    <span className="font-hand text-2xl">
                      Aquí aparecerá vuestra fotografía
                    </span>
                  </div>
                )}
              </div>

              <div className="flex h-[22%] items-center justify-center px-2">
                <p className="line-clamp-2 font-hand text-3xl leading-none text-holly-deep">
                  {title}
                </p>
              </div>
            </div>
          </div>
        </button>
      </div>

      <div
        className={`polaroid-message mx-auto mt-8 max-w-sm ${
          flipped ? "is-visible" : ""
        }`}
        aria-hidden={!flipped}
      >
        {flipped && (
          <div className="rounded-md bg-paper-deep px-6 py-5 shadow-sm">
            <p className="whitespace-pre-line font-hand text-[1.6rem] leading-snug text-ink">
              {message}
            </p>

            <Heart className="mx-auto mt-3 h-5 w-5 text-holly" />
          </div>
        )}
      </div>

      <p className="mt-5 font-hand text-2xl text-ink-soft">
        {flipped
          ? "Toca la foto para volver a girarla"
          : "Toca la polaroid para descubrirla"}
      </p>
    </section>
  );
}
