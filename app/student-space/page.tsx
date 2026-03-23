import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getViewerContext } from "@/lib/viewer";
import StudentSpaceClient from "@/components/student/StudentSpaceClient";

export default async function StudentSpacePage({
  searchParams,
}: {
  searchParams: Promise<{
    focus?: string;
    courseId?: string;
    unitId?: string;
    chapterId?: string;
    courseName?: string;
    unitName?: string;
    chapterName?: string;
    href?: string;
  }>;
}) {
  const { supabase, userId, isGuest } = await getViewerContext();
  if (!userId && !isGuest) redirect("/sign-in");
  const params = await searchParams;

  const [clerkUser, coursesResult] = await Promise.all([
    isGuest ? Promise.resolve(null) : currentUser(),
    supabase.from("courses").select("id, slug, name, emoji, color, accent").order("name"),
  ]);

  return (
    <StudentSpaceClient
      courses={coursesResult.data ?? []}
      emailLabel={isGuest ? "Guest mode" : clerkUser?.primaryEmailAddress?.emailAddress ?? "Signed in"}
      isGuest={isGuest}
      focus={params.focus === "chapter" || params.focus === "unit" ? params.focus : null}
      focusMeta={{
        courseId: params.courseId,
        unitId: params.unitId,
        chapterId: params.chapterId,
        courseName: params.courseName,
        unitName: params.unitName,
        chapterName: params.chapterName,
        href: params.href,
      }}
    />
  );
}
