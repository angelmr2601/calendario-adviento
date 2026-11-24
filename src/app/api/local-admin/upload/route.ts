import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getSupabase, MEMORIES_BUCKET } from "@/lib/supabase/server";



export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") return NextResponse.json({ error: "Disponible solo en desarrollo" }, { status: 403 });
  const host = request.headers.get("host") || "";
  const origin = request.headers.get("origin") || "";
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) || !origin || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Selecciona una imagen de máximo 5 MB" }, { status: 400 });
    }
    const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    const ext = types[file.type];
    if (!ext) return NextResponse.json({ error: "Solo JPG, PNG o WEBP" }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    const jpg = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const png = buf.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const webp = buf.length > 12 && buf.toString("ascii",0,4) === "RIFF" && buf.toString("ascii",8,12) === "WEBP";
    if (!(ext === "jpg" && jpg || ext === "png" && png || ext === "webp" && webp)) {
      return NextResponse.json({ error: "El archivo no es una imagen válida" }, { status: 400 });
    }
    const filename = `recuerdo-${randomUUID()}.${ext}`;
    const supabase = getSupabase();

    if (supabase) {
      // Bucket privado de Supabase Storage (visible en la web publicada al momento)
      const { error } = await supabase.storage
        .from(MEMORIES_BUCKET)
        .upload(filename, buf, { contentType: file.type, upsert: false });
      if (error) {
        return NextResponse.json({ error: `Supabase: ${error.message}` }, { status: 500 });
      }
    } else {
      const dir = join(process.cwd(), "private", "memories");
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, filename), buf, { flag: "wx" });
    }
    return NextResponse.json({ image: `/memories/${filename}` });
  } catch {
    return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 });
  }
}
