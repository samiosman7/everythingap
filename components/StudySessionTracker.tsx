"use client";

import { useEffect } from "react";
import { pushRemoteStudyProgress, syncStudyProgressFromAccount, trackStudyEvent, type StudyLocationKind } from "@/lib/study-progress";

type StudySessionTrackerProps = {
  courseId: string;
  href: string;
  label: string;
  kind: StudyLocationKind;
  unitId?: string;
  chapterId?: string;
};

export default function StudySessionTracker(props: StudySessionTrackerProps) {
  useEffect(() => {
    let cancelled = false;

    async function sync() {
      await syncStudyProgressFromAccount();
      if (cancelled) return;
      const nextState = trackStudyEvent(props);
      try {
        await pushRemoteStudyProgress(nextState);
      } catch {}
    }

    void sync();

    return () => {
      cancelled = true;
    };
  }, [props]);

  return null;
}
