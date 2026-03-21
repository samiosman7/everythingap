import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Compass, FileSpreadsheet, Layers3 } from "lucide-react";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";
import CourseUnitOrganizer from "@/components/CourseUnitOrganizer";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/sign-in");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    courseId,
    "id, slug, name, emoji, color, accent, full_exam"
  );

  if (!course) notFound();

  const { data: units } = await supabase
    .from("units")
    .select("id, unit_number, name")
    .eq("course_id", course.id)
    .order("unit_number");

  const unitIds = (units ?? []).map(unit => unit.id);
  const { data: chapters } = unitIds.length
    ? await supabase.from("chapters").select("id, unit_id").in("unit_id", unitIds)
    : { data: [] as Array<{ id: number; unit_id: number }> };

  const organizedUnits = (units ?? []).map(unit => ({
    ...unit,
    id: String(unit.id),
    chapterCount: (chapters ?? []).filter(chapter => chapter.unit_id === unit.id).length,
  }));

  const courseHref = getCourseHref(course);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex flex-wrap items-center gap-3 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 px-6 py-4 backdrop-blur-md">
        <Link href="/dashboard" className="text-sm font-body text-[#8888aa] transition-colors hover:text-[#e8e8f0]">
          Back to dashboard
        </Link>
        <span className="text-[#2a2a3a]">/</span>
        <span className="text-sm font-body font-medium text-[#e8e8f0]">{course.name}</span>
      </nav>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-7">
            <div className="flex items-start gap-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                style={{ background: `${course.color}22` }}
              >
                <span aria-hidden="true">{course.emoji}</span>
              </div>
              <div>
                <p className="text-xs font-body uppercase tracking-[0.22em] text-[#9d96ff]">Course hub</p>
                <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{course.name}</h1>
                <p className="mt-3 max-w-2xl text-sm font-body leading-7 text-[#8f8fac]">
                  This class now has one clean structure: course hub, then unit hub, then chapter notes and quizzes.
                  Open the unit you need and you should always know what comes next.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-7">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Layers3, label: "Units", value: organizedUnits.length },
                {
                  icon: Compass,
                  label: "Chapters",
                  value: organizedUnits.reduce((sum, unit) => sum + unit.chapterCount, 0),
                },
                { icon: FileSpreadsheet, label: "Full exam", value: course.full_exam ? "Ready" : "Soon" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-[#1e1e2e] bg-[#0c0c12] p-4">
                    <Icon className="h-5 w-5 text-[#9d96ff]" />
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#7f7f9f]">{item.label}</p>
                    <p className="mt-1 font-display text-xl font-semibold text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>

            {course.full_exam && (
              <Link
                href={`${courseHref}/exam`}
                className="mt-5 block rounded-2xl border px-5 py-4 text-sm font-body transition-all hover:-translate-y-0.5"
                style={{ background: `${course.color}10`, borderColor: `${course.color}30`, color: "#f0f0ff" }}
              >
                Open full AP mock exam
              </Link>
            )}
          </div>
        </section>

        <section className="mt-8">
          <CourseUnitOrganizer
            courseId={course.id}
            courseHref={courseHref}
            courseColor={course.color ?? "#6c63ff"}
            units={organizedUnits}
            hasFullExam={Boolean(course.full_exam)}
          />
        </section>
      </main>
    </div>
  );
}
