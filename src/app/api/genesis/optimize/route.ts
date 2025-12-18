import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { LayoutOptimizer } from "@/lib/genesis/LayoutOptimizer";
import { validateAuth } from "@/lib/auth";
import { rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Computational limits to prevent DoS
const MAX_POPULATION = 200;
const MAX_GENERATIONS = 500;
const MAX_YARD_SIZE = 1000;
const MAX_BLOCKS = 100;

const RectSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  type: z.enum(["dock", "staging", "office", "obstacle"])
});

const RequestSchema = z.object({
  yard: z.object({
    width: z.number().positive().max(MAX_YARD_SIZE),
    height: z.number().positive().max(MAX_YARD_SIZE)
  }),
  constraints: z.object({
    minClearance: z.number().min(0),
    dockCount: z.number().int().min(0).max(MAX_BLOCKS),
    stagingCount: z.number().int().min(0).max(MAX_BLOCKS),
    officeCount: z.number().int().min(0).max(10).optional(),
    obstacles: z.array(RectSchema).max(20).optional()
  }),
  physics: z.object({
    rho: z.number(),
    v: z.number(),
    mu: z.number()
  }),
  options: z.object({
    population: z.number().int().positive().max(MAX_POPULATION).optional(),
    generations: z.number().int().positive().max(MAX_GENERATIONS).optional(),
    elitePct: z.number().min(0).max(1).optional(),
    mutationRate: z.number().min(0).max(1).optional(),
    seed: z.number().optional()
  }).optional()
});

export async function POST(req: NextRequest) {
  // Auth check
  const authError = validateAuth(req);
  if (authError) return authError;

  // Rate limit: 10 optimizations per minute per IP (CPU-intensive)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitError = rateLimitResponse(`genesis:${ip}`, {
    windowMs: 60 * 1000,
    maxRequests: 10,
  });
  if (rateLimitError) return rateLimitError;

  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const optimizer = new LayoutOptimizer();
  const result = optimizer.optimize(parsed.data);

  return NextResponse.json(result);
}
