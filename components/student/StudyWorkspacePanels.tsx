"use client";

import { useEffect, useState } from "react";
import {
  confidenceLabelText,
  getChapterWorkspace,
  getFlashcardWorkspace,
  getUnitWorkspace,
  pushRemoteStudyProgress,
  saveChapterWorkspace,
  saveFlashcardWorkspace,
  saveUnitWorkspace,
  syncStudyProgressFromAccount,
} from "@/lib/study-progress";

type BaseMeta = {
  courseId: string;
  unitId?: string;
  chapterId?: string;
  href: string;
  label: string;
};

type ConfidenceProps = {
  value: number;
  onChange: (value: number) => void;
  caption: string;
};

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[#111118] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-body font-medium uppercase tracking-[0.22em] text-[#9d96ff]">{title}</p>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#9793ae]">{subtitle}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">{label}</span>
        {hint ? <span className="text-xs text-[#6f6b86]">{hint}</span> : null}
      </div>
      <textarea
        rows={rows}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[96px] w-full rounded-2xl border border-[#262637] bg-[#0c0c12] px-4 py-3 text-sm leading-7 text-[#eceaff] outline-none transition-colors placeholder:text-[#5f5a78] focus:border-[#6c63ff]/50"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white">{label}</span>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#262637] bg-[#0c0c12] px-4 py-3 text-sm text-[#eceaff] outline-none transition-colors placeholder:text-[#5f5a78] focus:border-[#6c63ff]/50"
      />
    </label>
  );
}

function ToggleChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
        active
          ? "border-[#8b80ff]/40 bg-[#8b80ff]/14 text-[#d5d0ff]"
          : "border-white/10 bg-white/[0.03] text-[#8c88a4] hover:border-white/20 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function ConfidenceSlider({ value, onChange, caption }: ConfidenceProps) {
  const label = confidenceLabelText(value >= 75 ? "confident" : value >= 40 ? "kind-of" : "not-ready");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Confidence</p>
          <p className="text-sm text-[#9d99b6]">{caption}</p>
        </div>
        <div className="rounded-full border border-[#2d2947] bg-[#141325] px-3 py-1 text-sm font-semibold text-[#d9d4ff]">
          {value}% · {label}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="mt-4 h-2 w-full cursor-pointer accent-[#8b80ff]"
      />
      <div className="mt-2 flex justify-between text-[11px] uppercase tracking-[0.16em] text-[#5f5b76]">
        <span>Not ready</span>
        <span>Very confident</span>
      </div>
    </div>
  );
}

function parseTags(raw: string) {
  return raw
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean);
}

type ChapterDraft = {
  notes: string;
  summary: string;
  teacherEmphasis: string;
  memoryAid: string;
  mistakeNote: string;
  reflection: string;
  tomorrowReview: string;
  teachFriend: string;
  confidenceValue: number;
  reviewLater: boolean;
  confused: boolean;
  likelyOnTest: boolean;
  understood: boolean;
  needHelp: boolean;
  pinned: boolean;
  tags: string;
};

