import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Everything AP — The Complete AP Study Platform",
  description: "Notes, flashcards, practice questions, and mock exams for every AP class.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise">{children}</body>
    </html>
  );
}
