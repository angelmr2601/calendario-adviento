"use client";

import { useState } from "react";
import { Bow, Heart, Star } from "@/components/Ornaments";

type RomanticVoucherProps = {
  day: number;
  title: string;
  message: string;
  reward?: string;
  /** Si el vale ya está canjeado (lo decide CalendarClient, que lo sincroniza con Supabase) */
  redeemed: boolean;
  onRedeemChange: (redeemed: boolean) => void;
};

export default function RomanticVoucher({
  day,
  title,
  message,
  reward,
  redeemed,
  onRedeemChange,
}: RomanticVoucherProps) {
  const [revealed, setRevealed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function redeemVoucher() {
    onRedeemChange(true);
    setConfirming(false);
  }

  function restoreVoucher() {
    onRedeemChange(false);
    setConfirming(false);
  }

  return (
    <section className="mx-auto w-full max-w-md text-center">
      <p className="mb-1 font-hand text-3xl text-holly">
        Un regalo especial para ti
      </p>

      <p className="mb-6 text-sm italic text-ink-soft">
        {revealed
          ? "Este pequeño regalo es solo para ti"
          : "Hay una sorpresa escondida en este paquete…"}
      </p>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="voucher-hidden group relative mx-auto block w-full max-w-[330px] overflow-hidden rounded-md bg-holly px-5 pb-9 pt-14 text-paper shadow-[0_18px_30px_-8px_rgba(80,10,15,0.55)] transition-transform hover:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-holly"
          aria-label="Descubrir vale regalo"
        >
          <div className="pointer-events-none absolute inset-0 bg-[image:var(--grain-light)] opacity-60" />

          {/* Cintas de estraza */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 w-11 -translate-x-1/2 bg-kraft shadow-[inset_2px_0_0_rgba(0,0,0,0.1),inset_-2px_0_0_rgba(255,255,255,0.3)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[42%] h-9 bg-kraft shadow-[inset_0_2px_0_rgba(0,0,0,0.1),inset_0_-2px_0_rgba(255,255,255,0.3)]"
          />

          <Bow className="absolute left-1/2 top-[28%] z-10 h-16 w-24 -translate-x-1/2 -translate-y-1/2 text-[#2f7a53] drop-shadow-[0_2px_1px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105" />

          <p className="relative z-10 mt-24 inline-block rounded-sm bg-paper px-5 py-2 shadow">
            <span className="block font-hand text-3xl leading-none text-holly-deep">
              Para ti
            </span>
            <span className="mt-1 block text-sm italic text-ink-soft">
              Toca para abrirlo
            </span>
          </p>
        </button>
      ) : (
        <div className="voucher-reveal relative mx-auto w-full max-w-[380px]">
          <div className="overflow-hidden rounded-md border-2 border-holly bg-[#fffbee] shadow-[0_18px_36px_-10px_rgba(76,33,24,0.45)]">
            <div className="bg-holly px-5 py-4 text-center">
              <Star className="mx-auto mb-1 h-5 w-5 text-glow" />

              <p className="font-hand text-2xl leading-none text-[#ffe7b0]">
                Nuestro calendario de Adviento
              </p>

              <h3 className="mt-2 font-display text-xl leading-snug text-paper">
                {title}
              </h3>
            </div>

            <div className="relative px-5 py-7 sm:px-7">
              <span
                aria-hidden="true"
                className="absolute -left-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full border-r-2 border-holly bg-paper"
              />
              <span
                aria-hidden="true"
                className="absolute -right-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full border-l-2 border-holly bg-paper"
              />

              <p className="font-hand text-2xl text-ink-soft">
                Vale canjeable por
              </p>

              <h4 className="mt-1 font-display text-2xl leading-snug text-holly">
                {reward || "Una sorpresa especial"}
              </h4>

              <div className="mx-auto my-5 h-px w-24 border-t-2 border-dashed border-kraft" />

              <p className="whitespace-pre-line text-lg leading-7 text-ink">
                {message}
              </p>

              <div className="mt-6 border-t-2 border-dashed border-kraft pt-4">
                <p className="font-hand text-2xl text-ink-soft">
                  Día {day}, Navidad 2026
                </p>

                <p className="mt-1 font-hand text-2xl text-holly">
                  Hecho con todo mi amor
                  <Heart className="ml-1.5 inline-block h-[0.75em] w-[0.75em]" />
                </p>
              </div>
            </div>
          </div>

          {redeemed && (
            <div
              role="status"
              className="voucher-stamp pointer-events-none absolute right-3 top-24 rotate-[-12deg] rounded-md border-[3px] border-[#2f6e4d] bg-[#e5f3e9]/95 px-4 py-1.5 font-display text-lg tracking-wide text-[#27603d] shadow-lg"
            >
              Canjeado
            </div>
          )}
        </div>
      )}

      {revealed && (
        <div className="mt-6">
          {redeemed ? (
            <div className="rounded-md border border-[#bcd8c4] bg-[#ecf6ee] px-4 py-4">
              <p className="text-lg font-semibold text-[#286240]">
                Este regalo ya está canjeado.
              </p>

              <p className="mt-1 text-sm text-[#52775e]">
                Estado guardado en este dispositivo.
              </p>

              <button
                type="button"
                onClick={restoreVoucher}
                className="mt-3 text-sm font-semibold text-[#286240] underline underline-offset-4"
              >
                Restaurar vale
              </button>
            </div>
          ) : confirming ? (
            <div className="rounded-md bg-paper-deep p-4">
              <p className="font-display text-lg text-holly">
                ¿Seguro que quieres canjearlo?
              </p>

              <p className="mt-1 text-sm text-ink-soft">
                El vale quedará marcado como utilizado.
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-full border-2 border-kraft px-5 py-2 text-sm font-semibold text-ink-soft hover:bg-paper"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={redeemVoucher}
                  className="rounded-full bg-[#2f6e4d] px-5 py-2 text-sm font-semibold text-white shadow-[0_3px_0_#1c4a35] hover:bg-[#38805a]"
                >
                  Confirmar canje
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-full bg-holly px-7 py-2.5 font-display text-lg text-paper shadow-[0_3px_0_var(--color-holly-deep)] transition hover:bg-holly-soft"
            >
              Canjear este regalo
            </button>
          )}
        </div>
      )}
    </section>
  );
}
