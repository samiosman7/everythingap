"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function NotesRenderer({ notes }: { notes: string }) {
  return (
    <div className="notes-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
    </div>
  );
}
