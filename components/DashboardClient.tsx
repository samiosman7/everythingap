"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpenText, Compass, Search, Target } from "lucide-react";
import { getCourseHref } from "@/lib/course";
import { groupCoursesByCategory } from "@/lib/course-display";
import { readSelectedCourseIds } from "@/lib/course-preferences";
import ResumeWhereLeftOff from "@/components/ResumeWhereLeftOff";
import DashboardSidebar from "@/components/DashboardSidebar";
import { getCourseProgress } from "@/lib/study-progress";

type DashboardCourse = {
  id: string;
  slug?: string | null;
  name: string;
  emoji: string;
  color: string;
  accent: string;
  units: Array<{
    id: string;
    chapterCount: number;
  }>;
};

type DashboardClientProps = {
  courses: DashboardCourse[];
  emailLabel: string;
  isGuest: boolean;
};

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/8">
      <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}

export default function DashboardClient({ courses, emailLabel, isGuest }: DashboardClientProps) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSelectedIds(readSelectedCourseIds());
    setReady(true);
  }, []);

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? courses.filter(course => course.name.toLowerCase().includes(normalized))
      : courses;
  }, [courses, query]);

  const selectedCourses = filteredCourses.filter(course => selectedIds.includes(course.id));
  const remainingCourses = filteredCourses.filter(course => !selectedIds.includes(course.id));
  const groupedCourses = groupCoursesByCategory(remainingCourses);

  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[32px] border border-[#1e1e2e] bg-[#0d0d14] shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:flex-row">
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

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-white/10 bg-[#0f0f17]/90 px-5 py-4 backdrop-blur-md sm:px-8">
          <p className="text-xs font-body font-medium uppercase tracking-[0.24em] text-[#8f89b5]">Dashboard</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">Your AP command center</h1>
          <p className="mt-2 max-w-3xl font-body text-sm leading-7 text-[#8d8aa5]">
            Your sidebar keeps the main routes in reach, your selected classes pinned, and the rest of the dashboard focused on where to study next.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          <div className="space-y-8 sm:space-y-10">
            <div id="resume-section">
              <ResumeWhereLeftOff />
            </div>

            <section className="grid gap-4 lg:grid-cols-[1.25fr,0.75fr]">
              <div className="rounded-[28px] border border-[#1e1e2e] bg-[radial-gradient(circle_at_top_left,_rgba(108,99,255,0.22),_transparent_45%),linear-gradient(180deg,#111118_0%,#0e0e15_100%)] p-5 sm:p-7">
                <p className="text-xs font-body font-medium uppercase tracking-[0.24em] text-[#9d96ff]">Study system</p>
                <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                  Everything is organized around what students actually do next.
                </h2>
                <p className="mt-4 max-w-2xl text-sm font-body leading-7 text-[#b2b0c9]">
                  Open your class, move through units in order, jump into a chapter, and keep your place. No more trying to
                  remember whether the quiz was inside the unit page, hidden in a card, or buried three clicks deep.
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {[
                    { icon: Target, title: "Resume fast", desc: "Jump back to your last study page immediately." },
                    { icon: BookOpenText, title: "Track progress", desc: "See what chapters and tools you have already opened." },
                    { icon: Compass, title: "Stay oriented", desc: "Course hubs and unit hubs now have a clearer hierarchy." },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <Icon className="h-5 w-5 text-[#cfcaff]" />
                        <h3 className="mt-3 font-display text-lg font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#9d99b5]">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-5 sm:p-7">
                <p className="text-xs font-body font-medium uppercase tracking-[0.24em] text-[#9d96ff]">Find a class</p>
                <h3 className="mt-3 font-display text-2xl font-bold text-white">Pick up exactly where you need to.</h3>
                <div className="mt-5 rounded-2xl border border-dashed border-[#2a2a3a] bg-[#0a0a0f] p-4">
                  <div className="flex items-center gap-2 text-[#8888aa]">
                    <Search className="h-4 w-4 shrink-0" />
                    <input
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                      placeholder="Search AP Biology, AP Calculus..."
                      className="w-full min-w-0 bg-transparent text-sm font-body text-[#e8e8f0] outline-none placeholder:text-[#494965]"
                    />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#8d8aa5]">
                  Use onboarding to choose your current AP classes, then the dashboard keeps those courses at the top and in the sidebar.
                </p>
              </div>
            </section>

            {selectedCourses.length > 0 && (
              <section id="my-courses">
                <div className="mb-5">
                  <p className="text-xs font-body font-medium uppercase tracking-[0.24em] text-[#9d96ff]">My courses</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">Your semester at a glance</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {selectedCourses.map(course => {
                    const progress = ready
                      ? getCourseProgress(course.id, course.units)
                      : { percent: 0, completedItems: 0, totalItems: 0 };

                    return (
                      <div key={course.id} className="rounded-[24px] border border-[#1e1e2e] bg-[#111118] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                              style={{ background: `${course.color}22` }}
                            >
                              <span aria-hidden="true">{course.emoji}</span>
                            </div>
                            <div>
                              <h3 className="font-display text-xl font-semibold text-white">{course.name}</h3>
                              <p className="mt-1 text-sm text-[#8b87a3]">
                                {course.units.length} units · {course.units.reduce((sum, unit) => sum + unit.chapterCount, 0)} chapters
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full border border-[#2f2f46] px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-[#7f7f9f]">
                            Selected
                          </span>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#d8d6e7]">Progress</span>
                            <span className="font-semibold text-white">{progress.percent}%</span>
                          </div>
                          <div className="mt-3">
                            <ProgressBar percent={progress.percent} color={course.color} />
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <Link
                            href={getCourseHref(course)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#120f24]"
                          >
                            Open course hub
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section id="browse-courses" className="space-y-8">
              {Object.entries(groupedCourses).map(([category, items]) => (
                <div key={category}>
                  <div className="mb-4">
                    <p className="text-xs font-body uppercase tracking-[0.24em] text-[#58546d]">{category}</p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-white">{category}</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map(course => (
                      <Link
                        key={course.id}
                        href={getCourseHref(course)}
                        className="group relative overflow-hidden rounded-[24px] border border-[#1e1e2e] bg-[#111118] p-5 transition-all hover:-translate-y-1 hover:border-[#6c63ff]/25"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 opacity-70" style={{ background: course.color }} />
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                          style={{ background: `${course.color}22` }}
                        >
                          <span aria-hidden="true">{course.emoji}</span>
                        </div>
                        <h3 className="mt-5 font-display text-xl font-semibold text-[#f5f5ff]">{course.name}</h3>
                        <p className="mt-2 text-sm font-body leading-6 text-[#8888aa]">
                          Open the course hub for a cleaner unit-by-unit path through notes, quizzes, flashcards, and exams.
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
