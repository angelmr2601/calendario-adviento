import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const MEMORIES_BUCKET = "memories";

let cached: SupabaseClient | null | undefined;

/**
 * Cliente de Supabase SOLO para el servidor. Usa la clave secreta, que se
 * salta las políticas RLS: nunca debe llegar al navegador (no uses el prefijo
 * NEXT_PUBLIC_ en SUPABASE_SECRET_KEY).
 * Devuelve null si no hay variables de entorno: la web sigue funcionando
 * con surprises.json y el progreso se guarda solo en el navegador.
 */
export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  cached =
    url && key
      ? createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        })
      : null;

  return cached;
}
