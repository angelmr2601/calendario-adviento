import type { Surprise, SurpriseType } from "@/data/surprises";

/** Fila de la tabla public.advent_surprises */
export type SurpriseRow = {
  day: number;
  type: SurpriseType;
  title: string;
  message: string;
  emoji: string;
  image: string | null;
  question: string | null;
  options: string[] | null;
  correct_answer: number | null;
  reward: string | null;
  song_url: string | null;
};

export function fromRow(row: SurpriseRow): Surprise {
  return {
    day: row.day,
    type: row.type,
    title: row.title,
    message: row.message,
    emoji: row.emoji,
    ...(row.image ? { image: row.image } : {}),
    ...(row.question ? { question: row.question } : {}),
    ...(row.options && row.options.length > 0 ? { options: row.options } : {}),
    ...(typeof row.correct_answer === "number"
      ? { correctAnswer: row.correct_answer }
      : {}),
    ...(row.reward ? { reward: row.reward } : {}),
    ...(row.song_url ? { songUrl: row.song_url } : {}),
  };
}

export function toRow(surprise: Surprise) {
  return {
    day: surprise.day,
    type: surprise.type,
    title: surprise.title,
    message: surprise.message,
    emoji: surprise.emoji,
    image: surprise.image ?? null,
    question: surprise.question ?? null,
    options: surprise.options ?? null,
    correct_answer: surprise.correctAnswer ?? null,
    reward: surprise.reward ?? null,
    song_url: surprise.songUrl ?? null,
    updated_at: new Date().toISOString(),
  };
}
