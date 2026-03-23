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
    <div className="app-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2" style={{ color: "var(--accent)" }}>
            <RotateCcw className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Resume where you left off</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold">{lastVisited.label}</h2>
          <p className="mt-2 text-sm leading-7 app-copy">
            Jump back into the exact page you were using instead of hunting through courses, units, and chapters again.
          </p>
        </div>

        <Link href={lastVisited.href} className="app-primary-button inline-flex items-center justify-center gap-2 px-5 py-3 text-sm">
          Resume now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
