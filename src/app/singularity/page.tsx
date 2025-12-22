"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";

// Approximate relative coordinates for major US cities (0 to 100 scale)
const CITIES = [
  { name: "Seattle", x: 15, y: 15 },
  { name: "Portland", x: 14, y: 22 },
  { name: "San Francisco", x: 10, y: 45 },
  { name: "Los Angeles", x: 18, y: 60 },
  { name: "San Diego", x: 20, y: 65 },
  { name: "Las Vegas", x: 25, y: 55 },
  { name: "Salt Lake City", x: 30, y: 40 },
  { name: "Phoenix", x: 30, y: 62 },
  { name: "Denver", x: 40, y: 45 },
  { name: "Dallas", x: 55, y: 65 },
  { name: "Houston", x: 58, y: 75 },
  { name: "Austin", x: 54, y: 72 },
  { name: "Minneapolis", x: 55, y: 25 },
  { name: "Chicago", x: 65, y: 35 },
  { name: "Detroit", x: 72, y: 32 },
  { name: "St Louis", x: 62, y: 45 },
  { name: "New Orleans", x: 62, y: 80 },
  { name: "Atlanta", x: 75, y: 60 },
  { name: "Miami", x: 85, y: 85 },
  { name: "New York", x: 88, y: 30 },
  { name: "Boston", x: 92, y: 25 },
  { name: "Philadelphia", x: 86, y: 34 },
  { name: "Washington DC", x: 84, y: 38 },
  { name: "Charlotte", x: 80, y: 50 },
  { name: "Nashville", x: 70, y: 52 },
  { name: "Memphis", x: 65, y: 55 },
];

export default function SingularityPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { clientWidth, clientHeight } = canvasRef.current.parentElement!;
        setDimensions({ width: clientWidth, height: clientHeight });
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // NO GRID, NO RINGS - clean background only

      // Draw Cities
      const scaleX = canvas.width / 100;
      const scaleY = canvas.height / 100;

      // Draw Connections (Vectors) FIRST so dots render on top
      ctx.strokeStyle = "rgba(239, 68, 68, 0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < CITIES.length; i++) {
        for (let j = i + 1; j < CITIES.length; j++) {
          const c1 = CITIES[i];
          const c2 = CITIES[j];
          const x1 = c1.x * scaleX * 0.8 + canvas.width * 0.1;
          const y1 = c1.y * scaleY * 0.8 + canvas.height * 0.1;
          const x2 = c2.x * scaleX * 0.8 + canvas.width * 0.1;
          const y2 = c2.y * scaleY * 0.8 + canvas.height * 0.1;

          const dist = Math.hypot(x2 - x1, y2 - y1);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      // Draw Facilities (RED dots for Chaos State)
      CITIES.forEach((city) => {
        const x = city.x * scaleX * 0.8 + canvas.width * 0.1;
        const y = city.y * scaleY * 0.8 + canvas.height * 0.1;

        // Red facility dot
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow effect
        ctx.fillStyle = "rgba(220, 38, 38, 0.3)";
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Draw Label
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(city.name, x, y + 22);
      });
    };

    render();
    // animationFrameId = requestAnimationFrame(render); // If we want animation later

    return () => {
      // cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions]);

  return (
    <div className="min-h-screen bg-void text-white flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 py-10 text-center z-10">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          The <span className="text-cyan-400 glow">Logistics Singularity</span>
        </h1>
        <p className="text-xl text-slate-300 mb-2">
          Witness the transformation as every facility in your network enters Flow State.</p>
        <p className="text-lg text-cyan-400 font-medium mb-8">
          This is the point of no return</p>
      </div>

      <div className="relative w-full max-w-6xl aspect-video bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden mb-10">
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-orange-900/80 text-orange-200 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/50 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            CHAOS STATE
          </div>
        </div>
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="max-w-4xl px-4 pb-20 text-slate-300 space-y-6 text-center">
        <h2 className="text-2xl font-semibold text-white">Beyond Optimization</h2>
        <p>
          When every node in your supply chain operates at peak efficiency, something extraordinary happens. The network itself becomes a living system. Latency disappears. Throughput flows without friction. This is the Logistics Singularity.
        </p>
        <p>
          Most systems try to manage chaos. Flow State erases it. By uniting vision, telemetry, and physics-driven optimization, we do more than improve your yard. We transform your entire logistics network into a seamless, high-velocity flow.
        </p>
      </div>
    </div>
  );
}
