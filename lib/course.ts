export async function getCourseByIdentifier(
  supabase: any,
  identifier: string,
  columns: string
) {
  const slugResult = await supabase
    .from("courses")
    .select(columns)
    .eq("slug", identifier)
    .maybeSingle();

  if (slugResult.data || slugResult.error) {
    return slugResult;
  }

  return supabase
    .from("courses")
    .select(columns)
    .eq("id", identifier)
    .maybeSingle();
}

export function getCourseHref(course: { id: string; slug?: string | null }) {
  return `/course/${course.slug ?? course.id}`;
}
