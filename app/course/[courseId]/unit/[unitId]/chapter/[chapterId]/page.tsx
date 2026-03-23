import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, NotebookPen } from "lucide-react";
import NotesRenderer from "@/components/NotesRenderer";
import StudySessionTracker from "@/components/StudySessionTracker";
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

  const { data: course } = await getCourseByIdentifier(supabase, courseId, "id, slug, name, color");
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
    <div className="min-h-screen">
      <nav
        className="sticky top-0 z-50 flex flex-wrap items-center gap-2 border-b px-6 py-4 backdrop-blur-md"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg-elevated) 86%, transparent)" }}
      >
        <Link href={courseHref} className="text-sm app-muted transition-colors hover:text-white">
          {course.name}
        </Link>
        <span className="app-muted">/</span>
        <Link href={`${courseHref}/unit/${unitId}`} className="text-sm app-muted transition-colors hover:text-white">
          {unit.name}
        </Link>
        <span className="app-muted">/</span>
        <span className="max-w-[240px] truncate text-sm font-medium">{chapter.name}</span>
      </nav>

      <main className="app-page">
        <StudySessionTracker
          courseId={course.id}
          unitId={String(unit.id)}
          chapterId={String(chapter.id)}
          href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}`}
          label={`${course.name} · Unit ${unit.unit_number} · Chapter ${chapter.chapter_number}`}
          kind="chapter"
        />

        <div className="app-panel mb-8 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-widest app-muted">
                Unit {unit.unit_number} · Chapter {chapter.chapter_number}
              </div>
              <h1 className="font-display text-2xl font-bold md:text-4xl">{chapter.name}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              {chapter.quiz && (
                <Link href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}/quiz`} className="app-secondary-button px-4 py-2 text-sm font-medium">
                  Take quiz
                </Link>
              )}
              <Link
                href={`/student-space?focus=chapter&courseId=${encodeURIComponent(course.id)}&unitId=${encodeURIComponent(
                  String(unit.id)
                )}&chapterId=${encodeURIComponent(String(chapter.id))}&courseName=${encodeURIComponent(course.name)}&unitName=${encodeURIComponent(
                  unit.name
                )}&chapterName=${encodeURIComponent(chapter.name)}&href=${encodeURIComponent(
                  `${courseHref}/unit/${unitId}/chapter/${chapter.id}`
                )}`}
                className="app-primary-button inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <NotebookPen className="h-4 w-4" />
                Chapter reflection
              </Link>
            </div>
          </div>
        </div>

        {chapter.notes ? (
          <div className="app-panel p-6 md:p-8">
            <div className="max-w-5xl">
              <NotesRenderer notes={chapter.notes} />
            </div>
          </div>
        ) : (
          <div className="app-panel py-16 text-center">
            <div className="mb-3 text-3xl font-display font-bold">Soon</div>
            <p className="app-copy">Notes are being generated. Check back soon.</p>
          </div>
        )}

        <div className="app-divider mt-10 flex items-center justify-between gap-4 border-t pt-8">
          {prev ? (
            <Link href={`${courseHref}/unit/${unitId}/chapter/${prev.id}`} className="app-secondary-button group flex max-w-[45%] items-center gap-2 px-4 py-3 text-sm">
              <span className="app-muted transition-colors group-hover:text-white">Prev</span>
              <span className="truncate app-muted transition-colors group-hover:text-white">{prev.name}</span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link href={`${courseHref}/unit/${unitId}/chapter/${next.id}`} className="app-secondary-button group ml-auto flex max-w-[45%] items-center gap-2 px-4 py-3 text-sm">
              <span className="truncate app-muted transition-colors group-hover:text-white">{next.name}</span>
              <span className="app-muted transition-colors group-hover:text-white">Next</span>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href={`/student-space?focus=chapter&courseId=${encodeURIComponent(course.id)}&unitId=${encodeURIComponent(
              String(unit.id)
            )}&chapterId=${encodeURIComponent(String(chapter.id))}&courseName=${encodeURIComponent(course.name)}&unitName=${encodeURIComponent(
              unit.name
            )}&chapterName=${encodeURIComponent(chapter.name)}&href=${encodeURIComponent(
              `${courseHref}/unit/${unitId}/chapter/${chapter.id}`
            )}`}
            className="app-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold"
          >
            Leave a chapter reflection
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
