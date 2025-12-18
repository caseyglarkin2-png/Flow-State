import { NextResponse } from "next/server";
import { z } from "zod";
import { TelemetryStore } from "@/lib/telemetry/store";
import { TelemetryResolver } from "@/lib/telemetry/TelemetryResolver";

export const runtime = "nodejs";

const Schema = z.object({
  assetId: z.string(),
  state: z.enum(["Approach", "Gate", "Yard", "Docking", "Docked"]),
  // map asset => keys
  visionKey: z.string().optional(), // assetId or cameraId
  uwbTagId: z.string().optional()
});

export async function POST(req: Request) {
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
