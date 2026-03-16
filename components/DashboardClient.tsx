"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpenText, Brain, FileSpreadsheet, GraduationCap, Search } from "lucide-react";
import { Course } from "@/types";
import { getCourseHref } from "@/lib/course";
import { getCourseBadge, groupCoursesByCategory } from "@/lib/course-display";
import { readSelectedCourseIds } from "@/lib/course-preferences";

type DashboardClientProps = {
  courses: Course[];
};

const TOOL_CARDS = [
  { title: "Chapter notes", desc: "Teacher-style explainers with examples and AP exam tips.", icon: BookOpenText },
  { title: "Flashcards", desc: "Quick memorization and concept checks for each unit.", icon: Brain },
  { title: "Exams", desc: "Unit tests, chapter quizzes, and full AP mocks in one place.", icon: FileSpreadsheet },
];

export default function DashboardClient({ courses }: DashboardClientProps) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(readSelectedCourseIds());
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
    <div className="space-y-10">
      <section className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
        <div className="rounded-[28px] border border-[#1e1e2e] bg-[radial-gradient(circle_at_top_left,_rgba(108,99,255,0.22),_transparent_45%),linear-gradient(180deg,#111118_0%,#0e0e15_100%)] p-7">
          <p className="text-xs font-body font-medium uppercase tracking-[0.24em] text-[#9d96ff]">Study HQ</p>
          <h2 className="mt-3 font-display text-3xl font-bold">Everything you need for every AP class is here.</h2>
          <p className="mt-3 max-w-2xl text-sm font-body leading-7 text-[#a9a9c7]">
            Start with the classes you&apos;re actually taking, then jump into notes, flashcards, key concepts,
            chapter quizzes, unit exams, and full mock exams without hunting through the app.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {TOOL_CARDS.map(card => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-[#2a2a3a] bg-[#0f0f17]/80 p-4">
                  <Icon className="h-5 w-5 text-[#9d96ff]" />
                  <h3 className="mt-3 font-display text-base font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm font-body leading-6 text-[#8d8da8]">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-7">
          <div className="flex items-center gap-3 text-[#9d96ff]">
            <GraduationCap className="h-5 w-5" />
            <p className="text-xs font-body font-medium uppercase tracking-[0.24em]">My Plan</p>
          </div>
          <h3 className="mt-3 font-display text-2xl font-bold">Recommended first stop</h3>
          <p className="mt-3 text-sm font-body leading-7 text-[#8d8da8]">
            Pick a course below and you&apos;ll see its notes, flashcards, quizzes, key concepts, and exams in one place.
          </p>

          <div className="mt-6 rounded-2xl border border-dashed border-[#2a2a3a] bg-[#0a0a0f] p-4">
            <div className="flex items-center gap-2 text-[#8888aa]">
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search AP Biology, AP Calculus..."
                className="w-full bg-transparent text-sm font-body text-[#e8e8f0] outline-none placeholder:text-[#494965]"
              />
            </div>
          </div>

          <p className="mt-4 text-xs font-body uppercase tracking-[0.22em] text-[#4f4f68]">
            {selectedCourses.length ? "Your selected AP classes" : "No selected classes yet"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedCourses.length ? selectedCourses.map(course => (
              <Link
                key={course.id}
                href={getCourseHref(course)}
                className="rounded-full border border-[#2f2f46] bg-[#171723] px-3 py-2 text-sm font-body text-[#f0f0ff] transition-colors hover:border-[#6c63ff]/40"
              >
                {course.name}
              </Link>
            )) : (
              <p className="text-sm font-body text-[#7f7f9f]">Use onboarding to choose the AP classes you&apos;re taking.</p>
            )}
          </div>
        </div>
      </section>

      {selectedCourses.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-body font-medium uppercase tracking-[0.24em] text-[#9d96ff]">Selected Courses</p>
              <h2 className="mt-2 font-display text-2xl font-bold">Start with your AP schedule</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {selectedCourses.map(course => (
              <Link
                key={course.id}
                href={getCourseHref(course)}
                className="group relative overflow-hidden rounded-[24px] border border-[#1e1e2e] bg-[#111118] p-5 transition-all hover:-translate-y-1 hover:border-[#6c63ff]/35"
              >
                <div className="absolute inset-x-0 top-0 h-1 opacity-80" style={{ background: course.color }} />
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-mono font-bold"
                    style={{ background: `${course.color}22`, color: course.color }}
                  >
                    {getCourseBadge(course.name)}
                  </div>
                  <span className="rounded-full border border-[#26263a] px-2.5 py-1 text-[11px] font-body uppercase tracking-[0.18em] text-[#7f7f9f]">
                    Selected
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-[#f5f5ff]">{course.name}</h3>
                <p className="mt-2 text-sm font-body leading-6 text-[#8888aa]">
                  Open the course hub for notes, flashcards, key concepts, quizzes, and full AP exam prep.
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-8">
        {Object.entries(groupedCourses).map(([category, items]) => (
          <div key={category}>
            <div className="mb-4">
              <p className="text-xs font-body uppercase tracking-[0.24em] text-[#4f4f68]">{category}</p>
              <h2 className="mt-1 font-display text-2xl font-bold">{category}</h2>
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
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-mono font-bold"
                    style={{ background: `${course.color}22`, color: course.color }}
                  >
                    {getCourseBadge(course.name)}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-[#f5f5ff]">{course.name}</h3>
                  <p className="mt-2 text-sm font-body leading-6 text-[#8888aa]">
                    Course hub with notes, flashcards, key concepts, quizzes, and AP-style exams.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
