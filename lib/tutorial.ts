export const SETUP_TUTORIAL_KEY = "everythingap_setup_tutorial_v1";

export type TutorialTargets = {
  courseName: string;
  unitName: string;
  chapterName: string;
  courseHref: string;
  unitHref: string;
  chapterNotesHref: string;
  chapterQuizHref: string;
  flashcardsHref: string;
  keyConceptsHref: string;
  unitExamHref: string;
  fullExamHref?: string | null;
};

export type TutorialState = {
  active: boolean;
  stepIndex: number;
  startedAt: string;
  targets?: TutorialTargets;
};

export type TutorialStep = {
  id: string;
  href: string;
  title: string;
  description: string;
  ctaLabel: string;
};

export function readTutorialState(): TutorialState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SETUP_TUTORIAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TutorialState;
  } catch {
    return null;
  }
}

export function saveTutorialState(state: TutorialState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETUP_TUTORIAL_KEY, JSON.stringify(state));
}

export function clearTutorialState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SETUP_TUTORIAL_KEY);
}

export function createTutorialState(targets?: TutorialTargets): TutorialState {
  return {
    active: true,
    stepIndex: 0,
    startedAt: new Date().toISOString(),
    targets,
  };
}

export function getTutorialSteps(targets?: TutorialTargets): TutorialStep[] {
  const baseSteps: TutorialStep[] = [
    {
      id: "pick-course",
      href: "/onboarding?tutorial=1",
      title: "Pick at least one AP course",
      description:
        "Choose the class you actually need right now. Once you save it, the tutorial will walk you through the real study flow inside that course.",
      ctaLabel: "Okay, I’ll pick one",
    },
  ];

  if (!targets) return baseSteps;

  const walkthrough: TutorialStep[] = [
    {
      id: "chapter-notes",
      href: targets.chapterNotesHref,
      title: `These are your chapter notes for ${targets.chapterName}`,
      description:
        "This is where students relearn the lesson fast. Chapter notes are the first stop when something feels fuzzy before you move into practice.",
      ctaLabel: "Next: chapter quiz",
    },
    {
      id: "chapter-quiz",
      href: targets.chapterQuizHref,
      title: "Now test that chapter immediately",
      description:
        "Chapter quizzes are the quick comprehension check. They tell you whether the notes actually clicked before you keep moving.",
      ctaLabel: "Next: flashcards",
    },
    {
      id: "flashcards",
      href: targets.flashcardsHref,
      title: `Here are your ${targets.unitName} flashcards`,
      description:
        "Flashcards are for reinforcement and speed. This is the fastest way to tighten vocabulary, formulas, and details after reading.",
      ctaLabel: "Next: key concepts",
    },
    {
      id: "key-concepts",
      href: targets.keyConceptsHref,
      title: "Key concepts pull the unit into one reference sheet",
      description:
        "Use this page when you want the must-know ideas without rereading everything. It is the cleaner cram view for the unit.",
      ctaLabel: "Next: unit exam",
    },
    {
      id: "unit-exam",
      href: targets.unitExamHref,
      title: "Unit exams are where practice starts feeling real",
      description:
        "This is the bigger checkpoint: multiple choice plus FRQs when they exist, all organized around one unit instead of the whole course.",
      ctaLabel: targets.fullExamHref ? "Next: full AP mock" : "Finish tutorial",
    },
  ];

  if (targets.fullExamHref) {
    walkthrough.push({
      id: "full-exam",
      href: targets.fullExamHref,
      title: `And this is the full AP mock exam for ${targets.courseName}`,
      description:
        "When students want a real pressure test, this is the closest full-course practice loop in the app.",
      ctaLabel: "Finish tutorial",
    });
  }

  return [...baseSteps, ...walkthrough];
}

export function getNextTutorialHref(state: TutorialState | null): string | null {
  if (!state?.active) return null;
  const steps = getTutorialSteps(state.targets);
  const nextStep = steps[state.stepIndex + 1];
  return nextStep?.href ?? null;
}

export async function buildTutorialTargets(supabase: any, selectedCourseIds: string[]): Promise<TutorialTargets | null> {
  if (!selectedCourseIds.length) return null;

  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, name, full_exam")
    .in("id", selectedCourseIds);

  if (!courses?.length) return null;

  const orderedCourses = selectedCourseIds
    .map(courseId => courses.find((course: any) => course.id === courseId))
    .filter(Boolean) as Array<{ id: string; slug?: string | null; name: string; full_exam?: unknown }>;

  const course = orderedCourses[0];
  const courseHref = `/course/${course.slug ?? course.id}`;

  const { data: units } = await supabase
    .from("units")
    .select("id, name, unit_number, key_concepts, unit_exam")
    .eq("course_id", course.id)
    .order("unit_number");

  if (!units?.length) return null;

  const unitIds = units.map((unit: any) => unit.id);
  const [{ data: chapters }, { data: flashcards }] = await Promise.all([
    supabase
      .from("chapters")
      .select("id, unit_id, chapter_number, name, notes, quiz")
      .in("unit_id", unitIds)
      .order("chapter_number"),
    supabase
      .from("flashcards")
      .select("id, unit_id")
      .in("unit_id", unitIds),
  ]);

  const unitWithContent =
    units
      .map((unit: any) => {
        const unitChapters = (chapters ?? []).filter((chapter: any) => chapter.unit_id === unit.id);
        const flashcardCount = (flashcards ?? []).filter((card: any) => card.unit_id === unit.id).length;
        const chapterWithNotesAndQuiz = unitChapters.find(
          (chapter: any) =>
            typeof chapter.notes === "string" &&
            chapter.notes.trim().length > 0 &&
            Array.isArray(chapter.quiz) &&
            chapter.quiz.length > 0
        );

        const score =
          (chapterWithNotesAndQuiz ? 5 : 0) +
          (flashcardCount > 0 ? 2 : 0) +
          (Array.isArray(unit.key_concepts) && unit.key_concepts.length > 0 ? 2 : 0) +
          ((unit.unit_exam?.multiple_choice?.length ?? 0) > 0 || (unit.unit_exam?.free_response?.length ?? 0) > 0 ? 2 : 0);

        return { unit, unitChapters, chapterWithNotesAndQuiz, score };
      })
      .sort((a: any, b: any) => b.score - a.score)[0] ?? null;

  if (!unitWithContent) return null;

  const unit = unitWithContent.unit;
  const chapter =
    unitWithContent.chapterWithNotesAndQuiz ??
    unitWithContent.unitChapters.find((item: any) => typeof item.notes === "string" && item.notes.trim().length > 0) ??
    unitWithContent.unitChapters[0];

  if (!chapter) return null;

  const unitHref = `${courseHref}/unit/${unit.id}`;

  return {
    courseName: course.name,
    unitName: unit.name,
    chapterName: chapter.name,
    courseHref,
    unitHref,
    chapterNotesHref: `${unitHref}/chapter/${chapter.id}`,
    chapterQuizHref: `${unitHref}/chapter/${chapter.id}/quiz`,
    flashcardsHref: `${unitHref}/flashcards`,
    keyConceptsHref: `${unitHref}/key-concepts`,
    unitExamHref: `${unitHref}/quiz`,
    fullExamHref: course.full_exam ? `${courseHref}/exam` : null,
  };
}
