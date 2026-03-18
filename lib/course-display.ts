import { Course } from "@/types";

const CATEGORY_RULES = [
  { label: "Math & Computing", matches: ["Calculus", "Precalculus", "Statistics", "Computer Science"] },
  { label: "Sciences", matches: ["Biology", "Chemistry", "Physics", "Environmental"] },
  { label: "History & Social Science", matches: ["History", "Government", "Politics", "Psychology", "Economics", "Human Geography", "African American Studies"] },
  { label: "English & Languages", matches: ["English", "Spanish", "French", "Latin", "Chinese", "German", "Italian", "Japanese"] },
  { label: "Arts & Music", matches: ["Art", "Drawing", "Music", "3-D"] },
  { label: "Research & Seminar", matches: ["Seminar", "Research"] },
];

export function getCourseCategory(name: string) {
  const found = CATEGORY_RULES.find(rule =>
    rule.matches.some(match => name.includes(match))
  );

  return found?.label ?? "More AP Courses";
}

export function getCourseBadge(name: string) {
  const cleanName = name.replace(/^AP\s+/i, "").trim();
  const words = cleanName
    .split(/[\s:&-]+/)
    .filter(Boolean)
    .slice(0, 2);

  return words.map(word => word[0]?.toUpperCase() ?? "").join("").slice(0, 3);
}

export function groupCoursesByCategory(courses: Course[]) {
  return courses.reduce<Record<string, Course[]>>((groups, course) => {
    const category = getCourseCategory(course.name);
    groups[category] ??= [];
    groups[category].push(course);
    return groups;
  }, {});
}
