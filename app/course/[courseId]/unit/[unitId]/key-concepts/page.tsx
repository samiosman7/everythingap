import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { KeyConcept } from "@/types";
import StudySessionTracker from "@/components/StudySessionTracker";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

const CATEGORY_COLORS: Record<string, string> = {
  vocabulary: "#6c63ff",
  formula: "#0891b2",
  person: "#be185d",
  event: "#dc2626",
  process: "#16a34a",
  theory: "#b45309",
  law: "#7c3aed",
};

export default async function KeyConceptsPage({
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
    "id, slug, name"
  );
  if (!course) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, name, unit_number, course_id, key_concepts")
    .eq("id", unitId)
    .single();

  if (!unit || unit.course_id !== course.id) notFound();

  const concepts: KeyConcept[] = unit.key_concepts ?? [];
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
          href={`${courseHref}/unit/${unitId}/key-concepts`}
          label={`${course.name} · ${unit.name} key concepts`}
          kind="key-concepts"
        />

        <div className="mb-8 rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
          <div className="mb-2 text-xs font-body font-medium uppercase tracking-widest text-[#8888aa]">Key Concepts</div>
          <h1 className="font-display text-2xl font-bold md:text-4xl">{unit.name}</h1>
          <p className="mt-2 text-sm font-body text-[#8888aa]">{concepts.length} terms</p>
        </div>

        {concepts.length ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {concepts.map((c, i) => (
              <div key={i} className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-5 transition-all hover:border-[#2a2a3a]">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-display text-sm font-semibold text-[#e8e8f0]">{c.term}</h3>
                  <span
                    className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-body font-medium"
                    style={{
                      background: `${CATEGORY_COLORS[c.category] ?? "#6c63ff"}20`,
                      color: CATEGORY_COLORS[c.category] ?? "#6c63ff",
                    }}
                  >
                    {c.category}
                  </span>
                </div>
                <p className="mb-2 text-xs font-body leading-relaxed text-[#8888aa]">{c.definition}</p>
                {c.example && (
                  <p className="mt-2 border-t border-[#1e1e2e] pt-2 text-xs font-body italic text-[#6c6c8a]">
                    Example: {c.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] py-16 text-center font-body text-[#8888aa]">
            <div className="mb-3 text-3xl">Soon</div>
            <p>Key concepts are being generated. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
