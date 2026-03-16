import { redirect } from "next/navigation";
import Link from "next/link";
import { Course } from "@/types";
import LogoutButton from "@/components/LogoutButton";
import { getViewerContext } from "@/lib/viewer";
import { getCourseHref } from "@/lib/course";

export default async function DashboardPage() {
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/auth/login");

  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, name, emoji, color, accent")
    .order("name");

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <Link href="/" className="font-display font-bold text-lg tracking-tight">
          Everything<span className="text-[#6c63ff]">AP</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[#8888aa] text-sm font-body hidden sm:block">
            {isGuest ? "Guest mode" : user?.email}
          </span>
          <LogoutButton isGuest={isGuest} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {isGuest && (
          <div className="mb-8 rounded-2xl border border-[#6c63ff]/20 bg-[#6c63ff]/8 p-4">
            <p className="font-body text-sm text-[#d9d7ff]">
              You&apos;re browsing in guest mode. Course content loads from Supabase, but progress is not saved.
            </p>
          </div>
        )}
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">All AP Courses</h1>
          <p className="text-[#8888aa] font-body">
            {courses?.length ?? 0} courses · Select one to start studying
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses?.map((course: Course) => (
            <Link
              key={course.id}
              href={getCourseHref(course)}
              className="group relative p-5 rounded-2xl bg-[#111118] border border-[#1e1e2e] hover:border-[#2a2a3a] transition-all hover:-translate-y-0.5 hover:shadow-lg overflow-hidden"
            >
              {/* Color accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ background: course.color }}
              />
              {/* Glow */}
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-xl"
                style={{ background: course.color }}
              />

              <div className="relative">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3 font-mono font-bold"
                  style={{ background: `${course.color}20`, color: course.color }}
                >
                  {course.emoji}
                </div>
                <h2 className="font-display font-semibold text-sm text-[#e8e8f0] leading-tight group-hover:text-white transition-colors">
                  {course.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>

        {!courses?.length && (
          <div className="text-center py-20 text-[#8888aa] font-body">
            <div className="text-4xl mb-4">📚</div>
            <p>No courses found. Run the generator script to populate your database.</p>
          </div>
        )}
      </main>
    </div>
  );
}
