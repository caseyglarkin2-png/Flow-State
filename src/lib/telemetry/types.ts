export type Vec2 = { x: number; y: number };

export type VisionDetection = {
  source: "vision";
  cameraId: string;
  ts: number;
  // YOLO-like
  label: string;
  confidence: number; // 0..1
  bbox: { x: number; y: number; w: number; h: number };
  // optional if already projected into yard coordinates
  world?: Vec2;
  assetId?: string; // if tracked
};

export type UwbReading = {
  source: "uwb";
  ts: number;
  tagId: string;
  world: Vec2;
  accuracyCm: number; // e.g., 30 => <30cm
  zone?: string;
};

export type AssetState = "Approach" | "Gate" | "Yard" | "Docking" | "Docked";

export type ResolvedAsset = {
  assetId: string;
  ts: number;
  state: AssetState;
  world: Vec2;
  source: "vision" | "uwb" | "fused";
  confidence: number; // 0..1
  debug?: unknown;
};
