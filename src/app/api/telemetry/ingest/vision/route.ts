import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TelemetryStore } from "@/lib/telemetry/store";
import { validateAuth } from "@/lib/auth";
import { rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Schema = z.object({
  cameraId: z.string(),
  ts: z.number().optional(),
  detections: z.array(z.object({
    label: z.string(),
    confidence: z.number().min(0).max(1),
    bbox: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }),
    world: z.object({ x: z.number(), y: z.number() }).optional(),
    assetId: z.string().optional()
  })).max(100) // Limit detections per request
});

export async function POST(req: NextRequest) {
  // Auth check
  const authError = validateAuth(req);
  if (authError) return authError;

  // Rate limit: 100 requests per minute per camera
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitError = rateLimitResponse(`vision:${ip}`, {
    windowMs: 60 * 1000,
    maxRequests: 100,
  });
  if (rateLimitError) return rateLimitError;
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vision ingest", details: parsed.error.flatten() }, { status: 400 });
  }

  const ts = parsed.data.ts ?? Date.now();

  for (const d of parsed.data.detections) {
    const key = d.assetId ?? parsed.data.cameraId;
    TelemetryStore.putVision(key, {
      source: "vision",
      cameraId: parsed.data.cameraId,
      ts,
      label: d.label,
      confidence: d.confidence,
      bbox: d.bbox,
      world: d.world,
      assetId: d.assetId
    });
  }

  return NextResponse.json({ ok: true, received: parsed.data.detections.length });
}
