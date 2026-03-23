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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] bg-[#040408]/65 backdrop-blur-sm"
      >
        <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full max-w-2xl rounded-[30px] border border-[#28283c] bg-[radial-gradient(circle_at_top_left,_rgba(108,99,255,0.2),_transparent_35%),linear-gradient(180deg,#12121a_0%,#0b0b11_100%)] p-6 shadow-[0_32px_120px_rgba(0,0,0,0.55)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#6c63ff]/25 bg-[#6c63ff]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c7c2ff]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Guided tutorial
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.24em] text-[#8f89b5]">
                  Step {tutorial!.stepIndex + 1} of {steps.length}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{activeStep.title}</h2>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-full border border-white/10 p-2 text-[#a29cc6] transition-colors hover:border-white/20 hover:text-white"
                aria-label="Close tutorial"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#c1bdd8]">{activeStep.description}</p>

            <div className="mt-5 rounded-2xl border border-[#222233] bg-black/25 px-4 py-4 text-sm leading-6 text-[#a7a2c0]">
              {onExpectedPage
                ? "You are on the right page. Read the layout for a second, then move forward when you are ready."
                : "You are not on the step this tutorial expects yet. Use the button below and I will take you to the right place in the real app."}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-[#9f9abc]">
                <CheckCircle2 className="h-4 w-4 text-[#a59fff]" />
                {tutorial?.targets
                  ? `${tutorial.targets.courseName} • ${tutorial.targets.unitName}`
                  : "Choose a class to begin the walkthrough"}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#e6e3fb] transition-colors hover:bg-white/10"
                >
                  Skip tutorial
                </button>
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#120f24]"
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
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
