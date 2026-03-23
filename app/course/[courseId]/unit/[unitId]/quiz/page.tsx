import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import FRQViewer from "@/components/FRQViewer";
import StudySessionTracker from "@/components/StudySessionTracker";
import StudyQuizExperience from "@/components/student/StudyQuizExperience";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

export default async function UnitQuizPage({
  params,
}: {
  params: Promise<{ courseId: string; unitId: string }>;
}) {
  const { courseId, unitId } = await params;
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/sign-in");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    courseId,
    "id, slug, name, color"
  );
  if (!course) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, name, unit_number, course_id, unit_exam")
    .eq("id", unitId)
    .single();

  if (!unit || unit.course_id !== course.id) notFound();

  const exam = unit.unit_exam;
  const multipleChoice = Array.isArray(exam?.multiple_choice) ? exam.multiple_choice : [];
  const freeResponse = Array.isArray(exam?.free_response) ? exam.free_response : [];
  const hasExamContent = multipleChoice.length > 0 || freeResponse.length > 0;
  const courseHref = getCourseHref(course);

  return (
    <div className="min-h-screen">
      <nav
        className="sticky top-0 z-50 flex items-center gap-2 border-b px-6 py-4 backdrop-blur-md"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg-elevated) 86%, transparent)" }}
      >
        <Link href={`${courseHref}/unit/${unitId}`} className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          Back to {unit.name}
        </Link>
      </nav>
      <main className="app-page">
        <StudySessionTracker
          courseId={course.id}
          unitId={String(unit.id)}
          href={`${courseHref}/unit/${unitId}/quiz`}
          label={`${course.name} · ${unit.name} unit exam`}
          kind="unit-exam"
        />

        <div className="app-panel mb-8 p-6 md:p-8">
          <div className="mb-2 app-kicker">Unit exam</div>
          <h1 className="font-display text-2xl font-bold md:text-4xl">{unit.name}</h1>
          {hasExamContent && (
            <p className="mt-2 text-sm app-copy">
              {multipleChoice.length} MC · {freeResponse.length} FRQ
            </p>
          )}
        </div>

        {hasExamContent ? (
          <div className="space-y-10">
            {multipleChoice.length > 0 && (
              <section className="app-panel p-6 md:p-8">
                <h2 className="mb-6 border-b pb-3 font-display text-lg font-bold" style={{ borderColor: "var(--line)" }}>
                  Multiple Choice
                </h2>
                <StudyQuizExperience
                  questions={multipleChoice}
                  color={course.color ?? "var(--accent)"}
                  courseId={course.id}
                  unitId={String(unit.id)}
                  href={`${courseHref}/unit/${unit.id}/quiz`}
                  label={`${course.name} · ${unit.name} unit exam`}
                  courseName={course.name}
                  unitName={unit.name}
                  kind="unit-exam"
                />
              </section>
            )}
            {freeResponse.length > 0 && (
              <section className="app-panel p-6 md:p-8">
                <h2 className="mb-6 border-b pb-3 font-display text-lg font-bold" style={{ borderColor: "var(--line)" }}>
                  Free Response
                </h2>
                <FRQViewer
                  questions={freeResponse}
                  workspaceMeta={{
                    courseId: course.id,
                    unitId: String(unit.id),
                    href: `${courseHref}/unit/${unit.id}/quiz`,
                    labelPrefix: `${course.name} · ${unit.name} unit exam`,
                  }}
                />
              </section>
            )}
          </div>
        ) : (
          <div className="app-panel py-16 text-center">
            <div className="mb-3 text-3xl font-display font-bold">Soon</div>
            <p className="app-copy">Unit exam is being generated. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
