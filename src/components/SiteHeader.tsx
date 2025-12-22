import Link from "next/link";
import { Button } from "./Button";

export function SiteHeader() {
  return (
    <>
      {/* Top Bar */}
      <div className="bg-cyan-950/30 border-b border-cyan-500/20 text-center py-2 text-xs font-medium text-cyan-200">
        <span className="mr-2">✦ Founding Member Program Open</span>
        <Link href="/apply" className="text-white font-semibold hover:text-cyan-300 transition">
          Only 23 spots left →
        </Link>
      </div>
      
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
               <div className="w-8 h-8 rounded-full border-2 border-cyan-500 flex items-center justify-center group-hover:bg-cyan-500/10 transition">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
               </div>
               <span className="text-xl font-bold tracking-tight text-white">FLOW STATE</span>
            </Link>
            
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
              <Link href="/product" className="hover:text-white transition">Product</Link>
              <Link href="/solutions" className="hover:text-white transition">Solutions</Link>
              <Link href="/genesis" className="hover:text-white transition">YardBuilder</Link>
              <Link href="/singularity" className="text-cyan-400 hover:text-cyan-300 transition">Singularity</Link>
              <Link href="/roi" className="hover:text-white transition">ROI Calculator</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
              Login
            </Link>
            <Link href="/apply">
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold border-none">
                    Apply for Membership
                </Button>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
