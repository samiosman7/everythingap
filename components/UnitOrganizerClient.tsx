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
    <div className="h-2 overflow-hidden rounded-full bg-white/8">
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

  const progress = ready ? getUnitProgress(courseId, unitId, chapters.length) : { percent: 0, viewedCount: 0, completedQuizCount: 0 };
  const lastVisited = ready ? getLastVisited() : null;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(155deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#bdb8ff]">Unit {unitNumber}</div>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">{unitName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a7a3be]">
              Chapter notes, quick review tools, and exams are all grouped here so you can move through the unit in order
              instead of bouncing around the app.
            </p>
          </div>

          {lastVisited?.courseId === courseId && lastVisited?.unitId === unitId && (
            <Link
              href={lastVisited.href}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#120f24]"
            >
              Resume this unit
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-white">Unit progress</span>
              <span className="text-sm font-semibold text-white">{progress.percent}%</span>
            </div>
            <div className="mt-3">
              <ProgressBar percent={progress.percent} color={courseColor} />
            </div>
            <p className="mt-3 text-sm text-[#9c98b4]">
              {progress.viewedCount} of {chapters.length} chapters opened, plus your review tools.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link href={`${courseHref}/unit/${unitId}/flashcards`} className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm font-medium text-white">
              Flashcards
            </Link>
            <Link href={`${courseHref}/unit/${unitId}/key-concepts`} className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm font-medium text-white">
              Key concepts
            </Link>
            <Link href={`${courseHref}/unit/${unitId}/quiz`} className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm font-medium text-white">
              Unit exam
            </Link>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2 text-[#bdb8ff]">
          <Layers3 className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.22em]">Chapter flow</span>
        </div>

        <div className="space-y-3">
          {chapters.map(chapter => {
            const isViewed = ready ? hasViewedChapter(courseId, unitId, chapter.id) : false;

            return (
              <div key={chapter.id} className="rounded-[24px] border border-white/10 bg-[#111118] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl"
                      style={{ background: `${courseColor}22`, color: courseColor }}
                    >
                      {ready ? (
                        isViewed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />
                      ) : (
                        chapter.chapter_number
                      )}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#787491]">Chapter {chapter.chapter_number}</div>
                      <h3 className="mt-1 font-display text-xl font-semibold text-white">{chapter.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#9f9bb6]">
                        Open notes first, then use the quiz to check whether the chapter actually stuck.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}`} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#120f24]">
                      Open notes
                    </Link>
                    {chapter.hasQuiz && (
                      <Link href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}/quiz`} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-[#ece9fb]">
                        Take quiz
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
