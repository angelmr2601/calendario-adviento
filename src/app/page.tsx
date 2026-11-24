import { Suspense } from "react";
import { connection } from "next/server";
import { headers } from "next/headers";
import CalendarClient from "@/components/CalendarClient";
import { getAllSurprises, localPreview, unlockedOnServer } from "@/lib/advent-server";
import { getProgress } from "@/lib/progress-server";
import type { Surprise } from "@/data/surprises";

type DayItem = { day: number; unlocked: boolean; surprise: Surprise | null };

type Props = { searchParams: Promise<{ preview?: string }> };

async function CalendarData({ searchParams }: Props) {
  await connection();
  const [params, requestHeaders, all, progress] = await Promise.all([
    searchParams, headers(), getAllSurprises(), getProgress(),
  ]);
  const preview = localPreview(requestHeaders.get("host") || "", params.preview);
  const days: DayItem[] = Array.from({ length: 24 }, (_, index) => {
    const day = index + 1;
    const unlocked = unlockedOnServer(day, preview);
    const record = all.find((s) => s.day === day);
    // Nunca enviar las sorpresas futuras al cliente.
    return { day, unlocked, surprise: unlocked && record ? record : null };
  });
  return <CalendarClient days={days} progress={progress} />;
}

export default function Home(props: Props) {
  return (
    <Suspense
      fallback={
        <main className="noche relative flex min-h-screen items-center justify-center p-12 text-center font-hand text-3xl text-glow">
          Encendiendo las luces…
        </main>
      }
    >
      <CalendarData {...props} />
    </Suspense>
  );
}
