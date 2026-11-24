
import { NextRequest, NextResponse } from "next/server";
import {
  getAllSurprises,
  saveSurprise,
  storageMode,
} from "@/lib/advent-server";

import type {
  Surprise,
  SurpriseType,
} from "@/data/surprises";

const VALID_TYPES: SurpriseType[] = [
  "letter",
  "photo",
  "quiz",
  "voucher",
  "special",
];

// Solo permitir acceso local durante desarrollo
function allowed(
  request: NextRequest,
  modifying = false
): boolean {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  const host = request.headers.get("host") || "";

  const localHost =
    /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);

  if (!localHost) {
    return false;
  }

  if (modifying) {
    const origin = request.headers.get("origin");

    if (!origin) {
      return false;
    }

    try {
      const originUrl = new URL(origin);

      if (
        originUrl.host !== host ||
        originUrl.protocol !== "http:"
      ) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

// Leer las 24 sorpresas (de Supabase si está conectado, y si no del JSON)
async function readSurprises(): Promise<Surprise[]> {
  return getAllSurprises();
}

// Obtener sorpresas
export async function GET(request: NextRequest) {
  if (!allowed(request)) {
    return NextResponse.json(
      {
        error:
          "Solo disponible en localhost durante desarrollo",
      },
      { status: 403 }
    );
  }

  try {
    const surprises = await readSurprises();

    return NextResponse.json(surprises, {
      headers: {
        "Cache-Control": "no-store",
        "X-Storage": storageMode(),
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "No se pudo leer el archivo de sorpresas",
      },
      { status: 500 }
    );
  }
}

// Actualizar una sorpresa
export async function PUT(request: NextRequest) {
  if (!allowed(request, true)) {
    return NextResponse.json(
      { error: "Acceso denegado" },
      { status: 403 }
    );
  }

  try {
    const data: unknown = await request.json();

    if (
      typeof data !== "object" ||
      data === null ||
      Array.isArray(data)
    ) {
      throw new Error("Formato inválido");
    }

    const input = data as Record<string, unknown>;

    // Validar día
    if (
      !Number.isInteger(input.day) ||
      Number(input.day) < 1 ||
      Number(input.day) > 24
    ) {
      throw new Error("Día inválido");
    }

    // Validar tipo
    if (!VALID_TYPES.includes(input.type as SurpriseType)) {
      throw new Error("Tipo inválido");
    }

    // Validar campos obligatorios
    for (const key of [
      "title",
      "message",
      "emoji",
    ] as const) {
      const value = input[key];

      if (
        typeof value !== "string" ||
        value.length > 12000
      ) {
        throw new Error(`Campo ${key} inválido`);
      }
    }

    // Validar campos opcionales
    for (const key of [
      "image",
      "question",
      "reward",
      "songUrl",
    ] as const) {
      const value = input[key];

      if (
        value !== undefined &&
        (typeof value !== "string" ||
          value.length > 12000)
      ) {
        throw new Error(`${key} inválido`);
      }
    }

    // Validar opciones del cuestionario
    if (input.options !== undefined) {
      if (
        !Array.isArray(input.options) ||
        input.options.length > 8 ||
        !input.options.every(
          (option: unknown) =>
            typeof option === "string" &&
            option.length <= 400
        )
      ) {
        throw new Error("Opciones inválidas");
      }
    }

    // Validar respuesta correcta
    if (input.correctAnswer !== undefined) {
      if (
        !Number.isInteger(input.correctAnswer) ||
        Number(input.correctAnswer) < 0 ||
        Number(input.correctAnswer) > 7
      ) {
        throw new Error("Respuesta inválida");
      }

      if (
        Array.isArray(input.options) &&
        Number(input.correctAnswer) >= input.options.length
      ) {
        throw new Error(
          "La respuesta correcta no existe entre las opciones"
        );
      }
    }

    // Validar ruta de imagen
    if (
      typeof input.image === "string" &&
      input.image &&
      !/^\/memories\/[a-zA-Z0-9._-]+$/.test(input.image)
    ) {
      throw new Error(
        "La imagen debe estar en /memories/"
      );
    }

    // Validar URL de canción
    if (
      typeof input.songUrl === "string" &&
      input.songUrl &&
      !/^https:\/\//.test(input.songUrl)
    ) {
      throw new Error(
        "La URL debe empezar por https://"
      );
    }

    // Leer contenido actual
    const current = await readSurprises();

    const index = current.findIndex(
      (surprise) => surprise.day === input.day
    );

    if (index < 0) {
      throw new Error("No existe ese día");
    }

    // Preparar sorpresa actualizada
    const next: Surprise = {
      day: Number(input.day),
      type: input.type as SurpriseType,
      title: String(input.title),
      message: String(input.message),
      emoji: String(input.emoji),

      ...(input.image
        ? { image: input.image as string }
        : {}),

      ...(input.question
        ? { question: input.question as string }
        : {}),

      ...(input.options
        ? { options: input.options as string[] }
        : {}),

      ...(typeof input.correctAnswer === "number"
        ? { correctAnswer: input.correctAnswer }
        : {}),

      ...(input.reward
        ? { reward: input.reward as string }
        : {}),

      ...(input.songUrl
        ? { songUrl: input.songUrl as string }
        : {}),
    };

    // Actualizar únicamente el día seleccionado
    current[index] = next;

    // Guardar (Supabase si está conectado; si no, surprises.json)
    await saveSurprise(next, current);

    return NextResponse.json({
      ok: true,
      message: "Sorpresa guardada correctamente",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error guardando la sorpresa",
      },
      { status: 400 }
    );
  }
}
