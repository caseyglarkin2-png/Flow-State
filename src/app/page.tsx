import Link from "next/link";
import { Card } from "@/components/Card";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Flow State</h1>
        <p className="mt-2 text-slate-300">
          From turbulence to throughput. Yard management reimagined.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Project Genesis</h2>
          <p className="mt-2 text-sm text-slate-300">
            Genetic layout optimization that scores yard designs using Reynolds Number to minimize operational viscosity.
          </p>
          <Link 
            href="/genesis" 
            className="mt-4 inline-block rounded-xl bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20"
          >
            Explore Genesis →
          </Link>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Telemetry Pipeline</h2>
          <p className="mt-2 text-sm text-slate-300">
            Vision + UWB sensor fusion for real-time asset tracking. Resolves positions using confidence-weighted algorithms.
          </p>
          <div className="mt-4 text-xs text-slate-400">
            API endpoints ready for integration
          </div>
        </Card>
      </div>
    </div>
  );
}
