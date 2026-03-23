"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark, Brain, FileText, NotebookPen, Sparkles, Target } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import ResumeWhereLeftOff from "@/components/ResumeWhereLeftOff";
import StudyDashboardWidgets from "@/components/student/StudyDashboardWidgets";
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
};

const LAYER_FEATURES = [
  {
    icon: Brain,
    title: "Track how ready you actually feel",
    description: "Mark chapters, units, and study tools as strong, shaky, or still confusing before you forget.",
  },
  {
    icon: NotebookPen,
    title: "Keep your own notes inside the flow",
    description: "Save summaries, reminders, future-you notes, and sticky thoughts right next to the lesson.",
  },
  {
    icon: Target,
    title: "Catch weak spots earlier",
    description: "Compare confidence against quiz results so you know where you only felt prepared.",
  },
  {
    icon: Bookmark,
    title: "Build a review list that matters",
    description: "Flag likely-on-the-test moments, review-later topics, and the things you always forget.",
  },
];

export default function StudentSpaceClient({ courses, emailLabel, isGuest }: StudentSpaceClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(readSelectedCourseIds());
  }, []);

  const selectedCourses = useMemo(
    () => courses.filter(course => selectedIds.includes(course.id)),
    [courses, selectedIds]
  );

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#0d0d14] md:flex-row">
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

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="orb animate-pulse-glow right-10 top-12 h-28 w-28 bg-[#8b80ff]/12" />
        <div className="orb animate-drift-x left-12 top-52 h-20 w-20 bg-[#5ed7ff]/8" />

        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-b border-white/10 bg-[#0f0f17]/90 px-5 py-4 backdrop-blur-md sm:px-8"
        >
          <p className="text-xs font-body font-medium uppercase tracking-[0.24em] text-[#8f89b5]">Student space</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            Your private learning layer lives here.
          </h1>
          <p className="mt-2 max-w-3xl font-body text-sm leading-7 text-[#8d8aa5]">
            This is where confidence checks, private notes, reminders, reflections, and future-you study cues all come
            together, without cluttering the main dashboard.
          </p>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          <div className="space-y-8 sm:space-y-10">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]"
            >
              <div className="rounded-[28px] border border-[#1e1e2e] bg-[radial-gradient(circle_at_top_left,_rgba(108,99,255,0.2),_transparent_40%),linear-gradient(180deg,#12121a_0%,#0e0e15_100%)] p-5 sm:p-7">
                <div className="flex items-center gap-2 text-[#d8d2ff]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">Student-owned learning</span>
                </div>
                <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl">
                  Keep what you know, what you missed, and what to revisit in one place.
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[#bbb7d2]">
                  Instead of scattering thoughts across screenshots, tabs, and random notes apps, this page keeps your
                  confidence marks, reminders, reflections, and study notes tied directly to the AP material itself.
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {LAYER_FEATURES.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <Icon className="h-5 w-5 text-[#cbc5ff]" />
                        <h3 className="mt-3 font-display text-lg font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#9d99b5]">{item.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <ResumeWhereLeftOff />

                <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-5 sm:p-6">
                  <p className="text-xs font-body font-medium uppercase tracking-[0.24em] text-[#9d96ff]">
                    Best way to use this
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Leave confidence marks after each chapter instead of waiting until the night before the test.",
                      "Write one useful reminder after quizzes so the next review session starts smarter.",
                      "Use FRQ reflections to track exactly which rubric point keeps slipping away.",
                    ].map((step, index) => (
                      <div key={step} className="flex items-start gap-3 rounded-2xl border border-[#202034] bg-[#0d0d14] p-4">
                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#6c63ff]/12 text-xs font-semibold text-[#c8c4ff]">
                          {index + 1}
                        </div>
                        <p className="text-sm font-body leading-6 text-[#c7c7dd]">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#eceaff] transition-colors hover:bg-white/10"
                    >
                      Back to dashboard
                    </Link>
                    <Link
                      href={selectedCourses[0] ? getCourseHref(selectedCourses[0]) : "/onboarding"}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#120f24]"
                    >
                      {selectedCourses[0] ? "Open a course" : "Pick classes first"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.section>

            <section className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <p className="text-xs font-body font-medium uppercase tracking-[0.24em] text-[#9d96ff]">
                  Your learning signals
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">
                  Everything you marked, saved, flagged, or reflected on.
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9793ae]">
                  This page pulls together your weak spots, reminders, notes, confidence gaps, and mastered topics so
                  you can actually act on them.
                </p>
              </motion.div>

              <StudyDashboardWidgets />
            </section>

            <section className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-5 sm:p-7">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-body font-medium uppercase tracking-[0.24em] text-[#9d96ff]">
                    What gets saved here
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">Everything students usually lose track of</h2>
                </div>
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm leading-6 text-[#87839f]">
                  Confidence, chapter notes, review-later tags, confusing topics, quiz reflections, FRQ revision notes,
                  and more.
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  "Private chapter notes and sticky reminders",
                  "Confidence marks by chapter, unit, and study tool",
                  "Review-later flags and likely-on-the-test saves",
                  "Post-quiz reflections and mistake patterns",
                  "FRQ draft notes and improvement plans",
                  "Recent notes, reminders, and mastered areas",
                ].map(item => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-[#c8c6d9]">
                    <FileText className="mb-3 h-4 w-4 text-[#bfbaff]" />
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
