"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Floating Table of Contents button.
 * Auto-detects all h2/h3 headings in the current unit and shows them as a
 * clickable list when the button is clicked. Smooth-scrolls to selected section.
 *
 * Positioned bottom-right but above JumpToGlossary if both visible.
 */
export function UnitTableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Wait a tick for content to render
    const timer = setTimeout(() => {
      const article = document.querySelector("article.prose");
      if (!article) return;

      const items: Heading[] = [];
      article.querySelectorAll("h2, h3").forEach((h) => {
        const id = h.id;
        // Skip KaTeX's hidden MathML annotation so math doesn't duplicate as raw LaTeX
        const clone = h.cloneNode(true) as HTMLElement;
        clone.querySelectorAll(".katex-mathml").forEach((n) => n.remove());
        const text = clone.textContent?.replace(/\s+/g, " ").trim() || "";
        // Skip the glossary and coverage headings (have their own button)
        if (text.includes("דף מושגים") || text.includes("בדיקת כיסוי")) return;
        if (!id || !text) return;
        items.push({
          id,
          text,
          level: h.tagName === "H2" ? 2 : 3,
        });
      });
      setHeadings(items);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Close on Escape or outside click
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-toc-panel]") && !target.closest("[data-toc-button]")) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClickOutside);
    };
  }, [open]);

  if (headings.length < 3) return null; // not worth showing TOC for tiny pages

  function jump(id: string) {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  }

  return (
    <>
      <button
        data-toc-button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-24 z-40 bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg shadow-purple-500/10 transition-all duration-200 border border-purple-300 dark:border-purple-700/50 flex items-center gap-2 text-sm font-medium"
        aria-label="תוכן עניינים"
        aria-expanded={open}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <span className="hidden sm:inline">תוכן עניינים</span>
      </button>

      {open && (
        <div
          data-toc-panel
          dir="rtl"
          className="fixed bottom-24 right-6 z-50 max-w-[min(380px,90vw)] max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2"
        >
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mb-1">
            תוכן עניינים של היחידה
          </div>
          <nav className="flex flex-col gap-0.5">
            {headings.map((h) => (
              <button
                key={h.id}
                onClick={() => jump(h.id)}
                className={`text-right px-3 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-sm ${
                  h.level === 3 ? "pr-7 text-slate-600 dark:text-slate-400" : "font-medium text-slate-900 dark:text-slate-100"
                }`}
              >
                {h.text}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
