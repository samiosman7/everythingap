"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { getCourseHref } from "@/lib/course";
import { groupCoursesByCategory } from "@/lib/course-display";
import { readSelectedCourseIds } from "@/lib/course-preferences";
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
    <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--panel-muted)" }}>
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
    return normalized ? courses.filter(course => course.name.toLowerCase().includes(normalized)) : courses;
  }, [courses, query]);

  const selectedCourses = filteredCourses.filter(course => selectedIds.includes(course.id));
  const remainingCourses = filteredCourses.filter(course => !selectedIds.includes(course.id));
  const groupedCourses = groupCoursesByCategory(remainingCourses);

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
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="app-header"
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="app-kicker">Dashboard</p>
              <h1 className="app-title mt-2">A cleaner place to start.</h1>
              <p className="app-copy mt-3 max-w-3xl">
                Open the right class, pick up where you left off, and get back to studying without digging through extra clutter.
              </p>
            </div>

            <div
              className="w-full max-w-md rounded-[20px] border px-4 py-3"
              style={{ borderColor: "var(--line)", background: "var(--input)" }}
            >
              <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <Search className="h-4 w-4 shrink-0" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search AP Biology, AP Calculus..."
                  className="w-full min-w-0 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text)" }}
                />
              </div>
            </div>
          </div>
        </motion.header>

        <main className="app-page">
          <div className="space-y-6">
            {selectedCourses.length > 0 && (
              <section id="my-courses">
                <div className="mb-4">
                  <p className="app-kicker">My courses</p>
                  <h2 className="app-section-title mt-2">Open the class you actually need right now.</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {selectedCourses.map((course, index) => {
                    const progress = ready ? getCourseProgress(course.id, course.units) : { percent: 0 };

                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.35, delay: index * 0.04 }}
                        className="app-panel p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                              style={{ background: `${course.color}22` }}
                            >
                              <span aria-hidden="true">{course.emoji}</span>
                            </div>
                            <div>
                              <h3 className="font-display text-xl font-semibold">{course.name}</h3>
                              <p className="mt-1 text-sm app-muted">
                                {course.units.length} units · {course.units.reduce((sum, unit) => sum + unit.chapterCount, 0)} chapters
                              </p>
                            </div>
                          </div>
                          <span className="app-chip px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]">Selected</span>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="app-muted">Progress</span>
                            <span className="font-semibold">{progress.percent}%</span>
                          </div>
                          <div className="mt-3">
                            <ProgressBar percent={progress.percent} color={course.color} />
                          </div>
                        </div>

                        <div className="mt-5">
                          <Link href={getCourseHref(course)} className="app-primary-button inline-flex items-center gap-2 px-4 py-3 text-sm">
                            Open course hub
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            <section id="browse-courses" className="space-y-8">
              {Object.entries(groupedCourses).map(([category, items], groupIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: groupIndex * 0.04 }}
                >
                  <div className="mb-4">
                    <p className="app-kicker">{category}</p>
                    <h2 className="app-section-title mt-2">{category}</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                      >
                        <Link href={getCourseHref(course)} className="app-card block p-5 transition-transform hover:-translate-y-1">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                            style={{ background: `${course.color}22` }}
                          >
                            <span aria-hidden="true">{course.emoji}</span>
                          </div>
                          <h3 className="mt-4 font-display text-xl font-semibold">{course.name}</h3>
                          <p className="mt-2 text-sm leading-6 app-copy">
                            Open the course hub for units, chapter notes, practice, and exams.
                          </p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
