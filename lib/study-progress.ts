import type { FRQGradeResult } from "@/types";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

export const STUDY_PROGRESS_KEY = "everythingap_study_progress_v2";

export type StudyLocationKind =
  | "chapter"
  | "chapter-quiz"
  | "flashcards"
  | "key-concepts"
  | "unit-exam"
  | "full-exam";

export type ConfidenceLabel = "not-ready" | "kind-of" | "confident";

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
  chapterQuizScores: Record<string, number[]>;
  unitExamScores: number[];
}

export interface CourseProgressState {
  units: Record<string, UnitProgressState>;
  fullExamOpened?: boolean;
  fullExamScores: number[];
}

export interface ConfidenceSnapshot {
  value: number;
  label: ConfidenceLabel;
  timestamp: number;
}

export interface WorkspaceMeta {
  courseId: string;
  unitId?: string;
  chapterId?: string;
  href: string;
  label: string;
  updatedAt: number;
  pinned?: boolean;
  tags?: string[];
}

export interface ChapterWorkspaceState extends WorkspaceMeta {
  notes: string;
  summary: string;
  teacherEmphasis: string;
  memoryAid: string;
  mistakeNote: string;
  reflection: string;
  tomorrowReview: string;
  teachFriend: string;
  confidence?: ConfidenceSnapshot;
  confidenceHistory: ConfidenceSnapshot[];
  quizConfidenceBefore?: ConfidenceSnapshot;
  quizConfidenceAfter?: ConfidenceSnapshot;
  quizReflection: string;
  quizMistakePatterns: string[];
  missedQuestionPrompts: string[];
  reviewLater: boolean;
  confused: boolean;
  likelyOnTest: boolean;
  understood: boolean;
  needHelp: boolean;
}

export interface UnitWorkspaceState extends WorkspaceMeta {
  stickyNote: string;
  reflection: string;
  tomorrowReview: string;
  teachFriend: string;
  confidence?: ConfidenceSnapshot;
  confidenceHistory: ConfidenceSnapshot[];
  quizConfidenceBefore?: ConfidenceSnapshot;
  quizConfidenceAfter?: ConfidenceSnapshot;
  quizReflection: string;
  quizMistakePatterns: string[];
  missedQuestionPrompts: string[];
  reviewLater: boolean;
  confused: boolean;
  likelyOnTest: boolean;
}

export interface FlashcardWorkspaceState extends WorkspaceMeta {
  notes: string;
  thingsToForget: string;
  reviewLater: boolean;
  practiceMore: boolean;
  memorize: boolean;
}

export interface FRQWorkspaceState extends WorkspaceMeta {
  draftAnswer: string;
  notes: string;
  missedRubric: string;
  improveNext: string;
  reflection: string;
  reviewLater: boolean;
  likelyOnTest: boolean;
  confused: boolean;
  confidenceBefore?: ConfidenceSnapshot;
  confidenceAfter?: ConfidenceSnapshot;
  feedbackHistory: FRQGradeResult[];
}

export interface StudentWorkspaceState {
  chapters: Record<string, ChapterWorkspaceState>;
  units: Record<string, UnitWorkspaceState>;
  flashcards: Record<string, FlashcardWorkspaceState>;
  frqs: Record<string, FRQWorkspaceState>;
}

export interface StudyProgressState {
  lastVisited: ResumeLocation | null;
  courses: Record<string, CourseProgressState>;
  workspace: StudentWorkspaceState;
}

export type CourseProgressSummaryInput = {
  id: string;
  chapterCount: number;
};

export interface LearningDashboardItem {
  id: string;
  label: string;
  href: string;
  detail: string;
  courseId: string;
  updatedAt: number;
}

