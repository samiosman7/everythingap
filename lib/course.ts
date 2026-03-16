export async function getCourseByIdentifier(
  supabase: any,
  identifier: string,
  columns: string
) {
  return supabase
    .from("courses")
    .select(columns)
    .or(`slug.eq.${identifier},id.eq.${identifier}`)
    .single();
}

export function getCourseHref(course: { id: string; slug?: string | null }) {
  return `/course/${course.slug ?? course.id}`;
}
