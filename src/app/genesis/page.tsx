"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

type Best = {
  meta: {
    reynolds: number;
    viscosityIndex: number;
    travelMetersEstimate: number;
    congestionIndex: number;
  };
  blocks: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
};

export default function GenesisPage() {
  const [loading, setLoading] = useState(false);
  const [best, setBest] = useState<Best | null>(null);

  const payload = useMemo(() => ({
    yard: { width: 220, height: 140 },
    constraints: {
      minClearance: 2,
      dockCount: 18,
      stagingCount: 10,
      officeCount: 1,
      obstacles: [
        { id: "pond-1", type: "obstacle", x: 30, y: 40, w: 22, h: 18 },
        { id: "building-legacy", type: "obstacle", x: 150, y: 15, w: 40, h: 30 }
      ]
    },
    physics: { rho: 1.2, v: 9.5, mu: 1.0 },
    options: { population: 70, generations: 140, seed: 1337 }
  }), []);

  async function run() {
    setLoading(true);
    setBest(null);
    try {
      const res = await fetch("/api/genesis/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setBest(data.best);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Project Genesis</h1>
        <p className="mt-2 text-slate-300">
          Genetic layout optimization that scores yard designs using Reynolds Number to minimize operational viscosity.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Run an optimization</h2>
          <p className="mt-2 text-sm text-slate-300">
            This is the &quot;brains&quot; behind drag-and-drop: explore thousands of layout variants under constraints, pick the best.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={run} disabled={loading}>
              {loading ? "Optimizing…" : "Optimize Layout"}
            </Button>
            <div className="text-xs text-slate-400 self-center">
              Default demo payload: 18 docks, 10 staging zones, 2 obstacles, clearance 2m.
            </div>
          </div>

          {best && (
            <div className="mt-6 grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-slate-400 text-xs">Reynolds (proxy)</div>
                  <div className="text-xl font-semibold">{best.meta.reynolds.toFixed(3)}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-slate-400 text-xs">Viscosity Index</div>
                  <div className="text-xl font-semibold">{best.meta.viscosityIndex.toFixed(3)}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-slate-400 text-xs">Travel (estimate)</div>
                  <div className="text-xl font-semibold">{best.meta.travelMetersEstimate.toFixed(1)} m</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-slate-400 text-xs">Congestion</div>
                  <div className="text-xl font-semibold">{(best.meta.congestionIndex * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-slate-400 text-xs mb-2">Blocks</div>
                <div className="max-h-56 overflow-auto text-xs text-slate-300">
                  {best.blocks.map((b) => (
                    <div key={b.id} className="flex justify-between gap-3 border-b border-white/5 py-1">
                      <span className="font-mono">{b.id}</span>
                      <span className="text-slate-400">{b.type}</span>
                      <span className="font-mono">{`x:${b.x.toFixed(1)} y:${b.y.toFixed(1)} w:${b.w.toFixed(1)} h:${b.h.toFixed(1)}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">How this becomes &quot;auto-mapping&quot;</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc pl-5">
            <li>YardBuilder generates a yard twin (address → geometry → zones).</li>
            <li>Genesis explores layout variants under constraints (clearances, obstacles, counts).</li>
            <li>Score combines distance, congestion, and Reynolds-derived viscosity to find flow-state designs.</li>
            <li>Output becomes a deployable &quot;yard configuration&quot; (zones, lanes, rules) used by orchestration + telemetry.</li>
          </ul>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="font-semibold">Opinionated truth:</div>
            <div className="mt-1">
              Drag-and-drop is a UI. Optimization is a system. Genesis is the part that makes this feel like magic instead of arts &amp; crafts.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
