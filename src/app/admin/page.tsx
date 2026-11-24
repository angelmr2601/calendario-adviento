"use client";

import { useEffect, useState } from "react";
import type { Surprise, SurpriseType } from "@/data/surprises";

const types: { value: SurpriseType; label: string; emoji: string }[] = [
  { value: "letter", label: "Carta", emoji: "💌" },
  { value: "photo", label: "Fotografía", emoji: "📸" },
  { value: "quiz", label: "Juego", emoji: "🎮" },
  { value: "voucher", label: "Vale", emoji: "🎁" },
  { value: "special", label: "Especial", emoji: "✨" },
];

export default function AdminPage() {
  const [days, setDays] = useState<Surprise[]>([]);
  const [selected, setSelected] = useState(1);
  const [draft, setDraft] = useState<Surprise | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [storage, setStorage] = useState("json");
  const [progress, setProgress] = useState<{ day: number; opened_at: string | null; redeemed_at: string | null }[]>([]);

  useEffect(() => {
    fetch("/api/local-admin", { cache: "no-store" })
      .then(async res => { if (!res.ok) throw new Error("Editor disponible solo en localhost con npm run dev"); setStorage(res.headers.get("x-storage") || "json"); return res.json(); })
      .then((items: Surprise[]) => { setDays(items); setDraft({ ...items[0], options: [...(items[0].options || [])] }); })
      .catch(err => setMessage(err.message));
  }, []);

  useEffect(() => {
    fetch("/api/local-admin/progress", { cache: "no-store" })
      .then(res => (res.ok ? res.json() : []))
      .then(setProgress)
      .catch(() => {});
  }, []);

  const when = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  function choose(day: number) {
    const found = days.find(x => x.day === day);
    if (!found) return;
    setSelected(day);
    setDraft({ ...found, options: [...(found.options || [])] });
    setMessage("");
  }

  function update<K extends keyof Surprise>(key: K, value: Surprise[K]) {
    setDraft(prev => prev ? { ...prev, [key]: value } : prev);
  }

  async function save() {
    if (!draft) return;
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/local-admin", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "No se pudo guardar");
      setDays(prev => prev.map(x => x.day === draft.day ? draft : x));
      setMessage("✅ Guardado. Vuelve al calendario para comprobarlo.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Error inesperado"); }
    finally { setBusy(false); }
  }

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setMessage("Subiendo fotografía...");
    try {
      const form = new FormData(); form.append("file", file);
      const res = await fetch("/api/local-admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir");
      update("image", data.image);
      setMessage("Foto subida. Pulsa Guardar para asignarla al día.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Error al subir"); }
    finally { setBusy(false); }
  }

  const input = "w-full rounded-xl border border-amber-700/25 bg-white px-3 py-2.5 text-[#173b2b] outline-none focus:border-[#8b1e2d]";
  const label = "mb-1.5 block text-sm font-semibold text-[#173b2b]";

  return (
    <main className="min-h-screen bg-[#f6f0e3] px-4 py-8 text-[#173b2b]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.23em] text-[#8b1e2d]">🎄 Navidad 2026</p>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">Editor de sorpresas</h1>
            <p className="mt-1 text-sm text-gray-600">Solo funciona en tu ordenador, durante el desarrollo.</p></div>
          <a href="/?preview=true" className="rounded-full bg-[#173b2b] px-5 py-3 text-sm font-semibold text-white">Ver calendario ↗</a>
        </div>
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-amber-700/15 bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-serif text-xl font-bold">Elige un día</h2>
            <div className="grid grid-cols-4 gap-2 lg:grid-cols-3">
              {days.map(item => (
                <button key={item.day} onClick={() => choose(item.day)}
                  className={`rounded-xl border p-2 text-center transition ${selected === item.day ? "border-[#8b1e2d] bg-[#8b1e2d] text-white" : "border-amber-700/15 bg-[#f9f5ed] hover:border-[#8b1e2d]"}`}>
                  <span className="block text-xl">{item.emoji}</span><span className="text-sm font-bold">{item.day}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 border-t border-amber-700/15 pt-4">
              <h3 className="mb-2 font-serif text-lg font-bold">Progreso</h3>
              {storage !== "supabase" ? (
                <p className="text-xs text-gray-500">Conecta Supabase para ver aquí qué puertas ha abierto y qué vales ha canjeado.</p>
              ) : progress.filter(p => p.opened_at).length === 0 ? (
                <p className="text-xs text-gray-500">Todavía no ha abierto ninguna puerta.</p>
              ) : (
                <>
                  <p className="mb-2 text-sm font-semibold">
                    {progress.filter(p => p.opened_at).length}/24 puertas · {progress.filter(p => p.redeemed_at).length} vales canjeados
                  </p>
                  <ul className="space-y-1 text-xs text-gray-700">
                    {progress.filter(p => p.opened_at).map(p => (
                      <li key={p.day}>
                        <strong>Día {p.day}</strong> abierta {when(p.opened_at)}
                        {p.redeemed_at && <span className="font-semibold text-[#8b1e2d]"> · vale canjeado {when(p.redeemed_at)}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </aside>
          <section className="rounded-2xl border border-amber-700/15 bg-white p-5 shadow-sm sm:p-7">
            {!draft ? <p>{message || "Cargando los 24 días..."}</p> : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-serif text-2xl font-bold">Sorpresa del día {selected}</h2>
                  <span className="rounded-full bg-[#f6f0e3] px-3 py-1 text-sm">{draft.emoji} {types.find(x => x.value === draft.type)?.label}</span>
                </div>
                <div><label className={label}>Tipo de sorpresa</label>
                  <select className={input} value={draft.type} onChange={e => { const kind = e.target.value as SurpriseType; setDraft(prev => prev && ({ ...prev, type: kind, emoji: types.find(x=>x.value===kind)?.emoji || "🎁" })); }}>
                    {types.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                  </select></div>
                <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
                  <div><label className={label}>Título</label><input className={input} value={draft.title} onChange={e => update("title",e.target.value)}/></div>
                  <div><label className={label}>Emoji</label><input className={input} value={draft.emoji} onChange={e => update("emoji",e.target.value)}/></div>
                </div>
                <div><label className={label}>Mensaje</label><textarea rows={5} className={input} value={draft.message} onChange={e => update("message",e.target.value)}/></div>
                {draft.type === "photo" && <div className="space-y-3">
                  <label className={label}>Fotografía (JPG, PNG o WEBP · máximo 5 MB)</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>upload(e.target.files?.[0])} className="block w-full text-sm"/>
                  <input className={input} placeholder="/memories/mi-foto.jpg" value={draft.image || ""} onChange={e=>update("image",e.target.value)}/>
                  {draft.image && <img src={`/api/private-photo/${draft.day}?preview=true`} alt="Vista previa" className="max-h-64 rounded-lg object-contain"/>}
                  <p className="text-xs text-amber-800">Importante: las imágenes en public/memories son accesibles a quien conozca su dirección.</p>
                </div>}
                {draft.type === "quiz" && <div className="space-y-3">
                  <div><label className={label}>Pregunta</label><input className={input} value={draft.question || ""} onChange={e=>update("question",e.target.value)}/></div>
                  {(draft.options || ["", "", ""]).map((option,i)=> <div key={i}><label className={label}>Respuesta {i+1}</label><input className={input} value={option} onChange={e=> { const opts=[...(draft.options||["","",""])];opts[i]=e.target.value;update("options",opts); }}/></div>)}
                  <button type="button" className="text-sm font-semibold text-[#8b1e2d]" onClick={()=>update("options",[...(draft.options||[]),""])}>+ Añadir opción</button>
                  <div><label className={label}>Respuesta correcta</label><select className={input} value={draft.correctAnswer ?? 0} onChange={e=>update("correctAnswer",Number(e.target.value))}>{(draft.options||[]).map((_,i)=><option key={i} value={i}>Respuesta {i+1}</option>)}</select></div>
                  <div><label className={label}>Premio al acertar</label><input className={input} value={draft.reward || ""} onChange={e=>update("reward",e.target.value)}/></div>
                </div>}
                {draft.type === "voucher" && <div><label className={label}>Regalo que incluye el vale</label><input className={input} value={draft.reward || ""} onChange={e=>update("reward",e.target.value)}/></div>}
                {draft.type === "special" && <div><label className={label}>Enlace a vuestra canción (opcional)</label><input className={input} placeholder="https://..." value={draft.songUrl || ""} onChange={e=>update("songUrl",e.target.value)}/></div>}
                {message && <p role="status" className="rounded-lg bg-[#f6f0e3] px-3 py-2 text-sm">{message}</p>}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-700/15 pt-5">
                  <p className="text-xs text-gray-500">{storage === "supabase" ? "Los cambios se guardan en Supabase y se ven en la web publicada al momento" : "Los cambios se guardan en src/data/surprises.json"}</p>
                  <button onClick={save} disabled={busy} className="rounded-full bg-[#8b1e2d] px-7 py-3 font-semibold text-white hover:bg-[#a12b39] disabled:opacity-50">{busy ? "Guardando..." : "💾 Guardar sorpresa"}</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
