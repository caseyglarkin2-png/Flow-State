export type Rect = { id: string; x: number; y: number; w: number; h: number; type: "dock" | "staging" | "office" | "obstacle" };
export type YardSpec = { width: number; height: number };

export type GenesisPhysics = {
  // Reynolds inputs: Re = rho * v * L / mu
  rho: number; // density proxy (ops load intensity)
  v: number;   // characteristic velocity proxy (avg vehicle speed)
  mu: number;  // viscosity proxy (process friction)
};

export type GenesisConstraints = {
  minClearance: number;
  dockCount: number;
  stagingCount: number;
  officeCount?: number;
  obstacles?: Rect[];
};

export type YardLayout = {
  yard: YardSpec;
  blocks: Rect[];
  meta: {
    travelMetersEstimate: number;
    congestionIndex: number;
    viscosityIndex: number; // lower is better
    reynolds: number;
    fitness: number;
  };
};

export type OptimizeRequest = {
  yard: YardSpec;
  constraints: GenesisConstraints;
  physics: GenesisPhysics;
  options?: {
    population?: number;
    generations?: number;
    elitePct?: number;
    mutationRate?: number;
    seed?: number;
  };
};
