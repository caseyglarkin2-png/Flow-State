import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TelemetryStore } from "@/lib/telemetry/store";
import { validateAuth } from "@/lib/auth";
import { rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Schema = z.object({
  ts: z.number().optional(),
  tagId: z.string(),
  world: z.object({ x: z.number(), y: z.number() }),
  accuracyCm: z.number().min(1).max(1000),
  zone: z.string().optional()
});

export async function POST(req: NextRequest) {
  // Auth check
  const authError = validateAuth(req);
  if (authError) return authError;

  // Rate limit: 200 requests per minute per IP (high frequency telemetry)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitError = rateLimitResponse(`uwb:${ip}`, {
    windowMs: 60 * 1000,
    maxRequests: 200,
  });
  if (rateLimitError) return rateLimitError;
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
