"use client";

import { Check, Palette } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { APP_THEMES, useTheme } from "@/components/ThemeProvider";

type SettingsCourse = {
  id: string;
  name: string;
  emoji: string;
  href: string;
};

export default function ThemeSettingsClient({
  emailLabel,
  isGuest,
  selectedCourses,
}: {
  emailLabel: string;
  isGuest: boolean;
  selectedCourses: SettingsCourse[];
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="app-shell">
      <DashboardSidebar emailLabel={emailLabel} isGuest={isGuest} selectedCourses={selectedCourses} />

      <div className="app-main">
        <header className="app-header">
          <p className="app-kicker">Settings</p>
          <h1 className="app-title mt-2">Make the app feel like yours.</h1>
          <p className="app-copy mt-3 max-w-3xl">
            Switch the theme for the whole app here. The goal is a cleaner study environment, not one locked into the
            same black-and-purple look forever.
          </p>
        </header>

        <main className="app-page">
          <section className="app-panel p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                style={{ background: "var(--accent)" }}
              >
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <p className="app-kicker">Theme selection</p>
                <h2 className="app-section-title mt-1">Choose a visual direction</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {APP_THEMES.map(option => {
                const active = option.id === theme;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTheme(option.id)}
                    className="app-card p-5 text-left transition-transform hover:-translate-y-1"
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--line)",
                      boxShadow: active ? "0 0 0 1px color-mix(in srgb, var(--accent) 50%, transparent)" : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl font-semibold">{option.name}</h3>
                        <p className="mt-2 text-sm leading-7" style={{ color: "var(--text-soft)" }}>
                          {option.description}
                        </p>
                      </div>
                      {active && (
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white"
                          style={{ background: "var(--accent)" }}
                        >
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                    <div className="mt-5 flex gap-2">
                      <div className="h-10 flex-1 rounded-2xl" style={{ background: "var(--bg-elevated)" }} />
                      <div className="h-10 flex-1 rounded-2xl" style={{ background: "var(--panel)" }} />
                      <div className="h-10 w-14 rounded-2xl" style={{ background: "var(--accent)" }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
