import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

export const SELECTED_COURSES_KEY = "everythingap_selected_courses";

function isGuestModeActive() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some(cookie => cookie === `${GUEST_COOKIE_NAME}=1`);
}

export function readSelectedCourseIds() {
  if (typeof window === "undefined") return [];
  if (isGuestModeActive()) return [];

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
  if (isGuestModeActive()) {
    window.localStorage.removeItem(SELECTED_COURSES_KEY);
    return;
  }
  window.localStorage.setItem(SELECTED_COURSES_KEY, JSON.stringify(courseIds));
}
