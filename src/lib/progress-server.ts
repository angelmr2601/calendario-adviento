import "server-only";
import { getSupabase } from "@/lib/supabase/server";
import type { Progress, ProgressAction } from "@/lib/progress-types";

type ProgressRow = {
  day: number;
  opened_at: string | null;
  redeemed_at: string | null;
};

/** Progreso guardado en Supabase (o vacío y remote:false si no hay conexión). */
export async function getProgress(): Promise<Progress> {
  const supabase = getSupabase();
  if (!supabase) return { remote: false, opened: [], redeemed: [] };

  const { data, error } = await supabase
    .from("advent_progress")
    .select("day, opened_at, redeemed_at");

  if (error) {
    // Por ejemplo, si aún no se ha ejecutado el SQL: la web sigue en modo local.
    console.error("[supabase] No se pudo leer el progreso:", error.message);
    return { remote: false, opened: [], redeemed: [] };
  }

  const rows = (data ?? []) as ProgressRow[];

  return {
    remote: true,
    opened: rows.filter((r) => r.opened_at).map((r) => r.day),
    redeemed: rows.filter((r) => r.redeemed_at).map((r) => r.day),
  };
}

export async function setProgress(day: number, action: ProgressAction) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.rpc("advent_progress_set", {
    p_day: day,
    p_action: action,
  });

  if (error) throw new Error(error.message);
}

/** Para el panel de administración local. */
export async function listProgress(): Promise<ProgressRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("advent_progress")
    .select("day, opened_at, redeemed_at")
    .order("day");

  if (error) throw new Error(error.message);
  return (data ?? []) as ProgressRow[];
}
