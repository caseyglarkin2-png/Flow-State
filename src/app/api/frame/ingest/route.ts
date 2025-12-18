import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

export const runtime = "nodejs";

const MetaSchema = z.object({
  cameraId: z.string().min(1),
  profile: z.enum(["global_shutter_outdoor", "unknown"]).default("unknown"),
  ts: z.number().optional(),
  notes: z.string().optional()
});

export async function POST(req: Request) {
  // Expect multipart/form-data with: image (file) + meta (json string)
  const form = await req.formData();
  const img = form.get("image");
  const metaRaw = form.get("meta");

  if (!(img instanceof File)) {
    return NextResponse.json({ error: "Missing image file field: image" }, { status: 400 });
  }

  let metaParsed: z.infer<typeof MetaSchema> = { cameraId: "unknown", profile: "unknown" };
  try {
    metaParsed = MetaSchema.parse(JSON.parse(String(metaRaw ?? "{}")));
  } catch {
    return NextResponse.json({ error: "Invalid meta JSON" }, { status: 400 });
  }

  const buf = Buffer.from(await img.arrayBuffer());
  const sha = crypto.createHash("sha256").update(buf).digest("hex");

  // NOTE: This endpoint is designed to accept frames from global-shutter capable cameras.
  // Global shutter reduces rolling distortion; pipeline avoids aggressive re-encoding that can introduce artifacts.
  // Production: store frames in object storage + run plate/asset detection async.

  return NextResponse.json({
    ok: true,
    cameraId: metaParsed.cameraId,
    profile: metaParsed.profile,
    bytes: buf.length,
    sha256: sha,
    receivedAt: Date.now()
  });
}
