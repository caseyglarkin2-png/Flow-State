import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: Date.now(),
    version: "0.1.0",
    services: {
      api: "operational",
      genesis: "operational",
      telemetry: "operational",
    },
    environment: process.env.NODE_ENV || "development",
  });
}
