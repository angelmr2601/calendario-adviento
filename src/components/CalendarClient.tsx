"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Snowfall from "@/components/Snowfall";
import Lights from "@/components/Lights";
import Landscape from "@/components/Landscape";
import GiftReveal from "@/components/GiftReveal";
import SurpriseContent from "@/components/SurpriseContent";
import { DOOR_ORNAMENTS, Heart, Lock, Sprig } from "@/components/Ornaments";
import type { Surprise } from "@/data/surprises";
import type { Progress, ProgressAction } from "@/lib/progress-types";

type DayItem = {
  day: number;
  unlocked: boolean;
  surprise: Surprise | null;
};

type Today = { y: number; m: number; d: number };

// Cada parche tiene un color, un adorno y una inclinación propios
// para que el tablero parezca hecho a mano y no una cuadrícula.
const TILTS = [-1.4, 0.9, -0.5, 1.4, -1, 0.6];
const toneOf = (day: number) => (5 * day + Math.floor(day / 4)) % 4;
const ornamentOf = (day: number) => DOOR_ORNAMENTS[(day * 5) % DOOR_ORNAMENTS.length];
const tiltOf = (day: number) => TILTS[(day * 7) % TILTS.length];

const DOOR_OPEN_MS = 950;

const isPreview = () =>
  new URLSearchParams(window.location.search).get("preview") === "true";

const union = (a: number[], b: number[]) =>
  Array.from(new Set([...a, ...b])).sort((x, y) => x - y);

const voucherKey = (day: number) => `adviento-voucher-2026-${day}`;

/** Avisa al servidor (que lo guarda en Supabase). Si falla no pasa nada: queda en este dispositivo. */
function sendProgress(day: number, action: ProgressAction) {
  fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ day, action }),
    keepalive: true,
  }).catch(() => {});
}

function readLocalOpened(): number[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem("opened-days") || "[]");
    return Array.isArray(saved)
      ? saved.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= 24)
      : [];
  } catch {
    return [];
  }
}

function readLocalRedeemed(): number[] {
  const days: number[] = [];
  try {
    for (let d = 1; d <= 24; d++) {
      if (localStorage.getItem(voucherKey(d)) === "redeemed") days.push(d);
    }
  } catch {
    // El navegador puede bloquear el almacenamiento.
  }
  return days;
}

/** Fecha de hoy en Madrid (la misma zona que usa el servidor para desbloquear). */
function madridToday(): Today {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);

  return { y: get("year"), m: get("month"), d: get("day") };
}

/** Días que faltan para que se abra la puerta `day` (diciembre de 2026). */
function daysUntilDoor(day: number, today: Today) {
  return Math.round(
    (Date.UTC(2026, 11, day) - Date.UTC(today.y, today.m - 1, today.d)) /
      86_400_000
  );
}

function lockedMessage(day: number, today: Today | null) {
  const base = `Esta puerta se abre el ${day} de diciembre.`;
  if (!today) return base;

  const left = daysUntilDoor(day, today);
  if (left === 1) return "Esta puerta se abre mañana.";
  if (left > 1) return `${base} Faltan ${left} días.`;
  return base;
}

