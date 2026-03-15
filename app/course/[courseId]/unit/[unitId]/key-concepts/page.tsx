import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { KeyConcept } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  vocabulary: "#6c63ff", formula: "#0891b2", person: "#be185d",
  event: "#dc2626", process: "#16a34a", theory: "#b45309", law: "#7c3aed",
};

export default async function KeyConceptsPage({
  params,
}: {
  params: { courseId: string; unitId: string };
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: unit } = await supabase
    .from("units")
    .select("id, name, unit_number, course_id, key_concepts")
    .eq("id", params.unitId)
    .single();

  if (!unit || unit.course_id !== params.courseId) notFound();

  const concepts: KeyConcept[] = unit.key_concepts ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <Link href={`/course/${params.courseId}/unit/${params.unitId}`}
          className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">
          ← {unit.name}
        </Link>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-[#8888aa] text-xs font-body font-medium uppercase tracking-widest mb-2">Key Concepts</div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{unit.name}</h1>
          <p className="text-[#8888aa] font-body text-sm mt-1">{concepts.length} terms</p>
        </div>

        {concepts.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {concepts.map((c, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#111118] border border-[#1e1e2e] hover:border-[#2a2a3a] transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display font-semibold text-sm text-[#e8e8f0]">{c.term}</h3>
                  <span
                    className="flex-shrink-0 text-xs font-body font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: `${CATEGORY_COLORS[c.category] ?? "#6c63ff"}20`,
                      color: CATEGORY_COLORS[c.category] ?? "#6c63ff"
                    }}
                  >
                    {c.category}
                  </span>
                </div>
                <p className="text-[#8888aa] text-xs font-body leading-relaxed mb-2">{c.definition}</p>
                {c.example && (
                  <p className="text-xs font-body text-[#6c6c8a] italic border-t border-[#1e1e2e] pt-2 mt-2">
                    Example: {c.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[#8888aa] font-body">
            <div className="text-3xl mb-3">⏳</div>
            <p>Key concepts are being generated. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
