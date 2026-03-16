import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import QuizPlayer from "@/components/QuizPlayer";
import FRQViewer from "@/components/FRQViewer";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

export default async function FullExamPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/auth/login");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    courseId,
    "id, slug, name, emoji, color, full_exam"
  );

  if (!course) notFound();
  const exam = course.full_exam;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <Link href={getCourseHref(course)} className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">
          Back to {course.name}
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-[#8888aa] text-xs font-body font-medium uppercase tracking-widest mb-2">Full AP Mock Exam</div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{course.name}</h1>
          {exam?.exam_info && (
            <div className="flex flex-wrap gap-3 mt-3">
              {[
                { label: "Total Time", val: `${exam.exam_info.total_time_minutes} min` },
                { label: "MC Questions", val: exam.exam_info.mc_count },
                { label: "FRQs", val: exam.exam_info.frq_count },
              ].map(item => (
                <div key={item.label} className="px-3 py-1.5 rounded-lg bg-[#111118] border border-[#1e1e2e] text-xs font-body">
                  <span className="text-[#8888aa]">{item.label}: </span>
                  <span className="text-[#e8e8f0] font-medium">{item.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {exam ? (
          <div className="space-y-12">
            {exam.multiple_choice?.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-lg mb-6 pb-3 border-b border-[#1e1e2e]">
                  Section I - Multiple Choice
                </h2>
                <QuizPlayer questions={exam.multiple_choice} color={course.color ?? "#6c63ff"} />
              </section>
            )}
            {exam.free_response?.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-lg mb-6 pb-3 border-b border-[#1e1e2e]">
                  Section II - Free Response
                </h2>
                <FRQViewer questions={exam.free_response} />
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-[#8888aa] font-body">
            <div className="text-3xl mb-3">Soon</div>
            <p>Full exam is being generated. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
