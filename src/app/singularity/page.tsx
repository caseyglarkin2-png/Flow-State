"use client";

import { useEffect, useRef, useState } from "react";

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
        const parent = canvasRef.current.parentElement;
        if (parent) {
          setDimensions({ width: parent.clientWidth, height: parent.clientHeight });
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
        }
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

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / 100;
    const scaleY = canvas.height / 100;

    // Draw red connection lines
    ctx.strokeStyle = "rgba(220, 38, 38, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < CITIES.length; i++) {
      for (let j = i + 1; j < CITIES.length; j++) {
        const c1 = CITIES[i];
        const c2 = CITIES[j];
        const x1 = c1.x * scaleX * 0.8 + canvas.width * 0.1;
        const y1 = c1.y * scaleY * 0.8 + canvas.height * 0.1;
        const x2 = c2.x * scaleX * 0.8 + canvas.width * 0.1;
        const y2 = c2.y * scaleY * 0.8 + canvas.height * 0.1;

        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // Draw red facility dots
    CITIES.forEach((city) => {
      const x = city.x * scaleX * 0.8 + canvas.width * 0.1;
      const y = city.y * scaleY * 0.8 + canvas.height * 0.1;

      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(city.name, x, y + 18);
    });
  }, [dimensions]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 py-10 text-center z-10">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          The <span className="text-cyan-400 glow">Logistics Singularity</span>
        </h1>
        <p className="text-xl text-slate-300 mb-2">
          Witness the transformation as every facility in your network enters Flow State.
        </p>
        <p className="text-lg text-cyan-400 font-medium mb-8">
          This is the point of no return
        </p>
      </div>

      <div className="relative w-full max-w-6xl aspect-video overflow-hidden mb-10">
        <div className="absolute top-4 left-4 z-20 bg-red-900/90 text-red-200 px-3 py-1 text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500"></span>
          CHAOS STATE
        </div>
        <canvas ref={canvasRef} className="w-full h-full" style={{ background: "#000" }} />
      </div>

      <div className="max-w-4xl px-4 pb-20 text-slate-300 space-y-6 text-center">
        <h2 className="text-2xl font-semibold text-white">Beyond Optimization</h2>
        <p>
          When every node in your supply chain operates at peak efficiency, something extraordinary happens. The network itself becomes a living system. Latency disappears. Throughput flows without friction. This is the Logistics Singularity.
        </p>
        <p>
          Most systems try to manage chaos. Flow State erases it. By uniting vision, telemetry, and physics driven optimization, we do more than improve your yard. We transform your entire logistics network into a seamless, high velocity flow.
        </p>
      </div>
    </div>
  );
}
