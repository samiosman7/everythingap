"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, FileSpreadsheet, Layers3 } from "lucide-react";
import { getCourseProgress, getLastVisited, getUnitProgress, getUnitWorkspace, syncStudyProgressFromAccount } from "@/lib/study-progress";

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
    <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--panel-muted)" }}>
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
      <div className="app-panel p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="app-kicker">Course progress</p>
            <h2 className="app-section-title mt-2">Move through the class without losing your place.</h2>
            <p className="app-copy mt-3 max-w-2xl">
              Work unit by unit, see how much of the class you have actually touched, and keep the full mock exam in
              the same flow instead of hiding it.
            </p>
          </div>
          {lastVisited?.courseId === courseId && (
            <Link href={lastVisited.href} className="app-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
              Resume last session
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr,0.8fr]">
          <div className="app-card p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Overall completion</span>
              <span className="text-sm font-semibold">{courseProgress?.percent ?? 0}%</span>
            </div>
            <div className="mt-3">
              <ProgressBar percent={courseProgress?.percent ?? 0} color={courseColor} />
            </div>
            <p className="mt-3 text-sm app-copy">
              {courseProgress?.completedItems ?? 0} of {courseProgress?.totalItems ?? 0} study checkpoints opened.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {[
              { icon: Layers3, label: "Units", value: String(units.length) },
              { icon: BookOpen, label: "Chapters opened", value: String(courseProgress?.viewedChapterCount ?? 0) },
              { icon: FileSpreadsheet, label: "Full exam", value: hasFullExam ? "Available" : "Soon" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="app-card p-4">
                  <div className="flex items-center gap-2 theme-accent">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <p className="mt-3 text-2xl font-display font-bold">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {units.map(unit => {
          const summary = ready ? getUnitProgress(courseId, unit.id, unit.chapterCount) : { percent: 0, viewedCount: 0 };
          const confidence = ready ? getUnitWorkspace(unit.id)?.confidence?.value ?? null : null;

          return (
            <div
              key={unit.id}
              className="app-panel p-5"
              style={{
                background: `linear-gradient(180deg, color-mix(in srgb, ${courseColor} 8%, var(--panel)) 0%, var(--bg-elevated) 100%)`,
              }}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold"
                      style={{ background: `${courseColor}22`, color: courseColor }}
                    >
                      {unit.unit_number}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold">{unit.name}</h3>
                      <p className="mt-1 text-sm app-copy">
                        {summary.viewedCount} of {unit.chapterCount} chapters opened
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 max-w-xl">
                    <ProgressBar percent={summary.percent} color={courseColor} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="app-chip px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]">Confidence</span>
                    <span className="text-xs app-muted">
                      {confidence === null ? "No confidence rating yet" : `${confidence}% confidence`}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="app-chip px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]">{unit.chapterCount} chapters</span>
                    <span className="app-chip px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]">Notes → quiz → review</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={`${courseHref}/unit/${unit.id}`} className="app-primary-button px-4 py-3 text-sm">
                    Open unit hub
                  </Link>
                  <Link href={`${courseHref}/unit/${unit.id}/flashcards`} className="app-secondary-button px-4 py-3 text-sm font-semibold">
                    Flashcards
                  </Link>
                  <Link href={`${courseHref}/unit/${unit.id}/quiz`} className="app-secondary-button px-4 py-3 text-sm font-semibold">
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
