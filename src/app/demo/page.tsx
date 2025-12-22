import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void text-white">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-4">Founding Member Program</h1>
        <p className="text-slate-400 mb-8">This page has moved. Apply for the Founding Member Program to get early access.</p>
        <Link href="/apply" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 inline-block transition">
          Apply for Membership →
        </Link>
      </div>
    </div>
  );
}
