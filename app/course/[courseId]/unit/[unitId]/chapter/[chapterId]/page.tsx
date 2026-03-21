import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import NotesRenderer from "@/components/NotesRenderer";
import StudySessionTracker from "@/components/StudySessionTracker";
import { ChapterWorkspacePanel } from "@/components/student/StudyWorkspacePanels";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ courseId: string; unitId: string; chapterId: string }>;
}) {
  const { courseId, unitId, chapterId } = await params;
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/sign-in");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    courseId,
    "id, slug, name, color"
  );
  if (!course) notFound();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("id, chapter_number, name, notes, quiz, unit_id")
    .eq("id", chapterId)
    .single();

  if (!chapter || chapter.unit_id !== parseInt(unitId, 10)) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, unit_number, name, course_id")
    .eq("id", unitId)
    .single();

  if (!unit || unit.course_id !== course.id) notFound();

  const { data: siblings } = await supabase
    .from("chapters")
    .select("id, chapter_number, name")
    .eq("unit_id", unitId)
    .order("chapter_number");

  const currentIdx = siblings?.findIndex(c => c.id === chapter.id) ?? -1;
  const prev = currentIdx > 0 ? siblings![currentIdx - 1] : null;
  const next = currentIdx < (siblings?.length ?? 0) - 1 ? siblings![currentIdx + 1] : null;
  const courseHref = getCourseHref(course);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex flex-wrap items-center gap-2 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 px-6 py-4 backdrop-blur-md">
        <Link
          href={courseHref}
          className="text-sm font-body text-[#8888aa] transition-colors hover:text-[#e8e8f0]"
        >
          {course.name}
        </Link>
        <span className="text-[#2a2a3a]">/</span>
        <Link
          href={`${courseHref}/unit/${unitId}`}
          className="text-sm font-body text-[#8888aa] transition-colors hover:text-[#e8e8f0]"
        >
          {unit.name}
        </Link>
        <span className="text-[#2a2a3a]">/</span>
        <span className="max-w-[240px] truncate text-sm font-body font-medium text-[#e8e8f0]">{chapter.name}</span>
      </nav>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <StudySessionTracker
          courseId={course.id}
          unitId={String(unit.id)}
          chapterId={String(chapter.id)}
          href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}`}
          label={`${course.name} · Unit ${unit.unit_number} · Chapter ${chapter.chapter_number}`}
          kind="chapter"
        />

        <div className="mb-8 rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 text-xs font-body font-medium uppercase tracking-widest text-[#8888aa]">
                Unit {unit.unit_number} · Chapter {chapter.chapter_number}
              </div>
              <h1 className="font-display text-2xl font-bold md:text-4xl">{chapter.name}</h1>
            </div>
            {chapter.quiz && (
              <Link
                href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}/quiz`}
                className="flex-shrink-0 rounded-xl border border-[#6c63ff]/30 bg-[#6c63ff]/10 px-4 py-2 text-sm font-body font-medium text-[#9d96ff] transition-all hover:bg-[#6c63ff]/20"
              >
                Take Quiz
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr,0.65fr]">
          {chapter.notes ? (
            <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
              <div className="max-w-5xl">
                <NotesRenderer notes={chapter.notes} />
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] py-16 text-center font-body text-[#8888aa]">
              <div className="mb-3 text-3xl">Soon</div>
              <p>Notes are being generated. Check back soon.</p>
            </div>
          )}

          <div className="space-y-6">
            <ChapterWorkspacePanel
              chapterId={String(chapter.id)}
              meta={{
                courseId: course.id,
                unitId: String(unit.id),
                chapterId: String(chapter.id),
                href: `${courseHref}/unit/${unitId}/chapter/${chapter.id}`,
                label: `${course.name} • ${chapter.name}`,
              }}
            />
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-[#1e1e2e] pt-8">
          {prev ? (
            <Link
              href={`${courseHref}/unit/${unitId}/chapter/${prev.id}`}
              className="group flex max-w-[45%] items-center gap-2 rounded-xl border border-[#1e1e2e] bg-[#111118] px-4 py-3 text-sm font-body transition-all hover:border-[#2a2a3a]"
            >
              <span className="text-[#8888aa] transition-colors group-hover:text-[#e8e8f0]">Prev</span>
              <span className="truncate text-[#8888aa] transition-colors group-hover:text-[#e8e8f0]">{prev.name}</span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`${courseHref}/unit/${unitId}/chapter/${next.id}`}
              className="group ml-auto flex max-w-[45%] items-center gap-2 rounded-xl border border-[#1e1e2e] bg-[#111118] px-4 py-3 text-sm font-body transition-all hover:border-[#2a2a3a]"
            >
              <span className="truncate text-[#8888aa] transition-colors group-hover:text-[#e8e8f0]">{next.name}</span>
              <span className="text-[#8888aa] transition-colors group-hover:text-[#e8e8f0]">Next</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  );
}
