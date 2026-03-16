import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import QuizPlayer from "@/components/QuizPlayer";
import FRQViewer from "@/components/FRQViewer";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

export default async function UnitQuizPage({
  params,
}: {
  params: { courseId: string; unitId: string };
}) {
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/auth/login");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    params.courseId,
    "id, slug, name, color"
  );
  if (!course) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, name, unit_number, course_id, unit_exam")
    .eq("id", params.unitId)
    .single();

  if (!unit || unit.course_id !== course.id) notFound();

  const exam = unit.unit_exam;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <Link href={`${getCourseHref(course)}/unit/${params.unitId}`} className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">
          Back to {unit.name}
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-[#8888aa] text-xs font-body font-medium uppercase tracking-widest mb-2">Unit Exam</div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{unit.name}</h1>
          {exam && (
            <p className="text-[#8888aa] font-body text-sm mt-1">
              {exam.multiple_choice?.length ?? 0} MC · {exam.free_response?.length ?? 0} FRQ
            </p>
          )}
        </div>

        {exam ? (
          <div className="space-y-12">
            {exam.multiple_choice?.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-lg mb-6 pb-3 border-b border-[#1e1e2e]">
                  Multiple Choice
                </h2>
                <QuizPlayer questions={exam.multiple_choice} color={course.color ?? "#6c63ff"} />
              </section>
            )}
            {exam.free_response?.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-lg mb-6 pb-3 border-b border-[#1e1e2e]">
                  Free Response
                </h2>
                <FRQViewer questions={exam.free_response} />
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-[#8888aa] font-body">
            <div className="text-3xl mb-3">Soon</div>
            <p>Unit exam is being generated. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