const DEFAULT_STATE: StudyProgressState = {
  lastVisited: null,
  courses: {},
  workspace: {
    chapters: {},
    units: {},
    flashcards: {},
    frqs: {},
  },
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function isGuestModeActive() {
  if (!canUseStorage()) return false;
  return document.cookie.split("; ").some(cookie => cookie === `${GUEST_COOKIE_NAME}=1`);
}

function normalizeState(parsed: StudyProgressState | null | undefined): StudyProgressState {
  return {
    lastVisited: parsed?.lastVisited ?? null,
    courses: parsed?.courses ?? {},
    workspace: {
      chapters: parsed?.workspace?.chapters ?? {},
      units: parsed?.workspace?.units ?? {},
      flashcards: parsed?.workspace?.flashcards ?? {},
      frqs: parsed?.workspace?.frqs ?? {},
    },
  };
}

export function readStudyProgress(): StudyProgressState {
  if (!canUseStorage()) return DEFAULT_STATE;
  if (isGuestModeActive()) return DEFAULT_STATE;

  try {
    const raw = window.localStorage.getItem(STUDY_PROGRESS_KEY);
    if (!raw) return DEFAULT_STATE;
    return normalizeState(JSON.parse(raw) as StudyProgressState);
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveStudyProgress(state: StudyProgressState) {
  if (!canUseStorage()) return;
  if (isGuestModeActive()) {
    window.localStorage.removeItem(STUDY_PROGRESS_KEY);
    return;
  }
  window.localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify(state));
}

function mergeRecord<T>(remote: Record<string, T>, local: Record<string, T>, pick: (remoteValue: T, localValue: T) => T) {
  const merged: Record<string, T> = { ...remote };

  for (const [key, localValue] of Object.entries(local)) {
    const remoteValue = merged[key];
    merged[key] = remoteValue ? pick(remoteValue, localValue) : localValue;
  }

  return merged;
}

function newerWorkspace<T extends WorkspaceMeta>(remoteValue: T, localValue: T) {
  return (localValue.updatedAt ?? 0) > (remoteValue.updatedAt ?? 0) ? localValue : remoteValue;
}

function mergeUnitProgress(remoteUnit: UnitProgressState | undefined, localUnit: UnitProgressState): UnitProgressState {
  return {
    viewedChapterIds: Array.from(new Set([...(remoteUnit?.viewedChapterIds ?? []), ...localUnit.viewedChapterIds])),
    completedQuizChapterIds: Array.from(
      new Set([...(remoteUnit?.completedQuizChapterIds ?? []), ...localUnit.completedQuizChapterIds])
    ),
    openedTools: {
      flashcards: remoteUnit?.openedTools.flashcards || localUnit.openedTools.flashcards,
      keyConcepts: remoteUnit?.openedTools.keyConcepts || localUnit.openedTools.keyConcepts,
      unitExam: remoteUnit?.openedTools.unitExam || localUnit.openedTools.unitExam,
    },
    chapterQuizScores: {
      ...(remoteUnit?.chapterQuizScores ?? {}),
      ...Object.fromEntries(
        Object.entries(localUnit.chapterQuizScores).map(([chapterId, scores]) => [
          chapterId,
          [...(remoteUnit?.chapterQuizScores?.[chapterId] ?? []), ...scores].slice(-10),
        ])
      ),
    },
    unitExamScores: [...(remoteUnit?.unitExamScores ?? []), ...localUnit.unitExamScores].slice(-10),
  };
}

export function mergeStudyProgress(remote: StudyProgressState, local: StudyProgressState) {
  const mergedRemote = normalizeState(remote);
  const mergedLocal = normalizeState(local);

  const merged: StudyProgressState = {
    lastVisited:
      !mergedRemote.lastVisited || (mergedLocal.lastVisited?.timestamp ?? 0) > (mergedRemote.lastVisited?.timestamp ?? 0)
        ? mergedLocal.lastVisited
        : mergedRemote.lastVisited,
    courses: { ...mergedRemote.courses },
    workspace: {
      chapters: mergeRecord(mergedRemote.workspace.chapters, mergedLocal.workspace.chapters, newerWorkspace),
      units: mergeRecord(mergedRemote.workspace.units, mergedLocal.workspace.units, newerWorkspace),
      flashcards: mergeRecord(mergedRemote.workspace.flashcards, mergedLocal.workspace.flashcards, newerWorkspace),
      frqs: mergeRecord(mergedRemote.workspace.frqs, mergedLocal.workspace.frqs, newerWorkspace),
    },
  };

  for (const [courseId, localCourse] of Object.entries(mergedLocal.courses)) {
    const remoteCourse = merged.courses[courseId] ?? { units: {}, fullExamScores: [] };
    merged.courses[courseId] = {
      fullExamOpened: remoteCourse.fullExamOpened || localCourse.fullExamOpened,
      fullExamScores: [...(remoteCourse.fullExamScores ?? []), ...(localCourse.fullExamScores ?? [])].slice(-10),
      units: { ...remoteCourse.units },
    };

    for (const [unitId, localUnit] of Object.entries(localCourse.units)) {
      const remoteUnit = merged.courses[courseId].units[unitId];
      merged.courses[courseId].units[unitId] = mergeUnitProgress(remoteUnit, localUnit);
    }
  }

  return merged;
}

function getOrCreateCourse(state: StudyProgressState, courseId: string) {
  state.courses[courseId] ??= { units: {}, fullExamScores: [] };
  return state.courses[courseId];
}

function getOrCreateUnit(course: CourseProgressState, unitId: string) {
  course.units[unitId] ??= {
    viewedChapterIds: [],
    completedQuizChapterIds: [],
    openedTools: {},
    chapterQuizScores: {},
    unitExamScores: [],
  };
  return course.units[unitId];
}

export function confidenceLabelFromValue(value: number): ConfidenceLabel {
  if (value >= 75) return "confident";
  if (value >= 40) return "kind-of";
  return "not-ready";
}

export function confidenceLabelText(label: ConfidenceLabel) {
  if (label === "confident") return "I know this well";
  if (label === "kind-of") return "Kind of know it";
  return "Do not know it yet";
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

export function recordQuizResult(input: {
  courseId: string;
  unitId?: string;
  chapterId?: string;
  correct: number;
  total: number;
  kind: "chapter-quiz" | "unit-exam" | "full-exam";
}) {
  const state = readStudyProgress();
  const course = getOrCreateCourse(state, input.courseId);
  const percent = input.total > 0 ? Math.round((input.correct / input.total) * 100) : 0;

  if (input.kind === "full-exam") {
    course.fullExamScores = [...course.fullExamScores, percent].slice(-10);
  }

  if (input.unitId) {
    const unit = getOrCreateUnit(course, input.unitId);
    if (input.kind === "chapter-quiz" && input.chapterId) {
      unit.chapterQuizScores[input.chapterId] = [...(unit.chapterQuizScores[input.chapterId] ?? []), percent].slice(-10);
      if (!unit.completedQuizChapterIds.includes(input.chapterId)) {
        unit.completedQuizChapterIds.push(input.chapterId);
      }
    }

    if (input.kind === "unit-exam") {
      unit.unitExamScores = [...unit.unitExamScores, percent].slice(-10);
      unit.openedTools.unitExam = true;
    }
  }

  saveStudyProgress(state);
  return state;
}

function updateState(mutator: (state: StudyProgressState) => void) {
  const state = readStudyProgress();
  mutator(state);
  saveStudyProgress(state);
  return state;
}

function createConfidence(value: number): ConfidenceSnapshot {
  return {
    value,
    label: confidenceLabelFromValue(value),
    timestamp: Date.now(),
  };
}

function defaultChapterWorkspace(input: WorkspaceMeta): ChapterWorkspaceState {
  return {
    ...input,
    notes: "",
    summary: "",
    teacherEmphasis: "",
    memoryAid: "",
    mistakeNote: "",
    reflection: "",
    tomorrowReview: "",
    teachFriend: "",
    confidenceHistory: [],
    quizReflection: "",
    quizMistakePatterns: [],
    missedQuestionPrompts: [],
    reviewLater: false,
    confused: false,
    likelyOnTest: false,
    understood: false,
    needHelp: false,
  };
}

function defaultUnitWorkspace(input: WorkspaceMeta): UnitWorkspaceState {
  return {
    ...input,
    stickyNote: "",
    reflection: "",
    tomorrowReview: "",
    teachFriend: "",
    confidenceHistory: [],
    quizReflection: "",
    quizMistakePatterns: [],
    missedQuestionPrompts: [],
    reviewLater: false,
    confused: false,
    likelyOnTest: false,
  };
}

function defaultFlashcardWorkspace(input: WorkspaceMeta): FlashcardWorkspaceState {
  return {
    ...input,
    notes: "",
    thingsToForget: "",
    reviewLater: false,
    practiceMore: false,
    memorize: false,
  };
}

function defaultFrqWorkspace(input: WorkspaceMeta): FRQWorkspaceState {
  return {
    ...input,
    draftAnswer: "",
    notes: "",
    missedRubric: "",
    improveNext: "",
    reflection: "",
    reviewLater: false,
    likelyOnTest: false,
    confused: false,
    feedbackHistory: [],
  };
}

export function getChapterWorkspace(chapterId: string) {
  return readStudyProgress().workspace.chapters[chapterId] ?? null;
}

export function saveChapterWorkspace(
  chapterId: string,
  meta: Omit<WorkspaceMeta, "updatedAt">,
  patch: Partial<Omit<ChapterWorkspaceState, keyof WorkspaceMeta | "confidence" | "confidenceHistory">> & {
    confidenceValue?: number;
    quizConfidenceBeforeValue?: number;
    quizConfidenceAfterValue?: number;
  }
) {
  return updateState(state => {
    const current = state.workspace.chapters[chapterId] ?? defaultChapterWorkspace({ ...meta, updatedAt: Date.now() });
    const next: ChapterWorkspaceState = {
      ...current,
      ...meta,
      ...patch,
      updatedAt: Date.now(),
    };

    if (typeof patch.confidenceValue === "number") {
      const confidence = createConfidence(patch.confidenceValue);
      next.confidence = confidence;
      next.confidenceHistory = [...current.confidenceHistory.filter(item => item.value !== confidence.value), confidence].slice(-12);
    }

    if (typeof patch.quizConfidenceBeforeValue === "number") {
      next.quizConfidenceBefore = createConfidence(patch.quizConfidenceBeforeValue);
    }

    if (typeof patch.quizConfidenceAfterValue === "number") {
      next.quizConfidenceAfter = createConfidence(patch.quizConfidenceAfterValue);
    }

    state.workspace.chapters[chapterId] = next;
  });
}

export function getUnitWorkspace(unitId: string) {
  return readStudyProgress().workspace.units[unitId] ?? null;
}

export function saveUnitWorkspace(
  unitId: string,
  meta: Omit<WorkspaceMeta, "updatedAt">,
  patch: Partial<Omit<UnitWorkspaceState, keyof WorkspaceMeta | "confidence" | "confidenceHistory">> & {
    confidenceValue?: number;
    quizConfidenceBeforeValue?: number;
    quizConfidenceAfterValue?: number;
  }
) {
  return updateState(state => {
    const current = state.workspace.units[unitId] ?? defaultUnitWorkspace({ ...meta, updatedAt: Date.now() });
    const next: UnitWorkspaceState = {
      ...current,
      ...meta,
      ...patch,
      updatedAt: Date.now(),
    };

    if (typeof patch.confidenceValue === "number") {
      const confidence = createConfidence(patch.confidenceValue);
      next.confidence = confidence;
      next.confidenceHistory = [...current.confidenceHistory.filter(item => item.value !== confidence.value), confidence].slice(-12);
    }

    if (typeof patch.quizConfidenceBeforeValue === "number") {
      next.quizConfidenceBefore = createConfidence(patch.quizConfidenceBeforeValue);
    }

    if (typeof patch.quizConfidenceAfterValue === "number") {
      next.quizConfidenceAfter = createConfidence(patch.quizConfidenceAfterValue);
    }

    state.workspace.units[unitId] = next;
  });
}

export function getFlashcardWorkspace(unitId: string) {
  return readStudyProgress().workspace.flashcards[unitId] ?? null;
}

export function saveFlashcardWorkspace(
  unitId: string,
  meta: Omit<WorkspaceMeta, "updatedAt">,
  patch: Partial<Omit<FlashcardWorkspaceState, keyof WorkspaceMeta>>
) {
  return updateState(state => {
    const current = state.workspace.flashcards[unitId] ?? defaultFlashcardWorkspace({ ...meta, updatedAt: Date.now() });
    state.workspace.flashcards[unitId] = {
      ...current,
      ...meta,
      ...patch,
      updatedAt: Date.now(),
    };
  });
}

export function getFrqWorkspace(frqKey: string) {
  return readStudyProgress().workspace.frqs[frqKey] ?? null;
}

export function saveFrqWorkspace(
  frqKey: string,
  meta: Omit<WorkspaceMeta, "updatedAt">,
  patch: Partial<Omit<FRQWorkspaceState, keyof WorkspaceMeta | "confidenceBefore" | "confidenceAfter" | "feedbackHistory">> & {
    confidenceBeforeValue?: number;
    confidenceAfterValue?: number;
    pushFeedback?: FRQGradeResult;
  }
) {
  return updateState(state => {
    const current = state.workspace.frqs[frqKey] ?? defaultFrqWorkspace({ ...meta, updatedAt: Date.now() });
    const next: FRQWorkspaceState = {
      ...current,
      ...meta,
      ...patch,
      updatedAt: Date.now(),
      feedbackHistory: current.feedbackHistory,
    };

    if (typeof patch.confidenceBeforeValue === "number") {
      next.confidenceBefore = createConfidence(patch.confidenceBeforeValue);
    }

    if (typeof patch.confidenceAfterValue === "number") {
      next.confidenceAfter = createConfidence(patch.confidenceAfterValue);
    }

    if (patch.pushFeedback) {
      next.feedbackHistory = [patch.pushFeedback, ...current.feedbackHistory].slice(0, 8);
    }

    state.workspace.frqs[frqKey] = next;
  });
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

function toDashboardItem(entry: WorkspaceMeta, detail: string): LearningDashboardItem {
  return {
    id: `${entry.href}-${entry.updatedAt}`,
    label: entry.label,
    href: entry.href,
    detail,
    courseId: entry.courseId,
    updatedAt: entry.updatedAt,
  };
}

export function getLeastConfidentItems(limit = 5) {
  const state = readStudyProgress();
  const entries = [
    ...Object.values(state.workspace.chapters)
      .filter(entry => entry.confidence && entry.confidence.value < 60)
      .map(entry => toDashboardItem(entry, `${confidenceLabelText(entry.confidence!.label)} • ${entry.confidence!.value}% confidence`)),
    ...Object.values(state.workspace.units)
      .filter(entry => entry.confidence && entry.confidence.value < 60)
      .map(entry => toDashboardItem(entry, `${confidenceLabelText(entry.confidence!.label)} • ${entry.confidence!.value}% confidence`)),
  ];

  return entries.sort((a, b) => a.detail.localeCompare(b.detail) || b.updatedAt - a.updatedAt).slice(0, limit);
}

export function getConfusedItems(limit = 5) {
  const state = readStudyProgress();
  const entries = [
    ...Object.values(state.workspace.chapters)
      .filter(entry => entry.confused || entry.needHelp)
      .map(entry => toDashboardItem(entry, entry.needHelp ? "Marked as needing help" : "Marked as confusing")),
    ...Object.values(state.workspace.units)
      .filter(entry => entry.confused)
      .map(entry => toDashboardItem(entry, "You marked this unit as confusing")),
  ];

  return entries.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
}

export function getMasteredItems(limit = 5) {
  const state = readStudyProgress();
  return Object.values(state.workspace.chapters)
    .filter(entry => entry.understood || (entry.confidence?.value ?? 0) >= 80)
    .map(entry => toDashboardItem(entry, entry.understood ? "You marked this as understood" : "High confidence"))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

export function getReminderItems(limit = 5) {
  const state = readStudyProgress();
  const entries = [
    ...Object.values(state.workspace.chapters)
      .filter(entry => entry.reviewLater || entry.likelyOnTest)
      .map(entry => toDashboardItem(entry, entry.reviewLater ? "Saved for review later" : "Starred as likely on the test")),
    ...Object.values(state.workspace.units)
      .filter(entry => entry.reviewLater || entry.likelyOnTest)
      .map(entry => toDashboardItem(entry, entry.reviewLater ? "Saved for review later" : "Starred as likely on the test")),
    ...Object.values(state.workspace.flashcards)
      .filter(entry => entry.reviewLater || entry.practiceMore || entry.memorize)
      .map(entry => toDashboardItem(entry, entry.memorize ? "Memorize this unit" : entry.practiceMore ? "Practice this unit more" : "Review these flashcards later")),
  ];

  return entries.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
}

export function getRecentNotes(limit = 5) {
  const state = readStudyProgress();
  const entries = [
    ...Object.values(state.workspace.chapters)
      .filter(entry => [entry.notes, entry.summary, entry.teacherEmphasis, entry.memoryAid, entry.mistakeNote].some(Boolean))
      .map(entry => toDashboardItem(entry, entry.summary || entry.notes || entry.teacherEmphasis || entry.memoryAid || entry.mistakeNote)),
    ...Object.values(state.workspace.units)
      .filter(entry => [entry.stickyNote, entry.reflection, entry.teachFriend].some(Boolean))
      .map(entry => toDashboardItem(entry, entry.stickyNote || entry.reflection || entry.teachFriend)),
    ...Object.values(state.workspace.flashcards)
      .filter(entry => [entry.notes, entry.thingsToForget].some(Boolean))
      .map(entry => toDashboardItem(entry, entry.notes || entry.thingsToForget)),
    ...Object.values(state.workspace.frqs)
      .filter(entry => [entry.notes, entry.missedRubric, entry.improveNext].some(Boolean))
      .map(entry => toDashboardItem(entry, entry.notes || entry.missedRubric || entry.improveNext)),
  ];

  return entries.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
}

export function getReflectionItems(limit = 5) {
  const state = readStudyProgress();
  const entries = [
    ...Object.values(state.workspace.chapters)
      .filter(entry => [entry.reflection, entry.tomorrowReview, entry.teachFriend].some(Boolean))
      .map(entry => toDashboardItem(entry, entry.tomorrowReview || entry.reflection || entry.teachFriend)),
    ...Object.values(state.workspace.units)
      .filter(entry => [entry.reflection, entry.tomorrowReview, entry.teachFriend].some(Boolean))
      .map(entry => toDashboardItem(entry, entry.tomorrowReview || entry.reflection || entry.teachFriend)),
    ...Object.values(state.workspace.frqs)
      .filter(entry => entry.improveNext || entry.missedRubric)
      .map(entry => toDashboardItem(entry, entry.improveNext || entry.missedRubric)),
  ];

  return entries.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
}

export function getConfidenceGapItems(limit = 5) {
  const state = readStudyProgress();
  const items: LearningDashboardItem[] = [];

  for (const chapter of Object.values(state.workspace.chapters)) {
    if (!chapter.chapterId || !chapter.unitId) continue;
    const latestScore =
      state.courses[chapter.courseId]?.units?.[chapter.unitId]?.chapterQuizScores?.[chapter.chapterId]?.slice(-1)[0] ?? null;
    if (latestScore === null || !chapter.confidence) continue;

    if (chapter.confidence.value >= 80 && latestScore < 60) {
      items.push(toDashboardItem(chapter, `You felt confident (${chapter.confidence.value}%), but scored ${latestScore}%`));
    } else if (chapter.confidence.value <= 40 && latestScore >= 80) {
      items.push(toDashboardItem(chapter, `You felt unsure (${chapter.confidence.value}%), but scored ${latestScore}%`));
    }
  }

  return items.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
}

export async function fetchRemoteStudyProgress() {
  if (isGuestModeActive()) return DEFAULT_STATE;
  const response = await fetch("/api/study-progress", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load synced study progress.");
  }

  const payload = (await response.json()) as { progress: StudyProgressState | null };
  return normalizeState(payload.progress ?? DEFAULT_STATE);
}

export async function pushRemoteStudyProgress(progress: StudyProgressState) {
  if (isGuestModeActive()) return;
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
  if (isGuestModeActive()) {
    if (canUseStorage()) {
      window.localStorage.removeItem(STUDY_PROGRESS_KEY);
    }
    return DEFAULT_STATE;
  }

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
