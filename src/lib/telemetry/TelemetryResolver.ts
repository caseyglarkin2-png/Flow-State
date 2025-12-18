import type { AssetState, ResolvedAsset, UwbReading, VisionDetection, Vec2 } from "./types";

function dist(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export class TelemetryResolver {
  resolve(args: {
    assetId: string;
    state: AssetState;
    vision?: VisionDetection | null;
    uwb?: UwbReading | null;
  }): ResolvedAsset | null {
    const { assetId, state, vision, uwb } = args;
    const ts = Math.max(vision?.ts ?? 0, uwb?.ts ?? 0, Date.now());

    const vPos = vision?.world ?? null;
    const uPos = uwb?.world ?? null;

    if (!vPos && !uPos) return null;
    if (uPos && !vPos) {
      return {
        assetId, state, ts,
        world: uPos,
        source: "uwb",
        confidence: this.uwbConfidence(uwb!)
      };
    }
    if (vPos && !uPos) {
      return {
        assetId, state, ts,
        world: vPos,
        source: "vision",
        confidence: this.visionConfidence(vision!)
      };
    }

    // Both exist:
    const d = dist(vPos!, uPos!);

    // RULE: If Vision and UWB disagree by < 1 meter, prioritize UWB for Docking state.
    if (state === "Docking" && d < 1.0) {
      return {
        assetId, state, ts,
        world: uPos!,
        source: "uwb",
        confidence: this.uwbConfidence(uwb!),
        debug: { rule: "Docking<1m => UWB", dMeters: d }
      };
    }

    // Otherwise: choose the measurement with lower uncertainty.
    const uConf = this.uwbConfidence(uwb!);
    const vConf = this.visionConfidence(vision!);

    // If large disagreement, don't average; choose the more trustworthy source.
    if (d >= 1.0) {
      const pick = uConf >= vConf ? "uwb" : "vision";
      return {
        assetId, state, ts,
        world: pick === "uwb" ? uPos! : vPos!,
        source: pick,
        confidence: Math.max(uConf, vConf),
        debug: { rule: "large_disagreement_pick_best", dMeters: d, uConf, vConf }
      };
    }

    // Small disagreement (non-docking): fuse by confidence weighting.
    const wU = uConf / Math.max(1e-6, (uConf + vConf));
    const fused = { x: uPos!.x * wU + vPos!.x * (1 - wU), y: uPos!.y * wU + vPos!.y * (1 - wU) };

    return {
      assetId, state, ts,
      world: fused,
      source: "fused",
      confidence: Math.max(uConf, vConf),
      debug: { rule: "weighted_fusion", dMeters: d, wU, uConf, vConf }
    };
  }

  private uwbConfidence(u: UwbReading) {
    // 30cm => very high confidence
    const accM = u.accuracyCm / 100;
    return Math.max(0.05, Math.min(0.98, 1 / (1 + accM)));
  }

  private visionConfidence(v: VisionDetection) {
    // use model confidence, but cap (vision can occlude)
    return Math.max(0.05, Math.min(0.85, v.confidence));
  }
}
