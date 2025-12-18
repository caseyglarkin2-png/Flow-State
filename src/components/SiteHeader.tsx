import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-black/30">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Flow State
        </Link>
        <nav className="flex gap-4 text-sm text-slate-300">
          <Link href="/genesis" className="hover:text-white transition">
            Genesis
          </Link>
        </nav>
      </div>
    </header>
  );
}
