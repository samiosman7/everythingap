"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, FileSpreadsheet, Layers3 } from "lucide-react";
import { getCourseProgress, getLastVisited, getUnitProgress, syncStudyProgressFromAccount } from "@/lib/study-progress";

type UnitItem = {
  id: string;
  unit_number: number;
  name: string;
  chapterCount: number;
};

type CourseUnitOrganizerProps = {
  courseId: string;
  courseHref: string;
  courseColor: string;
  units: UnitItem[];
  hasFullExam: boolean;
};

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/8">
      <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}

export default function CourseUnitOrganizer({
  courseId,
  courseHref,
  courseColor,
  units,
  hasFullExam,
}: CourseUnitOrganizerProps) {
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

  const courseProgress = ready ? getCourseProgress(courseId, units.map(unit => ({ id: unit.id, chapterCount: unit.chapterCount }))) : null;
  const lastVisited = ready ? getLastVisited() : null;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#bdb8ff]">Course progress</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">A cleaner way to move through this class</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#aaa6c0]">
              Work top to bottom by unit, see what you have already opened, and jump back to the last chapter without
              losing your place.
            </p>
          </div>
          {lastVisited?.courseId === courseId && (
            <Link
              href={lastVisited.href}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Resume last session
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#f3efff]">Overall completion</span>
              <span className="text-sm font-semibold text-white">{courseProgress?.percent ?? 0}%</span>
            </div>
            <div className="mt-3">
              <ProgressBar percent={courseProgress?.percent ?? 0} color={courseColor} />
            </div>
            <p className="mt-3 text-sm text-[#9f9ab8]">
              {courseProgress?.completedItems ?? 0} of {courseProgress?.totalItems ?? 0} study checkpoints opened.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[#cfcaff]">
                <Layers3 className="h-4 w-4" />
                <span className="text-sm font-medium">Units</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{units.length}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[#cfcaff]">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Chapters opened</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{courseProgress?.viewedChapterCount ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[#cfcaff]">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="text-sm font-medium">Full exam</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{hasFullExam ? "Available" : "Not yet"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {units.map(unit => {
          const summary = ready ? getUnitProgress(courseId, unit.id, unit.chapterCount) : { percent: 0, viewedCount: 0 };

          return (
            <div key={unit.id} className="rounded-[24px] border border-white/10 bg-[#111118] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold"
                      style={{ background: `${courseColor}22`, color: courseColor }}
                    >
                      {unit.unit_number}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-white">{unit.name}</h3>
                      <p className="text-sm text-[#8f8ba8]">
                        {summary.viewedCount} of {unit.chapterCount} chapters opened
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 max-w-xl">
                    <ProgressBar percent={summary.percent} color={courseColor} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={`${courseHref}/unit/${unit.id}`} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#120f24]">
                    Open unit hub
                  </Link>
                  <Link href={`${courseHref}/unit/${unit.id}/flashcards`} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-[#ece9fb]">
                    Flashcards
                  </Link>
                  <Link href={`${courseHref}/unit/${unit.id}/quiz`} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-[#ece9fb]">
                    Unit exam
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
