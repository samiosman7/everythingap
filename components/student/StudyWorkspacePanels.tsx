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

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="app-panel p-5 sm:p-6">
      <p className="app-kicker">{title}</p>
      <p className="mt-3 text-sm leading-7 app-copy">{subtitle}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function CompactField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="app-textarea min-h-[96px]"
      />
    </label>
  );
}

function CompactTextField({
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
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="app-input" />
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
      className="app-chip px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
      style={{
        borderColor: active ? "var(--accent)" : "var(--line)",
        background: active ? "var(--accent-soft)" : undefined,
        color: active ? "var(--text)" : undefined,
      }}
    >
      {label}
    </button>
  );
}

function ConfidenceSlider({
  value,
  onChange,
  caption,
}: {
  value: number;
  onChange: (value: number) => void;
  caption: string;
}) {
  const label = confidenceLabelText(value >= 75 ? "confident" : value >= 40 ? "kind-of" : "not-ready");

  return (
    <div className="app-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Confidence</p>
          <p className="mt-1 text-sm app-copy">{caption}</p>
        </div>
        <div className="app-chip px-3 py-1 text-sm font-semibold">{value}% · {label}</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="mt-4 h-2 w-full cursor-pointer"
        style={{ accentColor: "var(--accent)" }}
      />
      <div className="mt-2 flex justify-between text-[11px] uppercase tracking-[0.16em] app-muted">
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

export function ChapterWorkspacePanel({
  chapterId,
  meta,
}: {
  chapterId: string;
  meta: BaseMeta;
}) {
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState({
    notes: "",
    reflection: "",
    tomorrowReview: "",
    confidenceValue: 50,
    reviewLater: false,
    confused: false,
    likelyOnTest: false,
    understood: false,
    needHelp: false,
    pinned: false,
    summary: "",
    memoryAid: "",
    teachFriend: "",
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
        reflection: workspace?.reflection ?? "",
        tomorrowReview: workspace?.tomorrowReview ?? "",
        confidenceValue: workspace?.confidence?.value ?? 50,
        reviewLater: workspace?.reviewLater ?? false,
        confused: workspace?.confused ?? false,
        likelyOnTest: workspace?.likelyOnTest ?? false,
        understood: workspace?.understood ?? false,
        needHelp: workspace?.needHelp ?? false,
        pinned: workspace?.pinned ?? false,
        summary: workspace?.summary ?? "",
        memoryAid: workspace?.memoryAid ?? "",
        teachFriend: workspace?.teachFriend ?? "",
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
        { ...meta, pinned: draft.pinned, tags: parseTags(draft.tags) },
        {
          notes: draft.notes,
          reflection: draft.reflection,
          tomorrowReview: draft.tomorrowReview,
          reviewLater: draft.reviewLater,
          confused: draft.confused,
          likelyOnTest: draft.likelyOnTest,
          understood: draft.understood,
          needHelp: draft.needHelp,
          confidenceValue: draft.confidenceValue,
          summary: draft.summary,
          memoryAid: draft.memoryAid,
          teachFriend: draft.teachFriend,
        }
      );
      void pushRemoteStudyProgress(next).catch(() => {});
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [chapterId, draft, meta, ready]);

  return (
    <Shell
      title="Chapter workspace"
      subtitle="A cleaner place for your own notes and confidence, without turning the page into a giant form."
    >
      <ConfidenceSlider
        value={draft.confidenceValue}
        onChange={value => setDraft(current => ({ ...current, confidenceValue: value }))}
        caption="How ready do you feel with this chapter right now?"
      />

      <div className="flex flex-wrap gap-2">
        <ToggleChip active={draft.reviewLater} onClick={() => setDraft(current => ({ ...current, reviewLater: !current.reviewLater }))} label="Review later" />
        <ToggleChip active={draft.confused} onClick={() => setDraft(current => ({ ...current, confused: !current.confused }))} label="Still confusing" />
        <ToggleChip active={draft.likelyOnTest} onClick={() => setDraft(current => ({ ...current, likelyOnTest: !current.likelyOnTest }))} label="Likely on the test" />
        <ToggleChip active={draft.understood} onClick={() => setDraft(current => ({ ...current, understood: !current.understood }))} label="I understand this" />
        <ToggleChip active={draft.needHelp} onClick={() => setDraft(current => ({ ...current, needHelp: !current.needHelp }))} label="Need help" />
        <ToggleChip active={draft.pinned} onClick={() => setDraft(current => ({ ...current, pinned: !current.pinned }))} label="Pin this" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CompactField label="Private notes" value={draft.notes} onChange={value => setDraft(current => ({ ...current, notes: value }))} placeholder="What matters here in your own words?" />
        <CompactField label="What still feels shaky?" value={draft.reflection} onChange={value => setDraft(current => ({ ...current, reflection: value }))} placeholder="Name the concept or step that still feels unstable." />
      </div>

      <CompactField label="What should I review next?" value={draft.tomorrowReview} onChange={value => setDraft(current => ({ ...current, tomorrowReview: value }))} placeholder="Leave your future self one clear next step." rows={3} />

      <details className="app-card p-4">
        <summary className="cursor-pointer text-sm font-semibold">More prompts</summary>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <CompactField label="My summary" value={draft.summary} onChange={value => setDraft(current => ({ ...current, summary: value }))} placeholder="Summarize the chapter in a few lines." />
          <CompactField label="Memory aid" value={draft.memoryAid} onChange={value => setDraft(current => ({ ...current, memoryAid: value }))} placeholder="What actually helped this stick?" />
          <CompactField label="Teach-a-friend version" value={draft.teachFriend} onChange={value => setDraft(current => ({ ...current, teachFriend: value }))} placeholder="What part could you explain to someone else?" />
          <CompactTextField label="Custom tags" value={draft.tags} onChange={value => setDraft(current => ({ ...current, tags: value }))} placeholder="exam soon, practice more, memorize" />
        </div>
      </details>
    </Shell>
  );
}

export function UnitWorkspacePanel({
  unitId,
  meta,
}: {
  unitId: string;
  meta: BaseMeta;
}) {
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState({
    stickyNote: "",
    reflection: "",
    tomorrowReview: "",
    confidenceValue: 50,
    reviewLater: false,
    confused: false,
    likelyOnTest: false,
    pinned: false,
    teachFriend: "",
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
        confidenceValue: workspace?.confidence?.value ?? 50,
        reviewLater: workspace?.reviewLater ?? false,
        confused: workspace?.confused ?? false,
        likelyOnTest: workspace?.likelyOnTest ?? false,
        pinned: workspace?.pinned ?? false,
        teachFriend: workspace?.teachFriend ?? "",
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
        { ...meta, pinned: draft.pinned, tags: parseTags(draft.tags) },
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
    <Shell
      title="Unit reflection"
      subtitle="A compact unit-level note area that feels more like a study scratchpad than a survey."
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
        <CompactField label="Unit sticky note" value={draft.stickyNote} onChange={value => setDraft(current => ({ ...current, stickyNote: value }))} placeholder="What matters most in this unit?" />
        <CompactField label="What still needs work?" value={draft.reflection} onChange={value => setDraft(current => ({ ...current, reflection: value }))} placeholder="What still feels patchy or easy to miss?" />
      </div>

      <CompactField label="What should I review next?" value={draft.tomorrowReview} onChange={value => setDraft(current => ({ ...current, tomorrowReview: value }))} placeholder="Leave yourself one concrete next move." rows={3} />

      <details className="app-card p-4">
        <summary className="cursor-pointer text-sm font-semibold">More prompts</summary>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <CompactField label="Teach-a-friend version" value={draft.teachFriend} onChange={value => setDraft(current => ({ ...current, teachFriend: value }))} placeholder="What part of this unit could you confidently explain?" />
          <CompactTextField label="Custom tags" value={draft.tags} onChange={value => setDraft(current => ({ ...current, tags: value }))} placeholder="final review, exam soon, practice more" />
        </div>
      </details>
    </Shell>
  );
}

export function FlashcardWorkspacePanel({
  unitId,
  meta,
}: {
  unitId: string;
  meta: BaseMeta;
}) {
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState({
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
        { ...meta, pinned: draft.pinned, tags: parseTags(draft.tags) },
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
    <Shell
      title="Flashcard notes"
      subtitle="Keep just the memory cues and weak spots that actually matter while you review the deck."
    >
      <div className="flex flex-wrap gap-2">
        <ToggleChip active={draft.reviewLater} onClick={() => setDraft(current => ({ ...current, reviewLater: !current.reviewLater }))} label="Review later" />
        <ToggleChip active={draft.practiceMore} onClick={() => setDraft(current => ({ ...current, practiceMore: !current.practiceMore }))} label="Practice more" />
        <ToggleChip active={draft.memorize} onClick={() => setDraft(current => ({ ...current, memorize: !current.memorize }))} label="Memorize" />
        <ToggleChip active={draft.pinned} onClick={() => setDraft(current => ({ ...current, pinned: !current.pinned }))} label="Pin this" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CompactField label="What I need to remember" value={draft.notes} onChange={value => setDraft(current => ({ ...current, notes: value }))} placeholder="Patterns, reminders, or shortcuts that help these cards stick." />
        <CompactField label="What I keep forgetting" value={draft.thingsToForget} onChange={value => setDraft(current => ({ ...current, thingsToForget: value }))} placeholder="Dates, formulas, terms, or distinctions that keep slipping away." />
      </div>

      <CompactTextField label="Custom tags" value={draft.tags} onChange={value => setDraft(current => ({ ...current, tags: value }))} placeholder="weak area, exam soon, revisit" />
    </Shell>
  );
}
