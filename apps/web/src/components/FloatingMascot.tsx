"use client";

import { useState, useEffect } from "react";

const MOODS = ["🐥", "🐣", "🐥", "🌸", "✨", "🦋"];

/** A small chick that hangs out in the bottom-left corner. Bobs slightly, cycles mood emoji. */
export function FloatingMascot() {
  const [moodIdx, setMoodIdx] = useState(0);
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMoodIdx((i) => (i + 1) % MOODS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  function handleClick() {
    setWaving(true);
    window.setTimeout(() => setWaving(false), 800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="האפרוח של אורין"
      className="fixed bottom-6 left-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-pink-100 dark:from-amber-900/40 dark:to-pink-900/40 ring-2 ring-amber-300/60 dark:ring-amber-600/40 shadow-lg shadow-amber-300/30 dark:shadow-amber-900/40 flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-transform duration-200 float-medium cursor-pointer select-none"
    >
      <span className={waving ? "inline-block animate-spin" : "inline-block"}>
        {MOODS[moodIdx]}
      </span>
    </button>
  );
}
