import { NextResponse } from "next/server";
import { z } from "zod";
import { TelemetryStore } from "@/lib/telemetry/store";

export const runtime = "nodejs";

const Schema = z.object({
  ts: z.number().optional(),
  tagId: z.string(),
  world: z.object({ x: z.number(), y: z.number() }),
  accuracyCm: z.number().min(1).max(1000),
  zone: z.string().optional()
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid UWB ingest", details: parsed.error.flatten() }, { status: 400 });
  }

  TelemetryStore.putUwb(parsed.data.tagId, {
    source: "uwb",
    ts: parsed.data.ts ?? Date.now(),
    tagId: parsed.data.tagId,
    world: parsed.data.world,
    accuracyCm: parsed.data.accuracyCm,
    zone: parsed.data.zone
  });

  return NextResponse.json({ ok: true });
}
