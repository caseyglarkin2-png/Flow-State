import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TelemetryStore } from "@/lib/telemetry/store";
import { TelemetryResolver } from "@/lib/telemetry/TelemetryResolver";
import { validateAuth } from "@/lib/auth";
import { rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Schema = z.object({
  assetId: z.string(),
  state: z.enum(["Approach", "Gate", "Yard", "Docking", "Docked"]),
  // map asset => keys
  visionKey: z.string().optional(), // assetId or cameraId
  uwbTagId: z.string().optional()
});

export async function POST(req: NextRequest) {
  // Auth check
  const authError = validateAuth(req);
  if (authError) return authError;

  // Rate limit: 100 requests per minute per IP
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitError = rateLimitResponse(`resolve:${ip}`, {
    windowMs: 60 * 1000,
    maxRequests: 100,
  });
  if (rateLimitError) return rateLimitError;
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid resolve request", details: parsed.error.flatten() }, { status: 400 });
  }

  const vision = parsed.data.visionKey ? TelemetryStore.getLatestVision(parsed.data.visionKey) : null;
  const uwb = parsed.data.uwbTagId ? TelemetryStore.getLatestUwb(parsed.data.uwbTagId) : null;

  const resolver = new TelemetryResolver();
  const resolved = resolver.resolve({
    assetId: parsed.data.assetId,
    state: parsed.data.state,
    vision,
    uwb
  });

  return NextResponse.json({ ok: true, resolved });
}
