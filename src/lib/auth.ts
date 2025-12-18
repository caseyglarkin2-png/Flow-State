import { NextRequest, NextResponse } from "next/server";
import { env, isAuthEnabled } from "./env";

export function validateAuth(req: NextRequest): NextResponse | null {
  // Skip auth in development unless explicitly enabled
  if (!isAuthEnabled()) {
    return null;
  }

  const authHeader = req.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!apiKey || apiKey !== env.API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Valid API key required" },
      { status: 401 }
    );
  }

  return null;
}
