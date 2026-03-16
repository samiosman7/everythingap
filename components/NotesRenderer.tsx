"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function normalizeNotesForDisplay(notes: string) {
  return notes
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/Â·/g, "·")
    .replace(/â‰ˆ/g, "≈")
    .replace(/â‰¥/g, "≥")
    .replace(/â‰¤/g, "≤")
    .replace(/âˆ’/g, "-")
    .replace(/â†’/g, "→")
    .replace(/â†/g, "←")
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"');
}

export default function NotesRenderer({ notes }: { notes: string }) {
  return (
    <div className="notes-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {normalizeNotesForDisplay(notes)}
      </ReactMarkdown>
    </div>
  );
}
