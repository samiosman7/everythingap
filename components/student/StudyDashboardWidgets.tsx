"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getConfidenceGapItems,
  getConfusedItems,
  getLeastConfidentItems,
  getMasteredItems,
  getRecentNotes,
  getReflectionItems,
  getReminderItems,
  syncStudyProgressFromAccount,
  type LearningDashboardItem,
} from "@/lib/study-progress";

type StudentSpaceCourse = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

function ItemList({
  title,
  emptyLabel,
  items,
  accent,
}: {
  title: string;
  emptyLabel: string;
  items: LearningDashboardItem[];
  accent?: string;
}) {
  return (
    <section className="app-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent ?? "var(--text-muted)" }}>{title}</p>
      {items.length > 0 ? (
        <div className="mt-3 space-y-3">
          {items.map(item => (
            <Link key={item.id} href={item.href} className="block rounded-2xl border px-4 py-3 transition-transform hover:-translate-y-0.5" style={{ borderColor: "var(--line)" }}>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-sm leading-6 app-copy">{item.detail}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 app-copy">{emptyLabel}</p>
      )}
    </section>
  );
}

export default function StudyDashboardWidgets({
  courses,
  selectedCourseIds,
}: {
  courses: StudentSpaceCourse[];
  selectedCourseIds: string[];
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      await syncStudyProgressFromAccount();
      if (mounted) setReady(true);
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const notes = ready ? getRecentNotes(100) : [];
    const reflections = ready ? getReflectionItems(100) : [];
    const weakAreas = ready ? [...getLeastConfidentItems(100), ...getConfusedItems(100), ...getConfidenceGapItems(100)] : [];
    const reminders = ready ? getReminderItems(100) : [];
    const mastered = ready ? getMasteredItems(100) : [];

    const preferredCourses = courses.filter(course => selectedCourseIds.includes(course.id));
    const remainingCourses = courses.filter(course => !selectedCourseIds.includes(course.id));
    const orderedCourses = [...preferredCourses, ...remainingCourses];

    return orderedCourses
      .map(course => ({
        course,
        notes: notes.filter(item => item.courseId === course.id).slice(0, 4),
        reflections: reflections.filter(item => item.courseId === course.id).slice(0, 4),
        weakAreas: weakAreas.filter(item => item.courseId === course.id).slice(0, 4),
        reminders: reminders.filter(item => item.courseId === course.id).slice(0, 4),
        mastered: mastered.filter(item => item.courseId === course.id).slice(0, 4),
      }))
      .filter(group => group.notes.length || group.reflections.length || group.weakAreas.length || group.reminders.length || group.mastered.length);
  }, [courses, ready, selectedCourseIds]);

  if (!ready) {
    return <div className="app-panel p-6 text-sm app-copy">Loading your student space...</div>;
  }

  if (grouped.length === 0) {
    return (
      <div className="app-panel p-6">
        <p className="app-kicker">Student space</p>
        <h3 className="app-section-title mt-2">Nothing saved yet.</h3>
        <p className="app-copy mt-3 max-w-2xl">
          Once you leave notes, reflections, reminders, or confidence marks in your courses, this page will split them out by class so it feels more like separate AP folders instead of one giant mixed list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {grouped.map(({ course, notes, reflections, weakAreas, reminders, mastered }) => (
        <section
          key={course.id}
          className="app-panel p-5 sm:p-6"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${course.color} 10%, var(--panel)) 0%, var(--bg-elevated) 100%)`,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl" style={{ background: `${course.color}22` }}>
                <span aria-hidden="true">{course.emoji}</span>
              </div>
              <div>
                <p className="app-kicker">By class</p>
                <h3 className="font-display text-2xl font-semibold">{course.name} notebook</h3>
              </div>
            </div>
            <span className="app-chip px-3 py-1 text-[11px] uppercase tracking-[0.18em]">Private workspace</span>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <ItemList
              title="Notes"
              emptyLabel="No private notes saved for this class yet."
              items={notes}
              accent={course.color}
            />
            <ItemList
              title="Reflections"
              emptyLabel="No chapter, unit, or FRQ reflections saved for this class yet."
              items={reflections}
              accent={course.color}
            />
            <ItemList
              title="Weak areas"
              emptyLabel="No weak areas marked for this class yet."
              items={weakAreas}
              accent={course.color}
            />
            <ItemList
              title="Reminders"
              emptyLabel="No review-later or likely-on-the-test reminders saved for this class yet."
              items={reminders}
              accent={course.color}
            />
            <div className="xl:col-span-2">
              <ItemList
                title="Mastered"
                emptyLabel="Nothing in this class has been marked as mastered yet."
                items={mastered}
                accent={course.color}
              />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
