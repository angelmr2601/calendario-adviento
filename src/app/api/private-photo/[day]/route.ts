import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { getAllSurprises, localPreview, unlockedOnServer } from "@/lib/advent-server";
import { getSupabase, MEMORIES_BUCKET } from "@/lib/supabase/server";

type Context = { params: Promise<{ day: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { day: rawDay } = await context.params;
  const day = Number(rawDay);
  if (!Number.isInteger(day) || day < 1 || day > 24) return new NextResponse(null, { status: 404 });
  const preview = localPreview(request.headers.get("host") || "", request.nextUrl.searchParams.get("preview") || "");
  if (!unlockedOnServer(day, preview)) return new NextResponse(null, { status: 404 });
  const surprise = (await getAllSurprises()).find((s) => s.day === day);
  if (!surprise || surprise.type !== "photo" || !surprise.image) return new NextResponse(null, { status: 404 });
  const name = basename(surprise.image);
  if (!/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/.test(name)) return new NextResponse(null, { status: 404 });
  let data: Uint8Array | null = null;

  // Con Supabase las fotos están en un bucket privado; si no, en private/memories.
  const supabase = getSupabase();
  if (supabase) {
    const { data: blob } = await supabase.storage.from(MEMORIES_BUCKET).download(name);
    if (blob) data = new Uint8Array(await blob.arrayBuffer());
  }

  if (!data) {
    try {
      data = new Uint8Array(await readFile(join(process.cwd(), "private", "memories", name)));
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  }

  const ext = name.split(".").pop()?.toLowerCase();
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return new NextResponse(data as BodyInit, { headers: { "Content-Type": contentType, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
