import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import QuizPlayer from "@/components/QuizPlayer";
import FRQViewer from "@/components/FRQViewer";
import StudySessionTracker from "@/components/StudySessionTracker";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

export default async function FullExamPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/sign-in");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    courseId,
    "id, slug, name, emoji, color, full_exam"
  );

  if (!course) notFound();

  const exam = course.full_exam;
  const multipleChoice = Array.isArray(exam?.multiple_choice) ? exam.multiple_choice : [];
  const freeResponse = Array.isArray(exam?.free_response) ? exam.free_response : [];
  const hasExamContent = multipleChoice.length > 0 || freeResponse.length > 0;
  const courseHref = getCourseHref(course);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 px-6 py-4 backdrop-blur-md">
        <Link href={courseHref} className="text-sm font-body text-[#8888aa] transition-colors hover:text-[#e8e8f0]">
          Back to {course.name}
        </Link>
      </nav>
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <StudySessionTracker
          courseId={course.id}
          href={`${courseHref}/exam`}
          label={`${course.name} · full AP mock exam`}
          kind="full-exam"
        />

        <div className="mb-8 rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
          <div className="mb-2 text-xs font-body font-medium uppercase tracking-widest text-[#8888aa]">
            Full AP Mock Exam
          </div>
          <h1 className="font-display text-2xl font-bold md:text-4xl">{course.name}</h1>
          {exam?.exam_info && hasExamContent && (
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                { label: "Total Time", val: `${exam.exam_info.total_time_minutes} min` },
                { label: "MC Questions", val: multipleChoice.length },
                { label: "FRQs", val: freeResponse.length },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-[#1e1e2e] bg-[#0c0c12] px-3 py-1.5 text-xs font-body">
                  <span className="text-[#8888aa]">{item.label}: </span>
                  <span className="font-medium text-[#e8e8f0]">{item.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {hasExamContent ? (
          <div className="space-y-10">
            {multipleChoice.length > 0 && (
              <section className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
                <h2 className="mb-6 border-b border-[#1e1e2e] pb-3 font-display text-lg font-bold">
                  Section I - Multiple Choice
                </h2>
                <QuizPlayer questions={multipleChoice} color={course.color ?? "#6c63ff"} />
              </section>
            )}
            {freeResponse.length > 0 && (
              <section className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
                <h2 className="mb-6 border-b border-[#1e1e2e] pb-3 font-display text-lg font-bold">
                  Section II - Free Response
                </h2>
                <FRQViewer questions={freeResponse} />
              </section>
            )}
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] py-16 text-center font-body text-[#8888aa]">
            <div className="mb-3 text-3xl">Soon</div>
            <p>Full exam is being generated. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
