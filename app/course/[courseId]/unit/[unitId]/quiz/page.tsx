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
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 px-6 py-4 backdrop-blur-md">
        <Link
          href={`${courseHref}/unit/${unitId}`}
          className="text-sm font-body text-[#8888aa] transition-colors hover:text-[#e8e8f0]"
        >
          Back to {unit.name}
        </Link>
      </nav>
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <StudySessionTracker
          courseId={course.id}
          unitId={String(unit.id)}
          href={`${courseHref}/unit/${unitId}/quiz`}
          label={`${course.name} · ${unit.name} unit exam`}
          kind="unit-exam"
        />

        <div className="mb-8 rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
          <div className="mb-2 text-xs font-body font-medium uppercase tracking-widest text-[#8888aa]">Unit Exam</div>
          <h1 className="font-display text-2xl font-bold md:text-4xl">{unit.name}</h1>
          {hasExamContent && (
            <p className="mt-2 text-sm font-body text-[#8888aa]">
              {multipleChoice.length} MC · {freeResponse.length} FRQ
            </p>
          )}
        </div>

        {hasExamContent ? (
          <div className="space-y-10">
            {multipleChoice.length > 0 && (
              <section className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
                <h2 className="mb-6 border-b border-[#1e1e2e] pb-3 font-display text-lg font-bold">
                  Multiple Choice
                </h2>
                <StudyQuizExperience
                  questions={multipleChoice}
                  color={course.color ?? "#6c63ff"}
                  courseId={course.id}
                  unitId={String(unit.id)}
                  href={`${courseHref}/unit/${unit.id}/quiz`}
                  label={`${course.name} • ${unit.name} unit exam`}
                  courseName={course.name}
                  unitName={unit.name}
                  kind="unit-exam"
                />
              </section>
            )}
            {freeResponse.length > 0 && (
              <section className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
                <h2 className="mb-6 border-b border-[#1e1e2e] pb-3 font-display text-lg font-bold">
                  Free Response
                </h2>
                <FRQViewer
                  questions={freeResponse}
                  workspaceMeta={{
                    courseId: course.id,
                    unitId: String(unit.id),
                    href: `${courseHref}/unit/${unit.id}/quiz`,
                    labelPrefix: `${course.name} • ${unit.name} unit exam`,
                  }}
                />
              </section>
            )}
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] py-16 text-center font-body text-[#8888aa]">
            <div className="mb-3 text-3xl">Soon</div>
            <p>Unit exam is being generated. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
