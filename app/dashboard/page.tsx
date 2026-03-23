import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getViewerContext } from "@/lib/viewer";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const { supabase, userId, isGuest } = await getViewerContext();
  if (!userId && !isGuest) redirect("/sign-in");

  const [clerkUser, coursesResult, unitsResult, chaptersResult] = await Promise.all([
    isGuest ? Promise.resolve(null) : currentUser(),
    supabase.from("courses").select("id, slug, name, emoji, color, accent").order("name"),
    supabase.from("units").select("id, course_id"),
    supabase.from("chapters").select("id, unit_id"),
  ]);

  const units = unitsResult.data ?? [];
  const chapters = chaptersResult.data ?? [];

  const courses = (coursesResult.data ?? []).map(course => {
    const courseUnits = units.filter(unit => unit.course_id === course.id);

    return {
      ...course,
      units: courseUnits.map(unit => ({
        id: String(unit.id),
        chapterCount: chapters.filter(chapter => chapter.unit_id === unit.id).length,
      })),
    };
  });

  return (
    <div className="min-h-screen">
      {isGuest && (
        <div className="border-b px-4 py-3 sm:px-6" style={{ borderColor: "var(--line)", background: "var(--accent-soft)" }}>
          <p className="text-sm" style={{ color: "var(--text)" }}>
            You&apos;re browsing in guest mode. Content is fully available, but synced progress only saves when you use an account.
          </p>
        </div>
      )}

      <DashboardClient
        courses={courses}
        emailLabel={isGuest ? "Guest mode" : clerkUser?.primaryEmailAddress?.emailAddress ?? "Signed in"}
        isGuest={isGuest}
      />

      {!courses.length && (
        <div className="app-page text-center">
          <div className="app-panel px-6 py-16">
            <div className="mb-4 text-4xl">AP</div>
            <p className="app-copy">No courses found yet. Populate the database and they&apos;ll appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
