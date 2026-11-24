import { NextRequest, NextResponse } from "next/server";
import { getAllSurprises, unlockedOnServer } from "@/lib/advent-server";
import { setProgress } from "@/lib/progress-server";
import { getSupabase } from "@/lib/supabase/server";
import type { ProgressAction } from "@/lib/progress-types";

const ACTIONS: ProgressAction[] = ["open", "redeem", "unredeem"];

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

export async function POST(request: NextRequest) {
  // Solo peticiones hechas desde esta misma web
  const host = request.headers.get("host") || "";
  const origin = request.headers.get("origin");

  try {
    if (!origin || new URL(origin).host !== host) return fail("Acceso denegado", 403);
  } catch {
    return fail("Acceso denegado", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Petición inválida", 400);
  }

  const { day, action } = (body ?? {}) as { day?: unknown; action?: unknown };

  if (
    typeof day !== "number" ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > 24 ||
    !ACTIONS.includes(action as ProgressAction)
  ) {
    return fail("Datos inválidos", 400);
  }

  // Solo cuenta lo que ya está desbloqueado según la fecha real del servidor.
  // (El modo preview nunca escribe en Supabase.)
  if (!unlockedOnServer(day, false)) return fail("Esa puerta aún no está abierta", 403);

  if (!getSupabase()) return NextResponse.json({ ok: true, stored: false });

  if (action !== "open") {
    const surprise = (await getAllSurprises()).find((s) => s.day === day);
    if (surprise?.type !== "voucher") return fail("Ese día no tiene vale", 400);
  }

  try {
    await setProgress(day, action as ProgressAction);
  } catch (error) {
    console.error("[supabase] No se pudo guardar el progreso:", error);
    return fail("No se pudo guardar", 502);
  }

  return NextResponse.json({ ok: true, stored: true });
}
