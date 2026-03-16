import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Course, Unit } from "@/types";
import { getViewerContext } from "@/lib/viewer";

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/auth/login");

  const { data: course } = await supabase
    .from("courses")
    .select("id, name, emoji, color, accent")
    .eq("id", params.courseId)
    .single();

  if (!course) notFound();

  const { data: units } = await supabase
    .from("units")
    .select("id, unit_number, name")
    .eq("course_id", params.courseId)
    .order("unit_number");

  const hasFullExam = !!(await supabase
    .from("courses")
    .select("full_exam")
    .eq("id", params.courseId)
    .single()
  ).data?.full_exam;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center gap-3 px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <Link href="/dashboard" className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">
          ← All Courses
        </Link>
        <span className="text-[#2a2a3a]">/</span>
        <span className="text-[#e8e8f0] text-sm font-body font-medium">{course.name}</span>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Course Header */}
        <div className="mb-10 flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: `${course.color}20` }}
          >
            {course.emoji}
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">{course.name}</h1>
            <p className="text-[#8888aa] font-body text-sm">{units?.length ?? 0} units</p>
          </div>
        </div>

        {/* Full Exam CTA */}
        {hasFullExam && (
          <Link
            href={`/course/${course.id}/exam`}
            className="flex items-center justify-between p-5 rounded-2xl border mb-8 group transition-all hover:-translate-y-0.5"
            style={{ background: `${course.color}10`, borderColor: `${course.color}30` }}
          >
            <div>
              <div className="font-display font-bold text-base mb-0.5">🎯 Full AP Mock Exam</div>
              <div className="text-[#8888aa] text-sm font-body">Complete College Board-format exam with FRQs and rubrics</div>
            </div>
            <span className="text-[#8888aa] group-hover:text-[#e8e8f0] transition-colors text-xl">→</span>
          </Link>
        )}

        {/* Units */}
        <div className="space-y-3">
          {units?.map(unit => (
            <div
              key={unit.id}
              className="rounded-2xl bg-[#111118] border border-[#1e1e2e] overflow-hidden"
            >
              {/* Unit header */}
              <div className="px-6 py-4 flex items-center gap-3 border-b border-[#1e1e2e]">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                  style={{ background: `${course.color}20`, color: course.color }}
                >
                  {unit.unit_number}
                </span>
                <h2 className="font-display font-semibold text-sm text-[#e8e8f0]">{unit.name}</h2>
              </div>

              {/* Study tool buttons */}
              <div className="px-6 py-4 flex flex-wrap gap-2">
                <Link
                  href={`/course/${course.id}/unit/${unit.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1e2e] hover:bg-[#2a2a3a] text-[#e8e8f0] text-xs font-body font-medium transition-colors"
                >
                  📝 Notes
                </Link>
                <Link
                  href={`/course/${course.id}/unit/${unit.id}/flashcards`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1e2e] hover:bg-[#2a2a3a] text-[#e8e8f0] text-xs font-body font-medium transition-colors"
                >
                  🃏 Flashcards
                </Link>
                <Link
                  href={`/course/${course.id}/unit/${unit.id}/key-concepts`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1e2e] hover:bg-[#2a2a3a] text-[#e8e8f0] text-xs font-body font-medium transition-colors"
                >
                  🔑 Key Concepts
                </Link>
                <Link
                  href={`/course/${course.id}/unit/${unit.id}/quiz`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1e2e] hover:bg-[#2a2a3a] text-[#e8e8f0] text-xs font-body font-medium transition-colors"
                >
                  📋 Unit Exam
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
