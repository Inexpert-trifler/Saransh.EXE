import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-mono bg-[#080808] text-white">
      <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 sm:p-12 max-w-lg shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
        </div>

        <span className="text-xs font-semibold text-[#B9FF66] tracking-widest uppercase">
          {"// ERROR 404 · ROUTE_UNDEFINED"}
        </span>

        <h1 className="mt-2 text-3xl font-black text-white uppercase tracking-tight">
          SECTOR NOT FOUND
        </h1>

        <p className="mt-4 text-sm text-[#A1A1AA] font-sans leading-relaxed">
          The requested coordinate does not exist in the SARANSH.EXE directory. The packet may have been dropped or relocated.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-[#B9FF66] px-5 py-3 text-xs font-mono font-bold text-[#080808] hover:bg-[#a3e635] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>RETURN TO BASE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
