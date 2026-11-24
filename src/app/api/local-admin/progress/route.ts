import { NextRequest, NextResponse } from "next/server";
import { listProgress } from "@/lib/progress-server";

// Igual que el editor: solo en localhost durante el desarrollo.
export async function GET(request: NextRequest) {
  const host = request.headers.get("host") || "";

  if (
    process.env.NODE_ENV !== "development" ||
    !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
  ) {
    return NextResponse.json({ error: "Solo disponible en localhost" }, { status: 403 });
  }

  try {
    return NextResponse.json(await listProgress(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
