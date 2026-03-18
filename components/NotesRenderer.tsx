"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function repairMojibake(value: string) {
  const replacements: Array<[RegExp, string]> = [
    [/Â·/g, "·"],
    [/â‰ˆ/g, "≈"],
    [/â‰¥/g, "≥"],
    [/â‰¤/g, "≤"],
    [/â†’/g, "→"],
    [/â†/g, "←"],
    [/âˆ’/g, "−"],
    [/â€™/g, "'"],
    [/â€œ|â€/g, '"'],
    [/â€"/g, "—"],
    [/â€"/g, "–"],
  ];

  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

function normalizeNotesForDisplay(notes: string) {
  return repairMojibake(notes)
    .replace(/\r\n/g, "\n")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\$\$([\s\S]+?)\$\$/g, (_match, math) => `\n$$\n${math.trim()}\n$$\n`)
    .replace(/`?\$\s+([^$]+?)\s+\$`?/g, (_match, math) => `$${math.trim()}$`);
}

export default function NotesRenderer({ notes }: { notes: string }) {
  return (
    <div className="notes-content">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {normalizeNotesForDisplay(notes)}
      </ReactMarkdown>
    </div>
  );
}
