export const STUDY_PROGRESS_KEY = "everythingap_study_progress_v1";

export type StudyLocationKind =
  | "chapter"
  | "chapter-quiz"
  | "flashcards"
  | "key-concepts"
  | "unit-exam"
  | "full-exam";

export interface ResumeLocation {
  courseId: string;
  unitId?: string;
  chapterId?: string;
  href: string;
  label: string;
  kind: StudyLocationKind;
  timestamp: number;
}

export interface UnitProgressState {
  viewedChapterIds: string[];
  completedQuizChapterIds: string[];
  openedTools: {
    flashcards?: boolean;
    keyConcepts?: boolean;
    unitExam?: boolean;
  };
}

export interface CourseProgressState {
  units: Record<string, UnitProgressState>;
  fullExamOpened?: boolean;
}

export interface StudyProgressState {
  lastVisited: ResumeLocation | null;
  courses: Record<string, CourseProgressState>;
}

export type CourseProgressSummaryInput = {
  id: string;
  chapterCount: number;
};

const DEFAULT_STATE: StudyProgressState = {
  lastVisited: null,
  courses: {},
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readStudyProgress(): StudyProgressState {
  if (!canUseStorage()) return DEFAULT_STATE;

  try {
    const raw = window.localStorage.getItem(STUDY_PROGRESS_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as StudyProgressState;
    if (!parsed || typeof parsed !== "object") return DEFAULT_STATE;

    return {
      lastVisited: parsed.lastVisited ?? null,
      courses: parsed.courses ?? {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveStudyProgress(state: StudyProgressState) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify(state));
}

export function mergeStudyProgress(remote: StudyProgressState, local: StudyProgressState) {
  const merged: StudyProgressState = {
    lastVisited:
      !remote.lastVisited || (local.lastVisited?.timestamp ?? 0) > (remote.lastVisited?.timestamp ?? 0)
        ? local.lastVisited
        : remote.lastVisited,
    courses: { ...remote.courses },
  };

  for (const [courseId, localCourse] of Object.entries(local.courses)) {
    const remoteCourse = merged.courses[courseId] ?? { units: {} };
    merged.courses[courseId] = {
      fullExamOpened: remoteCourse.fullExamOpened || localCourse.fullExamOpened,
      units: { ...remoteCourse.units },
    };

    for (const [unitId, localUnit] of Object.entries(localCourse.units)) {
      const remoteUnit = merged.courses[courseId].units[unitId];
      merged.courses[courseId].units[unitId] = {
        viewedChapterIds: Array.from(new Set([...(remoteUnit?.viewedChapterIds ?? []), ...localUnit.viewedChapterIds])),
        completedQuizChapterIds: Array.from(
          new Set([...(remoteUnit?.completedQuizChapterIds ?? []), ...localUnit.completedQuizChapterIds])
        ),
        openedTools: {
          flashcards: remoteUnit?.openedTools.flashcards || localUnit.openedTools.flashcards,
          keyConcepts: remoteUnit?.openedTools.keyConcepts || localUnit.openedTools.keyConcepts,
          unitExam: remoteUnit?.openedTools.unitExam || localUnit.openedTools.unitExam,
        },
      };
    }
  }

  return merged;
}

function getOrCreateCourse(state: StudyProgressState, courseId: string) {
  state.courses[courseId] ??= { units: {} };
  return state.courses[courseId];
}

function getOrCreateUnit(course: CourseProgressState, unitId: string) {
  course.units[unitId] ??= {
    viewedChapterIds: [],
    completedQuizChapterIds: [],
    openedTools: {},
  };
  return course.units[unitId];
}

export function trackStudyEvent(event: {
  courseId: string;
  unitId?: string;
  chapterId?: string;
  href: string;
  label: string;
  kind: StudyLocationKind;
}) {
  const state = readStudyProgress();
  const course = getOrCreateCourse(state, event.courseId);

  if (event.unitId) {
    const unit = getOrCreateUnit(course, event.unitId);

    if (event.kind === "chapter" && event.chapterId && !unit.viewedChapterIds.includes(event.chapterId)) {
      unit.viewedChapterIds.push(event.chapterId);
    }

    if (event.kind === "chapter-quiz" && event.chapterId && !unit.completedQuizChapterIds.includes(event.chapterId)) {
      unit.completedQuizChapterIds.push(event.chapterId);
    }

    if (event.kind === "flashcards") unit.openedTools.flashcards = true;
    if (event.kind === "key-concepts") unit.openedTools.keyConcepts = true;
    if (event.kind === "unit-exam") unit.openedTools.unitExam = true;
  }

  if (event.kind === "full-exam") {
    course.fullExamOpened = true;
  }

  state.lastVisited = {
    courseId: event.courseId,
    unitId: event.unitId,
    chapterId: event.chapterId,
    href: event.href,
    label: event.label,
    kind: event.kind,
    timestamp: Date.now(),
  };

  saveStudyProgress(state);
  return state;
}

export function getUnitProgress(courseId: string, unitId: string, chapterCount: number) {
  const state = readStudyProgress();
  const unit = state.courses[courseId]?.units?.[unitId];

  const viewedCount = unit?.viewedChapterIds.length ?? 0;
  const completedQuizCount = unit?.completedQuizChapterIds.length ?? 0;
  const openedToolCount =
    Number(Boolean(unit?.openedTools.flashcards)) +
    Number(Boolean(unit?.openedTools.keyConcepts)) +
    Number(Boolean(unit?.openedTools.unitExam));

  const totalItems = chapterCount + 3;
  const completedItems = viewedCount + openedToolCount;

  return {
    viewedCount,
    completedQuizCount,
    openedToolCount,
    totalItems,
    completedItems,
    percent: totalItems > 0 ? Math.min(100, Math.round((completedItems / totalItems) * 100)) : 0,
  };
}

export function hasViewedChapter(courseId: string, unitId: string, chapterId: string) {
  const state = readStudyProgress();
  const unit = state.courses[courseId]?.units?.[unitId];
  return Boolean(unit?.viewedChapterIds.includes(chapterId));
}

export function getCourseProgress(courseId: string, units: CourseProgressSummaryInput[]) {
  const state = readStudyProgress();
  const course = state.courses[courseId];

  const totals = units.reduce(
    (acc, unit) => {
      const summary = getUnitProgress(courseId, unit.id, unit.chapterCount);
      acc.totalItems += summary.totalItems;
      acc.completedItems += summary.completedItems;
      acc.viewedChapterCount += summary.viewedCount;
      return acc;
    },
    { totalItems: 0, completedItems: 0, viewedChapterCount: 0 }
  );

  const percent = totals.totalItems > 0 ? Math.min(100, Math.round((totals.completedItems / totals.totalItems) * 100)) : 0;

  return {
    percent,
    totalItems: totals.totalItems,
    completedItems: totals.completedItems,
    viewedChapterCount: totals.viewedChapterCount,
    fullExamOpened: Boolean(course?.fullExamOpened),
  };
}

export function getLastVisited() {
  return readStudyProgress().lastVisited;
}

export async function fetchRemoteStudyProgress() {
  const response = await fetch("/api/study-progress", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load synced study progress.");
  }

  const payload = (await response.json()) as { progress: StudyProgressState | null };
  return payload.progress ?? DEFAULT_STATE;
}

export async function pushRemoteStudyProgress(progress: StudyProgressState) {
  const response = await fetch("/api/study-progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ progress }),
  });

  if (!response.ok) {
    throw new Error("Failed to save synced study progress.");
  }
}

export async function syncStudyProgressFromAccount() {
  const local = readStudyProgress();

  try {
    const remote = await fetchRemoteStudyProgress();
    const merged = mergeStudyProgress(remote, local);
    saveStudyProgress(merged);
    await pushRemoteStudyProgress(merged);
    return merged;
  } catch {
    return local;
  }
}
