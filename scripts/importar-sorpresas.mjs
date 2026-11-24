// Sube a Supabase las sorpresas de src/data/surprises.json y las fotos de
// private/memories (o public/memories).
//
//   npm run importar             → solo añade los días que aún no existen
//   npm run importar -- --forzar → sobrescribe también los que ya existen
import { createClient } from "@supabase/supabase-js";
import { readFile, readdir } from "node:fs/promises";
import { join, extname } from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local"
  );
  process.exit(1);
}

const force = process.argv.includes("--forzar");
const supabase = createClient(url, key, { auth: { persistSession: false } });

const items = JSON.parse(await readFile("src/data/surprises.json", "utf8"));

const rows = items.map((s) => ({
  day: s.day,
  type: s.type,
  title: s.title ?? "",
  message: s.message ?? "",
  emoji: s.emoji ?? "🎁",
  image: s.image ?? null,
  question: s.question ?? null,
  options: s.options && s.options.length ? s.options : null,
  correct_answer: Number.isInteger(s.correctAnswer) ? s.correctAnswer : null,
  reward: s.reward ?? null,
  song_url: s.songUrl ?? null,
}));

const { error } = await supabase
  .from("advent_surprises")
  .upsert(rows, { onConflict: "day", ignoreDuplicates: !force });

if (error) {
  console.error("No se pudieron subir las sorpresas:", error.message);
  process.exit(1);
}

console.log(
  force
    ? `✔ ${rows.length} sorpresas subidas (sobrescribiendo las existentes)`
    : `✔ ${rows.length} sorpresas revisadas (solo se añaden las que faltaban)`
);

const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
let photos = 0;

for (const dir of ["private/memories", "public/memories"]) {
  let files = [];
  try {
    files = await readdir(dir);
  } catch {
    continue;
  }

  for (const name of files) {
    const contentType = types[extname(name).toLowerCase()];
    if (!contentType) continue;

    const { error: uploadError } = await supabase.storage
      .from("memories")
      .upload(name, await readFile(join(dir, name)), { contentType, upsert: true });

    if (uploadError) {
      console.error(`✘ ${name}: ${uploadError.message}`);
    } else {
      photos++;
      console.log(`✔ foto ${name}`);
    }
  }
}

console.log(photos ? `✔ ${photos} fotos subidas` : "No había fotos locales que subir");