export default function CalendarClient({
  days,
  progress,
}: {
  days: DayItem[];
  progress: Progress;
}) {
  const [selected, setSelected] = useState<Surprise | null>(null);
  const [revealing, setRevealing] = useState<Surprise | null>(null);
  const [openingDay, setOpeningDay] = useState<number | null>(null);
  const [opened, setOpened] = useState<number[]>(progress.opened);
  const [redeemed, setRedeemed] = useState<number[]>(progress.redeemed);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState<Today | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [nudged, setNudged] = useState<number | null>(null);

  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- al montar se unen los datos del servidor con los del navegador (localStorage no existe en el servidor) */
  useEffect(() => {
    const localOpened = readLocalOpened();
    const localRedeemed = readLocalRedeemed();
    const synced = localStorage.getItem("adviento-synced") === "1";

    // Las puertas abiertas nunca se "cierran": se unen las de Supabase y las de este dispositivo.
    setOpened(union(progress.opened, localOpened));

    // Una vez sincronizado este dispositivo, manda Supabase (así "Restaurar vale" funciona entre móviles).
    setRedeemed(
      progress.remote && synced
        ? progress.redeemed
        : union(progress.redeemed, localRedeemed)
    );

    // Primera vez con Supabase: sube lo que ya existía solo en este dispositivo.
    if (progress.remote && !synced && !isPreview()) {
      for (const day of localOpened) {
        if (!progress.opened.includes(day)) sendProgress(day, "open");
      }
      for (const day of localRedeemed) {
        if (!progress.redeemed.includes(day)) sendProgress(day, "redeem");
      }
      try {
        localStorage.setItem("adviento-synced", "1");
      } catch {
        // sin almacenamiento: se reintentará la próxima vez
      }
    }

    setToday(madridToday());
    setReady(true);

    return () => {
      for (const timer of [openTimer, noticeTimer, nudgeTimer]) {
        if (timer.current) clearTimeout(timer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Cerrar la sorpresa con Escape
  useEffect(() => {
    if (!selected) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  function markOpened(surprise: Surprise) {
    const updated = Array.from(new Set([...opened, surprise.day]));

    setOpened(updated);
    localStorage.setItem("opened-days", JSON.stringify(updated));
    setSelected(surprise);

    if (progress.remote && !isPreview()) sendProgress(surprise.day, "open");
  }

  function changeRedeemed(day: number, value: boolean) {
    setRedeemed((prev) =>
      value ? union(prev, [day]) : prev.filter((d) => d !== day)
    );

    try {
      if (value) localStorage.setItem(voucherKey(day), "redeemed");
      else localStorage.removeItem(voucherKey(day));
    } catch {
      // Se mantiene en memoria durante esta sesión.
    }

    if (progress.remote && !isPreview()) {
      sendProgress(day, value ? "redeem" : "unredeem");
    }
  }

  function showLocked(day: number) {
    setNotice(lockedMessage(day, today));
    setNudged(day);

    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);

    noticeTimer.current = setTimeout(() => setNotice(null), 3400);
    nudgeTimer.current = setTimeout(() => setNudged(null), 480);
  }

  function openDay(item: DayItem) {
    if (revealing || openingDay !== null) return;

    if (!item.unlocked || !item.surprise) {
      showLocked(item.day);
      return;
    }

    const surprise = item.surprise;
    if (!isPreview() && opened.includes(item.day)) {
      setSelected(surprise);
      return;
    }

    setSelected(null);
    setNotice(null);

    // Las sorpresas especiales (la canción, la Nochebuena…) conservan
    // el regalo grande a pantalla completa. El resto abre su propia puerta.
    if (surprise.type === "special") {
      setRevealing(surprise);
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    setOpeningDay(item.day);

    openTimer.current = setTimeout(
      () => {
        markOpened(surprise);
        setOpeningDay(null);
      },
      reduceMotion ? 150 : DOOR_OPEN_MS
    );
  }

  function finishReveal() {
    if (!revealing) return;

    markOpened(revealing);
    setRevealing(null);
  }

  function getSurpriseWithImage(surprise: Surprise): Surprise {
    if (surprise.type !== "photo") return surprise;

    return {
      ...surprise,
      image: `/api/private-photo/${surprise.day}${isPreview() ? "?preview=true" : ""}`,
    };
  }

  const isLetter = selected?.type === "letter";
  // El vale lleva su propio título dentro del ticket (y así no destripa el regalo)
  const hideTitle = isLetter || selected?.type === "voucher";

  // La puerta más reciente que aún no se ha abierto brilla un poco
  const newestDay = ready
    ? Math.max(
        0,
        ...days
          .filter((d) => d.unlocked && d.surprise && !opened.includes(d.day))
          .map((d) => d.day)
      )
    : 0;

  // Cuenta atrás: solo mientras todavía no se ha abierto ninguna puerta
  const firstLeft = today ? daysUntilDoor(1, today) : null;
  const showCountdown =
    ready && !days.some((d) => d.unlocked) && firstLeft !== null && firstLeft > 0;

  return (
    <main className="noche relative min-h-screen overflow-hidden px-4 pb-56 pt-32 text-paper sm:pb-64">
      <Lights />
      <Snowfall />
      <Landscape />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="font-hand text-2xl text-glow md:text-3xl">
          Nuestro pequeño rincón de Navidad
        </p>

        <h1 className="titulo mt-2 text-[2.6rem] leading-[1.08] md:text-6xl">
          24 días,
          <br />
          24 razones para quererte
        </h1>

        <Sprig className="mx-auto my-7 h-7 w-32 text-paper" />

        <p className="mx-auto mb-3 max-w-md text-lg italic leading-relaxed text-paper/90 md:text-xl">
          Detrás de cada puerta hay un pequeño regalo pensado solo para ti.
          <br />
          Porque contigo, cada día es especial.
          <Heart className="ml-2 inline-block h-[0.85em] w-[0.85em] -translate-y-px text-holly-soft" />
        </p>

        <p className="mb-9 font-hand text-2xl text-kraft" aria-live="polite">
          {showCountdown
            ? firstLeft === 1
              ? "Mañana se abre la primera puerta"
              : `Faltan ${firstLeft} días para abrir la primera puerta`
            : "Una puerta nueva cada día de diciembre"}
        </p>

        <div className="tablero mx-auto max-w-3xl">
          <i className="clavo left-2 top-2" />
          <i className="clavo right-2 top-2" />
          <i className="clavo bottom-2 left-2" />
          <i className="clavo bottom-2 right-2" />

          <div className="tablero-fieltro">
            <div className="grid grid-cols-4 gap-x-2.5 gap-y-3.5 sm:gap-x-4 sm:gap-y-5 md:grid-cols-6">
              {days.map((item) => {
                const wasOpened = opened.includes(item.day);
                const locked = !item.unlocked || !item.surprise;
                const state = locked
                  ? "locked"
                  : wasOpened
                    ? "viewed"
                    : item.day === newestDay
                      ? "new"
                      : "ready";
                const Icon = ornamentOf(item.day);

                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => openDay(item)}
                    disabled={!!revealing || openingDay !== null}
                    aria-disabled={locked || undefined}
                    data-tone={toneOf(item.day)}
                    data-state={state === "ready" ? undefined : state}
                    data-opening={openingDay === item.day ? "true" : undefined}
                    style={{ "--tilt": `${tiltOf(item.day)}deg` } as CSSProperties}
                    aria-label={`Día ${item.day}${
                      locked ? ", bloqueado" : wasOpened ? ", abierto" : ""
                    }`}
                    className={`door ${locked ? "" : "cursor-pointer"} ${
                      nudged === item.day ? "door-nudge" : ""
                    }`}
                  >
                    {/* Interior encendido, visible cuando la solapa se abre */}
                    <span className="door-back" aria-hidden="true">
                      <Heart className="door-icon" />
                      <span className="door-num">{item.day}</span>
                    </span>

                    {/* Solapa de fieltro */}
                    <span className="door-flap" aria-hidden="true">
                      {locked ? (
                        <Lock className="door-icon relative z-10" />
                      ) : (
                        <Icon className="door-icon relative z-10" />
                      )}

                      <span className="door-num relative z-10">{item.day}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-12 font-hand text-4xl text-paper">
          Con todo mi amor, para ti.
          <Heart className="ml-2 inline-block h-[0.7em] w-[0.7em] text-holly-soft" />
        </p>

        <p className="mt-2 text-sm text-paper/45">Navidad 2026</p>
      </div>

      {/* AVISO DE PUERTA CERRADA */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="door-notice fixed inset-x-4 bottom-6 z-[60] mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-3 rounded-md border-2 border-holly bg-paper px-5 py-3 text-ink shadow-[0_14px_30px_-8px_rgba(0,0,0,0.7)]"
        >
          <Lock className="h-5 w-5 shrink-0 text-holly" />
          <p className="font-hand text-2xl leading-tight">{notice}</p>
        </div>
      )}

      {/* SORPRESA ABIERTA */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-pine-deep/90 p-3 sm:items-center sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="surprise-title"
            className={`papel surprise-modal my-auto w-full overflow-y-auto text-center text-ink ${
              isLetter
                ? "max-h-[94dvh] max-w-2xl px-4 pb-6 pt-7 sm:px-10"
                : selected.type === "quiz"
                  ? "max-h-[94dvh] max-w-lg px-5 pb-5 pt-6 sm:px-7"
                  : "max-h-[94dvh] max-w-lg p-6 sm:p-8"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Cerrar sorpresa"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full text-holly transition hover:bg-holly/10 focus-visible:outline-2 focus-visible:outline-holly"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <p className="mb-2 font-hand text-2xl text-holly-deep">
              Día {selected.day}
            </p>

            {hideTitle ? (
              <h2 id="surprise-title" className="sr-only">
                {selected.title}
              </h2>
            ) : (
              <h2
                id="surprise-title"
                className="mb-5 font-display text-3xl leading-tight text-holly"
              >
                {selected.title}
              </h2>
            )}

            <SurpriseContent
              key={selected.day}
              surprise={getSurpriseWithImage(selected)}
              redeemed={redeemed.includes(selected.day)}
              onRedeemChange={(value) => changeRedeemed(selected.day, value)}
            />

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-7 rounded-full bg-holly px-8 py-2.5 font-display text-lg text-paper shadow-[0_3px_0_var(--color-holly-deep)] transition hover:bg-holly-soft active:translate-y-px active:shadow-[0_2px_0_var(--color-holly-deep)]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* REGALO GRANDE: solo para las sorpresas especiales */}
      {revealing && (
        <GiftReveal
          key={revealing.day}
          day={revealing.day}
          onComplete={finishReveal}
        />
      )}
    </main>
  );
}
