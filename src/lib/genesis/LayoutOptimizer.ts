import { GenesisConstraints, GenesisPhysics, OptimizeRequest, Rect, YardLayout, YardSpec } from "./types";

type RNG = () => number;

function mulberry32(seed: number): RNG {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

function rectsOverlap(a: Rect, b: Rect, clearance = 0) {
  return !(
    a.x + a.w + clearance <= b.x ||
    b.x + b.w + clearance <= a.x ||
    a.y + a.h + clearance <= b.y ||
    b.y + b.h + clearance <= a.y
  );
}

function randBetween(rng: RNG, a: number, b: number) {
  return a + (b - a) * rng();
}

function layoutDistanceEstimate(blocks: Rect[]) {
  // crude heuristic: average pairwise distances between docks and staging (proxy for drive paths)
  const docks = blocks.filter(b => b.type === "dock");
  const staging = blocks.filter(b => b.type === "staging");
  if (!docks.length || !staging.length) return 99999;

  let sum = 0;
  let count = 0;
  for (const d of docks) {
    const dx = d.x + d.w / 2;
    const dy = d.y + d.h / 2;
    let best = Infinity;
    for (const s of staging) {
      const sx = s.x + s.w / 2;
      const sy = s.y + s.h / 2;
      const dist = Math.hypot(dx - sx, dy - sy);
      if (dist < best) best = dist;
    }
    sum += best;
    count++;
  }
  return sum / Math.max(1, count);
}

function congestionIndex(blocks: Rect[], yard: YardSpec) {
  // proxy: more blocks + less free area => more congestion
  const area = yard.width * yard.height;
  const occupied = blocks.reduce((acc, b) => acc + b.w * b.h, 0);
  const fill = occupied / Math.max(1, area);
  const complexity = blocks.length / 50; // normalize
  return clamp(fill * 1.4 + complexity * 0.6, 0, 1);
}

function viscosityIndex(mu: number, congestion: number, complexity: number) {
  // "operational viscosity" grows with congestion + complexity
  return mu * (1 + 1.8 * congestion + 0.4 * complexity);
}

function reynoldsScore(physics: GenesisPhysics, L: number, congestion: number, complexity: number) {
  // Use effective v and effective mu to compute Reynolds.
  // NOTE: in fluid mechanics, high Re => turbulent; here we use Re as "flow power vs friction"
  // by interpreting viscosityIndex as the friction term to be minimized.
  const vEff = physics.v * (1 - 0.55 * congestion); // slower under congestion
  const muEff = viscosityIndex(physics.mu, congestion, complexity);
  const rho = Math.max(1e-6, physics.rho);
  const Re = (rho * Math.max(1e-6, vEff) * Math.max(1e-6, L)) / Math.max(1e-6, muEff);
  return { Re, muEff };
}

function baseBlock(type: Rect["type"], i: number): Rect {
  if (type === "dock") return { id: `dock-${i}`, type, x: 0, y: 0, w: 14, h: 6 };
  if (type === "staging") return { id: `staging-${i}`, type, x: 0, y: 0, w: 10, h: 10 };
  if (type === "office") return { id: `office-${i}`, type, x: 0, y: 0, w: 12, h: 10 };
  return { id: `obstacle-${i}`, type, x: 0, y: 0, w: 10, h: 10 };
}

function randomPlace(rng: RNG, yard: YardSpec, r: Rect): Rect {
  return {
    ...r,
    x: randBetween(rng, 0, Math.max(0, yard.width - r.w)),
    y: randBetween(rng, 0, Math.max(0, yard.height - r.h))
  };
}

function enforceBounds(yard: YardSpec, r: Rect): Rect {
  return {
    ...r,
    x: clamp(r.x, 0, Math.max(0, yard.width - r.w)),
    y: clamp(r.y, 0, Math.max(0, yard.height - r.h))
  };
}

function scoreLayout(yard: YardSpec, physics: GenesisPhysics, constraints: GenesisConstraints, blocks: Rect[]) {
  // penalties
  let penalty = 0;

  const all = [...(constraints.obstacles ?? []), ...blocks];

  // overlaps
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      if (rectsOverlap(all[i], all[j], constraints.minClearance)) penalty += 2500;
    }
  }

  // keep key types inside yard (enforced but double-safe)
  for (const b of blocks) {
    if (b.x < 0 || b.y < 0 || b.x + b.w > yard.width || b.y + b.h > yard.height) penalty += 500;
  }

  const travel = layoutDistanceEstimate(all);
  const cong = congestionIndex(all, yard);
  const complexity = all.length / 50;

  const { Re, muEff } = reynoldsScore(physics, travel, cong, complexity);

  // Fitness: lower travel + lower penalties + higher Re
  // Use log(Re) so it doesn't explode.
  const fitness = -travel - penalty + 250 * Math.log(Math.max(1e-6, Re));

  return {
    travelMetersEstimate: travel,
    congestionIndex: cong,
    viscosityIndex: muEff,
    reynolds: Re,
    fitness
  };
}

