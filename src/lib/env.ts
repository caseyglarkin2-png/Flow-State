import { z } from "zod";

const envSchema = z.object({
  // API Security
  API_KEY: z.string().min(32).optional(),
  
  // MQTT Configuration
  MQTT_URL: z.string().default("mqtt://localhost:1883"),
  MQTT_TOPIC: z.string().default("uwb/positions"),
  MQTT_USERNAME: z.string().optional(),
  MQTT_PASSWORD: z.string().optional(),
  
  // Internal API
  INTERNAL_API_URL: z.string().url().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Validate on module load
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error("❌ Invalid environment variables:", error);
  throw new Error("Invalid environment variables");
}

export { env };

// Helper to check if auth is enabled
export function isAuthEnabled(): boolean {
  return env.NODE_ENV === "production" && !!env.API_KEY;
}
