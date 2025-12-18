import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { validateAuth } from "@/lib/auth";
import { rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MetaSchema = z.object({
  cameraId: z.string().min(1),
  profile: z.enum(["global_shutter_outdoor", "unknown"]).default("unknown"),
  ts: z.number().optional(),
  notes: z.string().optional()
});

export async function POST(req: NextRequest) {
  // Auth check
  const authError = validateAuth(req);
  if (authError) return authError;

  // Rate limit: 20 uploads per minute per IP
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitError = rateLimitResponse(`frame-ingest:${ip}`, {
    windowMs: 60 * 1000,
    maxRequests: 20,
  });
  if (rateLimitError) return rateLimitError;

  // Expect multipart/form-data with: image (file) + meta (json string)
  const form = await req.formData();
  const img = form.get("image");
  const metaRaw = form.get("meta");

  if (!(img instanceof File)) {
    return NextResponse.json({ error: "Missing image file field: image" }, { status: 400 });
  }

  // Validate file size
  if (img.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large. Max size: 10MB" }, { status: 413 });
  }

  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(img.type)) {
    return NextResponse.json({ 
      error: "Invalid file type. Allowed: JPEG, PNG, WebP" 
    }, { status: 400 });
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
