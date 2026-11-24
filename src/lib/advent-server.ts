import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Surprise } from "@/data/surprises";
import { getSupabase } from "@/lib/supabase/server";
import { fromRow, toRow, type SurpriseRow } from "@/lib/surprise-rows";

const JSON_FILE = join(process.cwd(), "src", "data", "surprises.json");

async function readJson(): Promise<Surprise[]> {
  const value: unknown = JSON.parse(await readFile(JSON_FILE, "utf8"));
  if (!Array.isArray(value)) throw new Error("JSON de sorpresas inválido");
  return value as Surprise[];
}

/** Dónde se guardan ahora las sorpresas. */
export function storageMode(): "supabase" | "json" {
  return getSupabase() ? "supabase" : "json";
}

/**
 * Las 24 sorpresas. Con Supabase, cada día guardado allí tiene prioridad y
 * los que falten se completan con surprises.json, así que la web nunca se
 * queda con huecos aunque la tabla esté a medio llenar o falle la conexión.
 */
export async function getAllSurprises(): Promise<Surprise[]> {
  const supabase = getSupabase();
  if (!supabase) return readJson();

  const fallback = await readJson().catch(() => [] as Surprise[]);

  const { data, error } = await supabase
    .from("advent_surprises")
    .select("*")
    .order("day");

  if (error) {
    console.error("[supabase] No se pudieron leer las sorpresas:", error.message);
    return fallback;
  }

  const byDay = new Map<number, Surprise>(fallback.map((s) => [s.day, s]));
  for (const row of (data ?? []) as SurpriseRow[]) {
    byDay.set(row.day, fromRow(row));
  }

  return [...byDay.values()].sort((a, b) => a.day - b.day);
}

/** Guarda un día: en Supabase si está conectado, y si no en surprises.json. */
export async function saveSurprise(next: Surprise, all: Surprise[]) {
  const supabase = getSupabase();

  if (supabase) {
    const { error } = await supabase
      .from("advent_surprises")
      .upsert(toRow(next), { onConflict: "day" });

    if (error) throw new Error(`Supabase: ${error.message}`);
    return;
  }

  await writeFile(JSON_FILE, JSON.stringify(all, null, 2) + "\n", "utf8");
}

export function unlockedOnServer(day: number, preview = false): boolean {
  if (preview && process.env.NODE_ENV === "development") return true;
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const piece = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const year = piece("year"), month = piece("month"), date = piece("day");
  return year > 2026 || (year === 2026 && month === 12 && date >= day);
}

export function localPreview(host: string, queryValue?: string): boolean {
  return process.env.NODE_ENV === "development" &&
    /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) && queryValue === "true";
}
