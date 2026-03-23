"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bookmark, Brain, NotebookPen, Target } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import ResumeWhereLeftOff from "@/components/ResumeWhereLeftOff";
import StudyDashboardWidgets from "@/components/student/StudyDashboardWidgets";
import { ChapterWorkspacePanel, UnitWorkspacePanel } from "@/components/student/StudyWorkspacePanels";
import { readSelectedCourseIds } from "@/lib/course-preferences";
import { getCourseHref } from "@/lib/course";

type StudentSpaceCourse = {
  id: string;
  slug?: string | null;
  name: string;
  emoji: string;
  color: string;
  accent: string;
};

type StudentSpaceClientProps = {
  courses: StudentSpaceCourse[];
  emailLabel: string;
  isGuest: boolean;
  focus?: "chapter" | "unit" | null;
  focusMeta?: {
    courseId?: string;
    unitId?: string;
    chapterId?: string;
    courseName?: string;
    unitName?: string;
    chapterName?: string;
    href?: string;
  };
};

const LAYER_FEATURES = [
  {
    icon: Brain,
    title: "Confidence tracking",
    description: "Mark what feels strong, shaky, or not ready yet without cluttering the lesson pages.",
  },
  {
    icon: NotebookPen,
    title: "Private study notes",
    description: "Save summaries, reminders, and future-you notes right next to the material they belong to.",
  },
  {
    icon: Target,
    title: "Reflection that helps",
    description: "Keep what tripped you up, what to review next, and where confidence does not match scores.",
  },
  {
    icon: Bookmark,
    title: "Review signals",
    description: "Pull together confusing topics, review-later flags, likely-on-the-test saves, and mastered areas.",
  },
];

export default function StudentSpaceClient({ courses, emailLabel, isGuest, focus = null, focusMeta }: StudentSpaceClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(readSelectedCourseIds());
  }, []);

  const selectedCourses = useMemo(
    () => courses.filter(course => selectedIds.includes(course.id)),
    [courses, selectedIds]
  );
  const focusHref = focusMeta?.href || "/student-space";
  const focusTitle =
    focus === "chapter"
      ? `${focusMeta?.courseName || "Course"} · ${focusMeta?.chapterName || "Chapter"}`
      : focus === "unit"
        ? `${focusMeta?.courseName || "Course"} · ${focusMeta?.unitName || "Unit"}`
        : null;

  return (
    <div className="app-shell">
      <DashboardSidebar
        emailLabel={emailLabel}
        isGuest={isGuest}
        selectedCourses={selectedCourses.map(course => ({
          id: course.id,
          name: course.name,
          emoji: course.emoji,
          href: getCourseHref(course),
        }))}
      />

      <div className="app-main">
        <header className="app-header">
          <p className="app-kicker">Student space</p>
          <h1 className="app-title mt-2">Your private learning layer.</h1>
          <p className="app-copy mt-3 max-w-3xl">
            Keep your notes, confidence signals, reminders, and weak spots here so the course pages can stay focused on studying.
          </p>
        </header>

        <main className="app-page">
          <div className="space-y-6">
            {focus === "chapter" && focusMeta?.chapterId && focusMeta?.courseId && (
              <section className="space-y-4">
                <div className="app-panel p-6">
                  <p className="app-kicker">Chapter reflection</p>
                  <h2 className="app-section-title mt-3">{focusTitle}</h2>
                  <p className="app-copy mt-3">
                    This is the clean place to save what still feels shaky after the notes and chapter quiz, without dumping a giant reflection form into the lesson page itself.
                  </p>
                  <div className="mt-5">
                    <Link href={focusHref} className="app-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                      Back to chapter
                    </Link>
                  </div>
                </div>

                <ChapterWorkspacePanel
                  chapterId={focusMeta.chapterId}
                  meta={{
                    courseId: focusMeta.courseId,
                    unitId: focusMeta.unitId,
                    chapterId: focusMeta.chapterId,
                    href: focusHref,
                    label: focusTitle || "Chapter reflection",
                  }}
                />
              </section>
            )}

            {focus === "unit" && focusMeta?.unitId && focusMeta?.courseId && (
              <section className="space-y-4">
                <div className="app-panel p-6">
                  <p className="app-kicker">Unit reflection</p>
                  <h2 className="app-section-title mt-3">{focusTitle}</h2>
                  <p className="app-copy mt-3">
                    Use this after the unit exam or a full review pass. It keeps unit-level confidence and reminders in one calm spot instead of wedging them next to the unit organizer.
                  </p>
                  <div className="mt-5">
                    <Link href={focusHref} className="app-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                      Back to unit
                    </Link>
                  </div>
                </div>

                <UnitWorkspacePanel
                  unitId={focusMeta.unitId}
                  meta={{
                    courseId: focusMeta.courseId,
                    unitId: focusMeta.unitId,
                    href: focusHref,
                    label: focusTitle || "Unit reflection",
                  }}
                />
              </section>
            )}

            <section className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
              <div className="app-panel p-6 sm:p-7">
                <p className="app-kicker">What this page is for</p>
                <h2 className="app-section-title mt-3">Keep the signals, not the noise.</h2>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {LAYER_FEATURES.map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="app-card p-4">
                        <Icon className="h-5 w-5 theme-accent" />
                        <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 app-copy">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <ResumeWhereLeftOff />

                <div className="app-panel p-6">
                  <p className="app-kicker">Best use of this space</p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Leave one useful reminder after each quiz instead of filling out a giant form.",
                      "Use confidence marks honestly so the dashboard can spot weak areas earlier.",
                      "Treat this page like your own study control room, not another lesson page.",
                    ].map((tip, index) => (
                      <div key={tip} className="app-card flex items-start gap-3 p-4">
                        <div
                          className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ background: "var(--accent)" }}
                        >
                          {index + 1}
                        </div>
                        <p className="text-sm leading-6 app-copy">{tip}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/dashboard" className="app-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                      Back to dashboard
                    </Link>
                    <Link
                      href={selectedCourses[0] ? getCourseHref(selectedCourses[0]) : "/onboarding"}
                      className="app-primary-button inline-flex items-center gap-2 px-4 py-3 text-sm"
                    >
                      {selectedCourses[0] ? "Open a course" : "Pick classes first"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="app-kicker">Your signals</p>
                <h2 className="app-section-title mt-2">Everything you marked, saved, flagged, or reflected on.</h2>
                <p className="app-copy mt-3 max-w-3xl">
                  This page acts like a clean control panel for your learning signals, not another noisy dashboard.
                </p>
              </div>

              <StudyDashboardWidgets />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
