export type ProgressAction = "open" | "redeem" | "unredeem";

export type Progress = {
  /** true si Supabase está conectado y el progreso se guarda en el servidor */
  remote: boolean;
  opened: number[];
  redeemed: number[];
};
