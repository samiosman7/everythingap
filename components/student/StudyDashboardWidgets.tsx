"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getConfidenceGapItems,
  getConfusedItems,
  getLeastConfidentItems,
  getMasteredItems,
  getRecentNotes,
  getReflectionItems,
  getReminderItems,
  syncStudyProgressFromAccount,
  type LearningDashboardItem,
} from "@/lib/study-progress";

function InsightList({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: LearningDashboardItem[];
}) {
  return (
    <section className="app-panel p-5">
      <p className="app-kicker">{title}</p>
      <p className="mt-2 text-sm leading-7 app-copy">{subtitle}</p>

      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className="app-card block px-4 py-3 transition-transform hover:-translate-y-0.5"
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-sm leading-6 app-copy">{item.detail}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed px-4 py-5 text-sm leading-6 app-muted" style={{ borderColor: "var(--line)" }}>
          Nothing here yet. Once students start leaving notes, confidence marks, and reflections, this section fills itself in.
        </div>
      )}
    </section>
  );
}

export default function StudyDashboardWidgets() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      await syncStudyProgressFromAccount();
      if (mounted) setReady(true);
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const leastConfident = ready ? getLeastConfidentItems(4) : [];
  const confused = ready ? getConfusedItems(4) : [];
  const reminders = ready ? getReminderItems(4) : [];
  const notes = ready ? getRecentNotes(4) : [];
  const reflections = ready ? getReflectionItems(4) : [];
  const gaps = ready ? getConfidenceGapItems(4) : [];
  const mastered = ready ? getMasteredItems(4) : [];

  return (
    <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      <InsightList
        title="Least confident"
        subtitle="The places you marked as weak so the dashboard can steer you back there first."
        items={leastConfident}
      />
      <InsightList
        title="Marked confusing"
        subtitle="Topics and units you explicitly flagged as messy, unclear, or needing help."
        items={confused}
      />
      <InsightList
        title="Saved reminders"
        subtitle="Everything you tagged for later review, likely-on-the-test moments, and memorize-this reminders."
        items={reminders}
      />
      <InsightList
        title="Recent notes"
        subtitle="Your most recent private notes, summaries, sticky notes, and flashcard reminders."
        items={notes}
      />
      <InsightList
        title="Reflections"
        subtitle="What felt shaky, what you want to review tomorrow, and the advice you left your future self."
        items={reflections}
      />
      <InsightList
        title="Confidence vs scores"
        subtitle="Places where how you felt and how you scored do not match yet."
        items={gaps}
      />
      <InsightList
        title="Marked mastered"
        subtitle="Chapters you marked as understood or felt highly confident about."
        items={mastered}
      />
    </div>
  );
}
