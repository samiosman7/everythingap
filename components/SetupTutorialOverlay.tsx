"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react";
import {
  clearTutorialState,
  getNextTutorialHref,
  getTutorialSteps,
  readTutorialState,
  saveTutorialState,
  type TutorialState,
} from "@/lib/tutorial";

function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/";
}

export default function SetupTutorialOverlay() {
  const pathname = usePathname();
  const router = useRouter();
  const [tutorial, setTutorial] = useState<TutorialState | null>(null);

  useEffect(() => {
    setTutorial(readTutorialState());
  }, [pathname]);

  const steps = useMemo(() => getTutorialSteps(tutorial?.targets), [tutorial]);
  const activeStep = tutorial ? steps[tutorial.stepIndex] : null;
  const isVisible = Boolean(tutorial?.active && activeStep);

  if (!isVisible || !activeStep) return null;

  const onExpectedPage = normalizePath(pathname) === normalizePath(activeStep.href.split("?")[0]);
  const isLastStep = tutorial!.stepIndex >= steps.length - 1;
  const isSelectionStep = activeStep.id === "pick-course" && !tutorial?.targets;

  function updateTutorial(nextState: TutorialState | null) {
    setTutorial(nextState);
    if (nextState) {
      saveTutorialState(nextState);
    } else {
      clearTutorialState();
    }
  }

  function handleDismiss() {
    updateTutorial(null);
    if (normalizePath(pathname) === "/onboarding") {
      router.push("/dashboard");
    }
  }

  function handlePrimaryAction() {
    if (!tutorial || !activeStep) return;

    if (!onExpectedPage) {
      router.push(activeStep.href);
      return;
    }

    if (isSelectionStep) {
      updateTutorial(null);
      return;
    }

    if (isLastStep) {
      updateTutorial(null);
      router.push("/dashboard");
      return;
    }

    const nextState = { ...tutorial, stepIndex: tutorial.stepIndex + 1 };
    const nextHref = getNextTutorialHref(nextState);
    updateTutorial(nextState);
    if (nextHref) router.push(nextHref);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex justify-center px-4 sm:bottom-6 sm:justify-end sm:px-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-auto w-full max-w-[430px] rounded-[28px] border p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-6"
          style={{
            borderColor: "var(--line-strong)",
            background: "color-mix(in srgb, var(--bg-elevated) 92%, white 8%)",
            backdropFilter: "saturate(140%) blur(8px)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                <Sparkles className="h-3.5 w-3.5" />
                Setup tutorial
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] app-muted">
                Step {tutorial!.stepIndex + 1} of {steps.length}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">{activeStep.title}</h2>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-full border p-2 transition-colors hover:opacity-100"
              style={{ borderColor: "var(--line)", color: "var(--text-muted)" }}
              aria-label="Close tutorial"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-4 text-sm leading-7 app-copy">{activeStep.description}</p>

          <div className="mt-4 rounded-2xl border px-4 py-3 text-sm leading-6" style={{ borderColor: "var(--line)", background: "var(--panel-muted)", color: "var(--text-muted)" }}>
            {onExpectedPage
              ? "You can see the real page behind this popup. Take a second to look around, then keep moving."
              : "This step lives on another page. Use the button below and the tutorial will take you there."}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
            <div className="text-sm leading-6">
              {tutorial?.targets ? (
                <span className="app-copy">
                  {tutorial.targets.courseName} · {tutorial.targets.unitName}
                </span>
              ) : (
                <span className="app-copy">Choose one class to start the real walkthrough.</span>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleDismiss}
              className="app-secondary-button flex-1 px-4 py-3 text-sm font-semibold"
            >
              Skip tutorial
            </button>
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="app-primary-button inline-flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm"
            >
              {isSelectionStep && onExpectedPage
                ? activeStep.ctaLabel
                : isLastStep && onExpectedPage
                  ? "Finish tutorial"
                  : onExpectedPage
                    ? activeStep.ctaLabel
                    : "Take me there"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
