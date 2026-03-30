"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Circle, Layers3 } from "lucide-react";
import { getLastVisited, getUnitProgress, hasViewedChapter, syncStudyProgressFromAccount } from "@/lib/study-progress";

type ChapterItem = {
  id: string;
  chapter_number: number;
  name: string;
  hasQuiz: boolean;
};

type UnitOrganizerClientProps = {
  courseId: string;
  courseHref: string;
  courseColor: string;
  unitId: string;
  unitName: string;
  unitNumber: number;
  chapters: ChapterItem[];
};

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--panel-muted)" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}

export default function UnitOrganizerClient({
  courseId,
  courseHref,
  courseColor,
  unitId,
  unitName,
  unitNumber,
  chapters,
}: UnitOrganizerClientProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      await syncStudyProgressFromAccount();
      if (mounted) setReady(true);
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const progress = ready ? getUnitProgress(courseId, unitId, chapters.length) : { percent: 0, viewedCount: 0 };
  const lastVisited = ready ? getLastVisited() : null;

  return (
    <div className="space-y-6">
      <div className="app-panel p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="app-kicker">Unit {unitNumber}</p>
            <h1 className="app-section-title mt-2">{unitName}</h1>
            <p className="app-copy mt-3 max-w-2xl">
              This is the full study lane for the unit: notes first, chapter checks after, then flashcards, key concepts, and the unit exam when you want the wrap-up.
            </p>
          </div>

          {lastVisited?.courseId === courseId && lastVisited?.unitId === unitId && (
            <Link href={lastVisited.href} className="app-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
              Resume this unit
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="app-card p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Unit progress</span>
              <span className="text-sm font-semibold">{progress.percent}%</span>
            </div>
            <div className="mt-3">
              <ProgressBar percent={progress.percent} color={courseColor} />
            </div>
            <p className="mt-3 text-sm app-copy">
              {progress.viewedCount} of {chapters.length} chapters opened, plus the review tools for this unit.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link href={`${courseHref}/unit/${unitId}/flashcards`} className="app-card p-4 text-sm font-semibold transition-transform hover:-translate-y-0.5">
              Flashcards
            </Link>
            <Link href={`${courseHref}/unit/${unitId}/key-concepts`} className="app-card p-4 text-sm font-semibold transition-transform hover:-translate-y-0.5">
              Key concepts
            </Link>
            <Link href={`${courseHref}/unit/${unitId}/quiz`} className="app-card p-4 text-sm font-semibold transition-transform hover:-translate-y-0.5">
              Unit exam
            </Link>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2 theme-accent">
          <Layers3 className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.22em]">Chapter flow</span>
        </div>

        <div className="space-y-3">
          {chapters.map(chapter => {
            const isViewed = ready ? hasViewedChapter(courseId, unitId, chapter.id) : false;

            return (
              <div
                key={chapter.id}
                className="app-panel p-5"
                style={{
                  background: `linear-gradient(180deg, color-mix(in srgb, ${courseColor} 7%, var(--panel)) 0%, var(--bg-elevated) 100%)`,
                }}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl"
                      style={{ background: `${courseColor}22`, color: courseColor }}
                    >
                      {ready ? isViewed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" /> : chapter.chapter_number}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] app-muted">Chapter {chapter.chapter_number}</div>
                      <h3 className="mt-1 font-display text-xl font-semibold">{chapter.name}</h3>
                      <p className="mt-2 text-sm leading-6 app-copy">
                        Read the notes first, then use the quiz to see whether the chapter actually stuck.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="app-chip px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]">Step 1 · notes</span>
                        {chapter.hasQuiz && <span className="app-chip px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]">Step 2 · quiz</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}`} className="app-primary-button px-4 py-3 text-sm">
                      Open notes
                    </Link>
                    {chapter.hasQuiz && (
                      <Link href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}/quiz`} className="app-secondary-button px-4 py-3 text-sm font-semibold">
                        Chapter quiz
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