function crossover(rng: RNG, a: Rect[], b: Rect[]) {
  // uniform crossover by id
  const mapB = new Map(b.map(x => [x.id, x]));
  return a.map(x => (rng() < 0.5 && mapB.has(x.id) ? { ...mapB.get(x.id)! } : { ...x }));
}

function mutate(rng: RNG, yard: YardSpec, blocks: Rect[], rate: number) {
  return blocks.map(b => {
    if (rng() > rate) return b;
    const dx = randBetween(rng, -12, 12);
    const dy = randBetween(rng, -12, 12);
    const scale = rng() < 0.15; // occasional size tweak
    const nw = scale ? clamp(b.w + randBetween(rng, -3, 3), 4, 22) : b.w;
    const nh = scale ? clamp(b.h + randBetween(rng, -3, 3), 4, 22) : b.h;
    return enforceBounds(yard, { ...b, x: b.x + dx, y: b.y + dy, w: nw, h: nh });
  });
}

export class LayoutOptimizer {
  optimize(req: OptimizeRequest): { best: YardLayout; candidates: YardLayout[] } {
    const yard = req.yard;
    const constraints = req.constraints;
    const physics = req.physics;

    const popSize = req.options?.population ?? 60;
    const generations = req.options?.generations ?? 120;
    const elitePct = req.options?.elitePct ?? 0.18;
    const mutationRate = req.options?.mutationRate ?? 0.22;
    const seed = req.options?.seed ?? Date.now();

    const rng = mulberry32(seed);

    const blocksTemplate: Rect[] = [
      ...Array.from({ length: constraints.dockCount }, (_, i) => baseBlock("dock", i)),
      ...Array.from({ length: constraints.stagingCount }, (_, i) => baseBlock("staging", i)),
      ...Array.from({ length: constraints.officeCount ?? 1 }, (_, i) => baseBlock("office", i))
    ];

    const initIndividual = () => blocksTemplate.map(b => randomPlace(rng, yard, b));

    let population = Array.from({ length: popSize }, () => initIndividual());

    const evalIndividual = (blocks: Rect[]): YardLayout => {
      const meta = scoreLayout(yard, physics, constraints, blocks);
      return { yard, blocks, meta };
    };

    const selectTournament = (layouts: YardLayout[], k = 4) => {
      let best = layouts[Math.floor(rng() * layouts.length)];
      for (let i = 1; i < k; i++) {
        const challenger = layouts[Math.floor(rng() * layouts.length)];
        if (challenger.meta.fitness > best.meta.fitness) best = challenger;
      }
      return best;
    };

    let scored = population.map(evalIndividual);

    for (let g = 0; g < generations; g++) {
      scored.sort((x, y) => y.meta.fitness - x.meta.fitness);

      const eliteCount = Math.max(2, Math.floor(popSize * elitePct));
      const next: Rect[][] = scored.slice(0, eliteCount).map(x => x.blocks.map(b => ({ ...b })));

      while (next.length < popSize) {
        const p1 = selectTournament(scored);
        const p2 = selectTournament(scored);
        const child = crossover(rng, p1.blocks, p2.blocks);
        const mutated = mutate(rng, yard, child, mutationRate);
        next.push(mutated);
      }

      population = next;
      scored = population.map(evalIndividual);
    }

    scored.sort((x, y) => y.meta.fitness - x.meta.fitness);
    return { best: scored[0], candidates: scored.slice(0, 8) };
  }
}
