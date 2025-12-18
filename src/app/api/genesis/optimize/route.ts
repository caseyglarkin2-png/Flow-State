import { NextResponse } from "next/server";
import { z } from "zod";
import { LayoutOptimizer } from "@/lib/genesis/LayoutOptimizer";

export const runtime = "nodejs";

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
    width: z.number().positive(),
    height: z.number().positive()
  }),
  constraints: z.object({
    minClearance: z.number().min(0),
    dockCount: z.number().int().min(0),
    stagingCount: z.number().int().min(0),
    officeCount: z.number().int().min(0).optional(),
    obstacles: z.array(RectSchema).optional()
  }),
  physics: z.object({
    rho: z.number(),
    v: z.number(),
    mu: z.number()
  }),
  options: z.object({
    population: z.number().int().positive().optional(),
    generations: z.number().int().positive().optional(),
    elitePct: z.number().min(0).max(1).optional(),
    mutationRate: z.number().min(0).max(1).optional(),
    seed: z.number().optional()
  }).optional()
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const optimizer = new LayoutOptimizer();
  const result = optimizer.optimize(parsed.data);

  return NextResponse.json(result);
}
