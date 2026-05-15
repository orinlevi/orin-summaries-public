"use client";

import { useEffect, useState } from "react";

/**
 * Floating button that appears when the page has a "דף מושגים" section.
 * Clicking it smooth-scrolls to the glossary. Hidden when already inside the glossary.
 * Positioned bottom-right (opposite BackToTop which is bottom-left).
 */
export function JumpToGlossary() {
  const [visible, setVisible] = useState(false);
  const [hasGlossary, setHasGlossary] = useState(false);

  useEffect(() => {
    // Find the glossary heading (h2 with id derived from "דף מושגים")
    // rehype-slug generates ids from heading text
    const candidates = Array.from(document.querySelectorAll("h2, h3")).find((h) =>
      h.textContent?.includes("דף מושגים")
    );
    if (!candidates) {
      setHasGlossary(false);
      return;
    }
    setHasGlossary(true);

    function onScroll() {
      if (!candidates) return;
      const rect = candidates.getBoundingClientRect();
      // Show button after scrolling 300px, hide when glossary is already visible
      const scrolledEnough = window.scrollY > 300;
      const glossaryNotYetVisible = rect.top > window.innerHeight * 0.3;
      setVisible(scrolledEnough && glossaryNotYetVisible);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!hasGlossary || !visible) return null;

  function jump() {
    const target = Array.from(document.querySelectorAll("h2, h3")).find((h) =>
      h.textContent?.includes("דף מושגים")
    );
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      onClick={jump}
      className="fixed bottom-6 right-6 z-40 bg-cyan-50 dark:bg-cyan-900/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-cyan-100 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg shadow-cyan-500/10 transition-all duration-200 border border-cyan-300 dark:border-cyan-700/50 flex items-center gap-2 text-sm font-medium"
      aria-label="קפוץ לדף מושגים"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <span className="hidden sm:inline">מושגים</span>
    </button>
  );
}
