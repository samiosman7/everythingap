export const SELECTED_COURSES_KEY = "everythingap_selected_courses";

export function readSelectedCourseIds() {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(SELECTED_COURSES_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function saveSelectedCourseIds(courseIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_COURSES_KEY, JSON.stringify(courseIds));
}
