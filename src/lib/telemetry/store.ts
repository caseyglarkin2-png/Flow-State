import type { UwbReading, VisionDetection } from "./types";

// Simple in-memory store for demo. In production, use Redis or similar.
class TelemetryStoreImpl {
  private vision = new Map<string, VisionDetection>();
  private uwb = new Map<string, UwbReading>();

  putVision(key: string, data: VisionDetection) {
    this.vision.set(key, data);
  }

  putUwb(key: string, data: UwbReading) {
    this.uwb.set(key, data);
  }

  getLatestVision(key: string): VisionDetection | null {
    return this.vision.get(key) ?? null;
  }

  getLatestUwb(key: string): UwbReading | null {
    return this.uwb.get(key) ?? null;
  }
}

export const TelemetryStore = new TelemetryStoreImpl();
