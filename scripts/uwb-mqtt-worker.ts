/**
 * UWB-MQTT Worker
 * 
 * This script connects to an MQTT broker and listens for UWB positioning data,
 * then forwards it to the telemetry API for processing.
 * 
 * Usage: npm run telemetry:worker
 * 
 * Environment variables:
 *   MQTT_URL - MQTT broker URL (default: mqtt://localhost:1883)
 *   MQTT_TOPIC - Topic to subscribe to (default: uwb/positions)
 *   API_URL - Telemetry API URL (default: http://localhost:3000/api/telemetry/ingest/uwb)
 */

import mqtt from "mqtt";
import { z } from "zod";
import { env } from "../src/lib/env";

const MQTT_URL = env.MQTT_URL;
const MQTT_TOPIC = env.MQTT_TOPIC;
const API_URL = env.INTERNAL_API_URL || "http://localhost:3000/api/telemetry/ingest/uwb";
const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB

const UwbMessageSchema = z.object({
  tagId: z.string(),
  x: z.number(),
  y: z.number(),
  accuracyCm: z.number().optional().default(30),
  zone: z.string().optional(),
  ts: z.number().optional()
});

async function forwardToApi(data: z.infer<typeof UwbMessageSchema>) {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    
    // Add auth header if API key is configured
    if (env.API_KEY) {
      headers["Authorization"] = `Bearer ${env.API_KEY}`;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tagId: data.tagId,
        world: { x: data.x, y: data.y },
        accuracyCm: data.accuracyCm,
        zone: data.zone,
        ts: data.ts
      })
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
    }
  } catch (err) {
    console.error("Failed to forward to API:", err);
  }
}

function main() {
  console.log(`Connecting to MQTT broker: ${MQTT_URL}`);
  console.log(`Subscribing to topic: ${MQTT_TOPIC}`);
  console.log(`Forwarding to API: ${API_URL}`);

  const mqttOptions: mqtt.IClientOptions = {
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  };

  // Add credentials if configured
  if (env.MQTT_USERNAME) {
    mqttOptions.username = env.MQTT_USERNAME;
  }
  if (env.MQTT_PASSWORD) {
    mqttOptions.password = env.MQTT_PASSWORD;
  }

  const client = mqtt.connect(MQTT_URL, mqttOptions);

  client.on("connect", () => {
    console.log("Connected to MQTT broker");
    client.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error("Subscribe error:", err);
      } else {
        console.log(`Subscribed to ${MQTT_TOPIC}`);
      }
    });
  });

  client.on("message", async (_topic, message) => {
    try {
      // Check message size
      if (message.length > MAX_MESSAGE_SIZE) {
        console.warn(`Message too large (${message.length} bytes), skipping`);
        return;
      }

      const raw = JSON.parse(message.toString());
      const parsed = UwbMessageSchema.safeParse(raw);

      if (!parsed.success) {
        console.warn("Invalid UWB message:", parsed.error.flatten());
        return;
      }

      console.log(`UWB reading: tag=${parsed.data.tagId} x=${parsed.data.x} y=${parsed.data.y}`);
      await forwardToApi(parsed.data);
    } catch (err) {
      console.error("Message parse error:", err);
    }
  });

  client.on("error", (err) => {
    console.error("MQTT error:", err);
  });

  client.on("close", () => {
    console.log("MQTT connection closed");
  });

  // Handle shutdown
  process.on("SIGINT", () => {
    console.log("Shutting down...");
    client.end();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("Shutting down...");
    client.end();
    process.exit(0);
  });
}

main();
