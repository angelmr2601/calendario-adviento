
"use client";

import { useState, type CSSProperties } from "react";
import { Heart, Star } from "@/components/Ornaments";

type RomanticQuizProps = {
  day: number;
  question?: string;
  message: string;
  options?: string[];
  correctAnswer?: number;
  reward?: string;
};

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 6) * 0.12}s`,
  duration: `${2 + (i % 4) * 0.25}s`,
  rotation: `${(i * 71) % 360}deg`,
}));

/**
 * Coloca la respuesta correcta en una posición que depende del día,
 * para que no sea siempre la misma letra. Es determinista (igual en
 * servidor y cliente) y no modifica surprises.json.
 */
function arrangeOptions(
  options: string[],
  correct: number | undefined,
  day: number
) {
  const n = options.length;

  if (
    n < 2 ||
    correct === undefined ||
    !Number.isInteger(correct) ||
    correct < 0 ||
    correct >= n
  ) {
    return { options, correctAnswer: correct };
  }

  const target = (day * 2 + Math.floor(day / 2)) % n;
  const others = options.filter((_, i) => i !== correct);

  return {
    options: [
      ...others.slice(0, target),
      options[correct],
      ...others.slice(target),
    ],
    correctAnswer: target,
  };
}

export default function RomanticQuiz({
  day,
  question,
  message,
  options: rawOptions = [],
  correctAnswer: rawCorrectAnswer,
  reward,
}: RomanticQuizProps) {
  const { options, correctAnswer } = arrangeOptions(
    rawOptions,
    rawCorrectAnswer,
    day
  );

  const [selected, setSelected] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);

  const hasCorrectAnswer =
    Number.isInteger(correctAnswer) &&
    correctAnswer !== undefined &&
    correctAnswer >= 0 &&
    correctAnswer < options.length;

  function selectAnswer(index: number) {
    if (completed || selected !== null) return;

    setSelected(index);
    setAttempts((value) => value + 1);

    if (!hasCorrectAnswer || index === correctAnswer) {
      setCompleted(true);
    }
  }

  function tryAgain() {
    setSelected(null);
  }

  return (
    <section className="relative mx-auto w-full max-w-lg text-center">
      {/* CONFETI */}
      {completed && (
        <div
          className="quiz-confetti pointer-events-none absolute inset-0 z-20 overflow-hidden"
          aria-hidden="true"
        >
          {PARTICLES.map((particle) => (
            <span
              key={particle.id}
              className={`quiz-confetti-piece ${
                particle.id % 4 === 0
                  ? "bg-glow"
                  : particle.id % 4 === 1
                    ? "bg-holly"
                    : particle.id % 4 === 2
                      ? "bg-[#38845a]"
                      : "bg-white"
              }`}
              style={
                {
                  left: particle.left,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                  "--rotation": particle.rotation,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className="relative z-10">
        {/* ENCABEZADO */}
        <p className="mb-1 flex items-center justify-center gap-2 font-hand text-3xl text-holly">
          <Heart className="quiz-heart h-5 w-5" />
          Nuestro pequeño concurso
        </p>

        {message && (
          <p className="mb-4 text-sm italic text-ink-soft">{message}</p>
        )}

        {/* PREGUNTA */}
        <div className="mb-4 rounded-md border-2 border-dashed border-kraft bg-[#fffbee] px-4 py-4">
          <h3 className="font-display text-xl leading-snug text-ink sm:text-2xl">
            {question || "¿Qué es lo que más nos gusta hacer juntos?"}
          </h3>
        </div>

        {/* RESPUESTAS */}
        {options.length > 0 ? (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isSelected = selected === index;
              const isRight =
                hasCorrectAnswer && index === correctAnswer;

              const showRight = completed && isSelected;
              const showWrong =
                isSelected && !completed;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectAnswer(index)}
                  disabled={completed || selected !== null}
                  className={`quiz-answer flex min-h-12 w-full items-center gap-3 rounded-md border-2 px-3 py-2 text-left transition-all duration-300 ${
                    showRight
                      ? "border-[#2f6e4d] bg-[#e4f3e5] text-[#245c3b]"
                      : showWrong
                        ? "quiz-answer-wrong border-holly-soft bg-[#fff0ef] text-holly-deep"
                        : "border-kraft bg-[#fffbee] text-ink hover:border-holly-soft hover:bg-white"
                  } disabled:cursor-default`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      showRight
                        ? "bg-[#2f6e4d] text-white"
                        : showWrong
                          ? "bg-holly text-white"
                          : "bg-holly text-paper"
                    }`}
                  >
                    {showRight
                      ? "✓"
                      : showWrong
                        ? "×"
                        : String.fromCharCode(65 + index)}
                  </span>

                  <span className="flex-1 text-base leading-snug sm:text-lg">
                    {option}
                  </span>

                  {completed && isRight && !isSelected && (
                    <span className="text-xs text-green-700">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-kraft p-4 text-sm text-ink-soft">
            Configura las respuestas desde el panel.
          </p>
        )}

        {/* RESPUESTA INCORRECTA */}
        {!completed && selected !== null && (
          <div
            className="quiz-feedback mt-4 rounded-md bg-[#fbe3e1] px-4 py-3"
            role="status"
            aria-live="polite"
          >
            <p className="font-hand text-3xl leading-none text-holly-deep">
              ¡Casi, mi amor!
            </p>

            <p className="mt-1 text-sm text-ink-soft">
              Esa no era. ¡Vamos con otro intento!
            </p>

            <button
              type="button"
              onClick={tryAgain}
              className="mt-3 rounded-full bg-holly px-5 py-2 font-display text-sm text-paper shadow-[0_3px_0_var(--color-holly-deep)] transition hover:bg-holly-soft"
            >
              Volver a intentarlo
            </button>
          </div>
        )}

        {/* RESPUESTA CORRECTA */}
        {completed && (
          <div
            className="quiz-success mt-4 rounded-md bg-[#fff4cf] px-4 py-4"
            role="status"
            aria-live="polite"
          >
            <Star className="mx-auto mb-1 h-6 w-6 text-glow drop-shadow" />

            <h4 className="font-hand text-3xl leading-none text-holly">
              {hasCorrectAnswer
                ? "¡Has acertado, mi amor!"
                : "¡Me encanta tu respuesta!"}
            </h4>

            <p className="mt-2 text-sm leading-relaxed text-ink">
              {hasCorrectAnswer
                ? attempts === 1
                  ? "¡A la primera! Me conoces demasiado bien."
                  : "¡Lo importante es que lo conseguimos!"
                : "Otro bonito recuerdo para nosotros."}
            </p>

            {reward && (
              <div className="mt-3 rounded-md border-2 border-dashed border-holly-soft bg-white/80 px-3 py-3">
                <p className="font-hand text-2xl leading-none text-ink-soft">
                  Tu recompensa
                </p>

                <p className="mt-1 font-display text-xl text-holly">
                  {reward}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
