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
  const hasFullExam = Boolean(course.full_exam);
  const totalChapters = organizedUnits.reduce((sum, unit) => sum + unit.chapterCount, 0);

  return (
    <div className="min-h-screen">
      <nav
        className="sticky top-0 z-50 flex flex-wrap items-center gap-3 border-b px-6 py-4 backdrop-blur-md"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg-elevated) 86%, transparent)" }}
      >
        <Link href="/dashboard" className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          Back to dashboard
        </Link>
        <span style={{ color: "var(--line-strong)" }}>/</span>
        <span className="text-sm font-medium">{course.name}</span>
      </nav>

      <main className="app-page">
        <section className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="app-panel p-7">
            <div className="flex items-start gap-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                style={{ background: `${course.color}22` }}
              >
                <span aria-hidden="true">{course.emoji}</span>
              </div>
              <div>
                <p className="app-kicker">Course hub</p>
                <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{course.name}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 app-copy">
                  Open a unit, move through the chapters, and use the full mock exam when you want the capstone practice.
                </p>
              </div>
            </div>
          </div>

          <div className="app-panel p-7">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Layers3, label: "Units", value: organizedUnits.length },
                { icon: Compass, label: "Chapters", value: totalChapters },
                { icon: FileSpreadsheet, label: "Full exam", value: hasFullExam ? "Ready" : "Soon" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="app-card p-4">
                    <Icon className="h-5 w-5 theme-accent" />
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] app-muted">{item.label}</p>
                    <p className="mt-1 font-display text-xl font-semibold">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`${courseHref}/exam`} className="app-primary-button inline-flex items-center gap-2 px-5 py-4 text-sm">
                {hasFullExam ? "Open full AP mock exam" : "Open full AP mock exam page"}
              </Link>
              <Link href="#course-units" className="app-secondary-button inline-flex items-center gap-2 px-5 py-4 text-sm font-semibold">
                Jump to units
              </Link>
            </div>
          </div>
        </section>

        <section id="course-units" className="mt-8">
          <CourseUnitOrganizer
            courseId={course.id}
            courseHref={courseHref}
            courseColor={course.color ?? "var(--accent)"}
            units={organizedUnits}
            hasFullExam={hasFullExam}
          />
        </section>
      </main>
    </div>
  );
}
