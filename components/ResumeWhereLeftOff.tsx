"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { getLastVisited, syncStudyProgressFromAccount, type ResumeLocation } from "@/lib/study-progress";

export default function ResumeWhereLeftOff() {
  const [lastVisited, setLastVisited] = useState<ResumeLocation | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      await syncStudyProgressFromAccount();
      if (mounted) setLastVisited(getLastVisited());
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  if (!lastVisited) return null;

  return (
    <div className="rounded-[28px] border border-[#8b80ff]/25 bg-[linear-gradient(145deg,rgba(139,128,255,0.18),rgba(255,255,255,0.04))] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#d8d2ff]">
            <RotateCcw className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Resume where you left off</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold text-white">{lastVisited.label}</h2>
          <p className="mt-2 text-sm leading-7 text-[#d4d0eb]">
            Jump back into the exact page you were using instead of hunting through courses, units, and chapters again.
          </p>
        </div>

        <Link
          href={lastVisited.href}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#120f24] transition-transform hover:-translate-y-0.5"
        >
          Resume now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