export function ChapterWorkspacePanel({
  chapterId,
  meta,
}: {
  chapterId: string;
  meta: BaseMeta;
}) {
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<ChapterDraft>({
    notes: "",
    summary: "",
    teacherEmphasis: "",
    memoryAid: "",
    mistakeNote: "",
    reflection: "",
    tomorrowReview: "",
    teachFriend: "",
    confidenceValue: 50,
    reviewLater: false,
    confused: false,
    likelyOnTest: false,
    understood: false,
    needHelp: false,
    pinned: false,
    tags: "",
  });

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      await syncStudyProgressFromAccount();
      const workspace = getChapterWorkspace(chapterId);
      if (!mounted) return;
      setDraft({
        notes: workspace?.notes ?? "",
        summary: workspace?.summary ?? "",
        teacherEmphasis: workspace?.teacherEmphasis ?? "",
        memoryAid: workspace?.memoryAid ?? "",
        mistakeNote: workspace?.mistakeNote ?? "",
        reflection: workspace?.reflection ?? "",
        tomorrowReview: workspace?.tomorrowReview ?? "",
        teachFriend: workspace?.teachFriend ?? "",
        confidenceValue: workspace?.confidence?.value ?? 50,
        reviewLater: workspace?.reviewLater ?? false,
        confused: workspace?.confused ?? false,
        likelyOnTest: workspace?.likelyOnTest ?? false,
        understood: workspace?.understood ?? false,
        needHelp: workspace?.needHelp ?? false,
        pinned: workspace?.pinned ?? false,
        tags: workspace?.tags?.join(", ") ?? "",
      });
      setReady(true);
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, [chapterId]);

  useEffect(() => {
    if (!ready) return;

    const timeout = window.setTimeout(() => {
      const next = saveChapterWorkspace(
        chapterId,
        {
          ...meta,
          pinned: draft.pinned,
          tags: parseTags(draft.tags),
        },
        {
          notes: draft.notes,
          summary: draft.summary,
          teacherEmphasis: draft.teacherEmphasis,
          memoryAid: draft.memoryAid,
          mistakeNote: draft.mistakeNote,
          reflection: draft.reflection,
          tomorrowReview: draft.tomorrowReview,
          teachFriend: draft.teachFriend,
          reviewLater: draft.reviewLater,
          confused: draft.confused,
          likelyOnTest: draft.likelyOnTest,
          understood: draft.understood,
          needHelp: draft.needHelp,
          confidenceValue: draft.confidenceValue,
        }
      );

      void pushRemoteStudyProgress(next).catch(() => {});
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [chapterId, draft, meta, ready]);

  return (
    <SectionCard
      title="Student workspace"
      subtitle="Keep your own notes, confidence, reminders, and reflections right next to the chapter instead of scattering them across random tabs."
    >
      <ConfidenceSlider
        value={draft.confidenceValue}
        onChange={value => setDraft(current => ({ ...current, confidenceValue: value }))}
        caption="How ready do you feel with this chapter right now?"
      />

      <div className="flex flex-wrap gap-2">
        <ToggleChip active={draft.reviewLater} onClick={() => setDraft(current => ({ ...current, reviewLater: !current.reviewLater }))} label="Need to review later" />
        <ToggleChip active={draft.confused} onClick={() => setDraft(current => ({ ...current, confused: !current.confused }))} label="This confused me" />
        <ToggleChip active={draft.likelyOnTest} onClick={() => setDraft(current => ({ ...current, likelyOnTest: !current.likelyOnTest }))} label="Likely on the test" />
        <ToggleChip active={draft.understood} onClick={() => setDraft(current => ({ ...current, understood: !current.understood }))} label="I understand this" />
        <ToggleChip active={draft.needHelp} onClick={() => setDraft(current => ({ ...current, needHelp: !current.needHelp }))} label="I need help" />
        <ToggleChip active={draft.pinned} onClick={() => setDraft(current => ({ ...current, pinned: !current.pinned }))} label="Pin this" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Field
          label="My notes"
          value={draft.notes}
          onChange={value => setDraft(current => ({ ...current, notes: value }))}
          placeholder="Write your private notes for this chapter here."
        />
        <Field
          label="My summary of this chapter"
          value={draft.summary}
          onChange={value => setDraft(current => ({ ...current, summary: value }))}
          placeholder="What is the big picture in your own words?"
        />
        <Field
          label="Teacher emphasized this"
          value={draft.teacherEmphasis}
          onChange={value => setDraft(current => ({ ...current, teacherEmphasis: value }))}
          placeholder="What would your teacher definitely circle, repeat, or put on a review sheet?"
        />
        <Field
          label="What actually helped me remember this"
          value={draft.memoryAid}
          onChange={value => setDraft(current => ({ ...current, memoryAid: value }))}
          placeholder="Memory tricks, comparisons, examples, or shortcuts that actually worked for you."
        />
        <Field
          label="Mistakes I made on the quiz"
          value={draft.mistakeNote}
          onChange={value => setDraft(current => ({ ...current, mistakeNote: value }))}
          placeholder="What tripped you up, and what will you do differently next time?"
        />
        <Field
          label="What still feels shaky?"
          value={draft.reflection}
          onChange={value => setDraft(current => ({ ...current, reflection: value }))}
          placeholder="Name the concept or step that still feels messy."
        />
        <Field
          label="What should I review tomorrow?"
          value={draft.tomorrowReview}
          onChange={value => setDraft(current => ({ ...current, tomorrowReview: value }))}
          placeholder="Leave your future self a clear next step."
        />
        <Field
          label="What would I teach a friend?"
          value={draft.teachFriend}
          onChange={value => setDraft(current => ({ ...current, teachFriend: value }))}
          placeholder="Explain the part you actually understand well enough to teach."
        />
      </div>

      <TextField
        label="Custom tags"
        value={draft.tags}
        onChange={value => setDraft(current => ({ ...current, tags: value }))}
        placeholder="Exam soon, practice more, memorize, need teacher help"
      />
    </SectionCard>
  );
}

type UnitDraft = {
  stickyNote: string;
  reflection: string;
  tomorrowReview: string;
  teachFriend: string;
  confidenceValue: number;
  reviewLater: boolean;
  confused: boolean;
  likelyOnTest: boolean;
  pinned: boolean;
  tags: string;
};

export function UnitWorkspacePanel({
  unitId,
  meta,
}: {
  unitId: string;
  meta: BaseMeta;
}) {
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<UnitDraft>({
    stickyNote: "",
    reflection: "",
    tomorrowReview: "",
    teachFriend: "",
    confidenceValue: 50,
    reviewLater: false,
    confused: false,
    likelyOnTest: false,
    pinned: false,
    tags: "",
  });

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      await syncStudyProgressFromAccount();
      const workspace = getUnitWorkspace(unitId);
      if (!mounted) return;
      setDraft({
        stickyNote: workspace?.stickyNote ?? "",
        reflection: workspace?.reflection ?? "",
        tomorrowReview: workspace?.tomorrowReview ?? "",
        teachFriend: workspace?.teachFriend ?? "",
        confidenceValue: workspace?.confidence?.value ?? 50,
        reviewLater: workspace?.reviewLater ?? false,
        confused: workspace?.confused ?? false,
        likelyOnTest: workspace?.likelyOnTest ?? false,
        pinned: workspace?.pinned ?? false,
        tags: workspace?.tags?.join(", ") ?? "",
      });
      setReady(true);
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, [unitId]);

  useEffect(() => {
    if (!ready) return;

    const timeout = window.setTimeout(() => {
      const next = saveUnitWorkspace(
        unitId,
        {
          ...meta,
          pinned: draft.pinned,
          tags: parseTags(draft.tags),
        },
        {
          stickyNote: draft.stickyNote,
          reflection: draft.reflection,
          tomorrowReview: draft.tomorrowReview,
          teachFriend: draft.teachFriend,
          reviewLater: draft.reviewLater,
          confused: draft.confused,
          likelyOnTest: draft.likelyOnTest,
          confidenceValue: draft.confidenceValue,
        }
      );

      void pushRemoteStudyProgress(next).catch(() => {});
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [draft, meta, ready, unitId]);

  return (
    <SectionCard
      title="Unit reflection layer"
      subtitle="Use this space like a sticky-note wall for the whole unit: what feels solid, what needs work, and what you want to revisit before the exam."
    >
      <ConfidenceSlider
        value={draft.confidenceValue}
        onChange={value => setDraft(current => ({ ...current, confidenceValue: value }))}
        caption="How confident do you feel about this unit overall?"
      />

      <div className="flex flex-wrap gap-2">
        <ToggleChip active={draft.reviewLater} onClick={() => setDraft(current => ({ ...current, reviewLater: !current.reviewLater }))} label="Review later" />
        <ToggleChip active={draft.confused} onClick={() => setDraft(current => ({ ...current, confused: !current.confused }))} label="Confusing unit" />
        <ToggleChip active={draft.likelyOnTest} onClick={() => setDraft(current => ({ ...current, likelyOnTest: !current.likelyOnTest }))} label="Likely on the test" />
        <ToggleChip active={draft.pinned} onClick={() => setDraft(current => ({ ...current, pinned: !current.pinned }))} label="Pin unit" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Field
          label="Quick sticky note"
          value={draft.stickyNote}
          onChange={value => setDraft(current => ({ ...current, stickyNote: value }))}
          placeholder="Your one-screen summary of what matters in this unit."
        />
        <Field
          label="End-of-unit reflection"
          value={draft.reflection}
          onChange={value => setDraft(current => ({ ...current, reflection: value }))}
          placeholder="What felt easier than expected, and what still needs work?"
        />
        <Field
          label="What should I review tomorrow?"
          value={draft.tomorrowReview}
          onChange={value => setDraft(current => ({ ...current, tomorrowReview: value }))}
          placeholder="Leave yourself a concrete next move."
        />
        <Field
          label="What would I teach a friend?"
          value={draft.teachFriend}
          onChange={value => setDraft(current => ({ ...current, teachFriend: value }))}
          placeholder="Summarize the part of this unit you understand well enough to explain."
        />
      </div>

      <TextField
        label="Custom tags"
        value={draft.tags}
        onChange={value => setDraft(current => ({ ...current, tags: value }))}
        placeholder="Final review, exam soon, practice more"
      />
    </SectionCard>
  );
}

type FlashcardDraft = {
  notes: string;
  thingsToForget: string;
  reviewLater: boolean;
  practiceMore: boolean;
  memorize: boolean;
  pinned: boolean;
  tags: string;
};

export function FlashcardWorkspacePanel({
  unitId,
  meta,
}: {
  unitId: string;
  meta: BaseMeta;
}) {
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<FlashcardDraft>({
    notes: "",
    thingsToForget: "",
    reviewLater: false,
    practiceMore: false,
    memorize: false,
    pinned: false,
    tags: "",
  });

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      await syncStudyProgressFromAccount();
      const workspace = getFlashcardWorkspace(unitId);
      if (!mounted) return;
      setDraft({
        notes: workspace?.notes ?? "",
        thingsToForget: workspace?.thingsToForget ?? "",
        reviewLater: workspace?.reviewLater ?? false,
        practiceMore: workspace?.practiceMore ?? false,
        memorize: workspace?.memorize ?? false,
        pinned: workspace?.pinned ?? false,
        tags: workspace?.tags?.join(", ") ?? "",
      });
      setReady(true);
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, [unitId]);

  useEffect(() => {
    if (!ready) return;

    const timeout = window.setTimeout(() => {
      const next = saveFlashcardWorkspace(
        unitId,
        {
          ...meta,
          pinned: draft.pinned,
          tags: parseTags(draft.tags),
        },
        {
          notes: draft.notes,
          thingsToForget: draft.thingsToForget,
          reviewLater: draft.reviewLater,
          practiceMore: draft.practiceMore,
          memorize: draft.memorize,
        }
      );

      void pushRemoteStudyProgress(next).catch(() => {});
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [draft, meta, ready, unitId]);

  return (
    <SectionCard
      title="Flashcard study notes"
      subtitle="Keep your own memory cues, forgettable facts, and review flags here so the deck becomes more personal every time you use it."
    >
      <div className="flex flex-wrap gap-2">
        <ToggleChip active={draft.reviewLater} onClick={() => setDraft(current => ({ ...current, reviewLater: !current.reviewLater }))} label="Review later" />
        <ToggleChip active={draft.practiceMore} onClick={() => setDraft(current => ({ ...current, practiceMore: !current.practiceMore }))} label="Practice more" />
        <ToggleChip active={draft.memorize} onClick={() => setDraft(current => ({ ...current, memorize: !current.memorize }))} label="Memorize" />
        <ToggleChip active={draft.pinned} onClick={() => setDraft(current => ({ ...current, pinned: !current.pinned }))} label="Pin this unit" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Field
          label="My flashcard notes"
          value={draft.notes}
          onChange={value => setDraft(current => ({ ...current, notes: value }))}
          placeholder="Patterns you keep noticing, shortcuts, or reminders for yourself."
        />
        <Field
          label="Things I always forget"
          value={draft.thingsToForget}
          onChange={value => setDraft(current => ({ ...current, thingsToForget: value }))}
          placeholder="Specific terms, dates, formulas, or distinctions that keep slipping."
        />
      </div>

      <TextField
        label="Custom tags"
        value={draft.tags}
        onChange={value => setDraft(current => ({ ...current, tags: value }))}
        placeholder="Weak area, exam soon, revisit after quiz"
      />
    </SectionCard>
  );
}
