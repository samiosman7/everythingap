import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { KeyConcept } from "@/types";
import StudySessionTracker from "@/components/StudySessionTracker";
import { UnitWorkspacePanel } from "@/components/student/StudyWorkspacePanels";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

const CATEGORY_COLORS: Record<string, string> = {
  vocabulary: "var(--accent)",
  formula: "#2e9fb3",
  person: "#c7647f",
  event: "#cd6f5a",
  process: "#6fb087",
  theory: "#c59a54",
  law: "#8c77cc",
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
          href={`${courseHref}/unit/${unitId}/key-concepts`}
          label={`${course.name} · ${unit.name} key concepts`}
          kind="key-concepts"
        />

        <div className="app-panel mb-8 p-6 md:p-8">
          <div className="mb-2 app-kicker">Key concepts</div>
          <h1 className="font-display text-2xl font-bold md:text-4xl">{unit.name}</h1>
          <p className="mt-2 text-sm app-copy">{concepts.length} terms</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
          {concepts.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {concepts.map((c, i) => (
                <div key={i} className="app-card p-5 transition-all hover:-translate-y-0.5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold">{c.term}</h3>
                    <span
                      className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        background: `color-mix(in srgb, ${CATEGORY_COLORS[c.category] ?? "var(--accent)"} 18%, transparent)`,
                        color: CATEGORY_COLORS[c.category] ?? "var(--accent)",
                      }}
                    >
                      {c.category}
                    </span>
                  </div>
                  <p className="mb-2 text-xs leading-relaxed app-copy">{c.definition}</p>
                  {c.example && (
                    <p className="mt-2 border-t pt-2 text-xs italic" style={{ borderColor: "var(--line)", color: "var(--text-muted)" }}>
                      Example: {c.example}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="app-panel py-16 text-center">
              <div className="mb-3 text-3xl font-display font-bold">Soon</div>
              <p className="app-copy">Key concepts are being generated. Check back soon.</p>
            </div>
          )}

          <div className="space-y-6">
            <UnitWorkspacePanel
              unitId={String(unit.id)}
              meta={{
                courseId: course.id,
                unitId: String(unit.id),
                href: `${courseHref}/unit/${unit.id}/key-concepts`,
                label: `${course.name} · ${unit.name} key concepts`,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
