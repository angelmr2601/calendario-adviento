import data from "./surprises.json";

export type SurpriseType = "letter" | "photo" | "quiz" | "voucher" | "special";
export type Surprise = {
  day: number;
  type: SurpriseType;
  title: string;
  message: string;
  emoji: string;
  image?: string;
  question?: string;
  options?: string[];
  correctAnswer?: number;
  reward?: string;
  songUrl?: string;
};

// Conservamos esta exportación para que tu calendario siga funcionando sin cambios.
export const surprises = data as Surprise[];
