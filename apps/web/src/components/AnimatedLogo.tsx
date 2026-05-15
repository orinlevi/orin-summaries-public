"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const FACES = [
  "🐥", "🐣", "🐥", "🌸", "🌷", "🌻", "🪷", "🦋",
  "💜", "💗", "🌙", "🪐", "✨", "🍓", "🍰", "☕",
  "📚", "🧠", "🤓", "🥲", "🥹", "🥱", "🥺", "😴",
  "🫠", "😵‍💫", "🙃", "🥰",
];

const SURPRISE_FACES = ["🐣", "🎉", "✨", "💫", "🌈", "💖"];

interface AnimatedLogoProps {
  size?: number;
  autoRotate?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function AnimatedLogo({
  size = 96,
  autoRotate = true,
  className = "",
  ariaLabel = "Orin Summaries — לחיצה משנה פרצוף",
}: AnimatedLogoProps) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [isSurprise, setIsSurprise] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * FACES.length));
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!autoRotate || reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => {
        let next = Math.floor(Math.random() * FACES.length);
        if (next === i) next = (i + 1) % FACES.length;
        return next;
      });
    }, 3800);
    return () => window.clearInterval(id);
  }, [autoRotate, reducedMotion]);

  const handleClick = useCallback(() => {
    setIsSurprise(true);
    window.setTimeout(() => {
      setIsSurprise(false);
      setIndex((i) => (i + 1) % FACES.length);
    }, 650);
  }, []);

  const handleHover = useCallback(() => {
    if (reducedMotion) return;
    setIndex((i) => (i + 1) % FACES.length);
  }, [reducedMotion]);

  const display = isSurprise
    ? SURPRISE_FACES[index % SURPRISE_FACES.length]
    : hasMounted
      ? FACES[index]
      : "🌸";

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleHover}
      whileHover={reducedMotion ? undefined : { scale: 1.06, rotate: [-3, 3, -1, 0] }}
      whileTap={reducedMotion ? undefined : { scale: 0.92, rotate: 360 }}
      transition={{ type: "spring", stiffness: 280, damping: 16 }}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      className={`relative rounded-full overflow-hidden cursor-pointer select-none flex items-center justify-center ring-2 ring-purple-400/40 dark:ring-purple-500/30 shadow-[0_8px_30px_-4px_rgba(168,85,247,0.35)] dark:shadow-[0_8px_30px_-4px_rgba(168,85,247,0.45)] bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 dark:from-purple-900/50 dark:via-pink-900/30 dark:to-indigo-900/50 ${className}`}
      aria-label={ariaLabel}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,_rgba(255,255,255,0.65),_transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_25%,_rgba(255,255,255,0.18),_transparent_60%)] pointer-events-none"
      />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={display}
          initial={reducedMotion ? { opacity: 0 } : { scale: 0.3, opacity: 0, rotate: -60 }}
          animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { scale: 0.3, opacity: 0, rotate: 60 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
          className="leading-none relative z-10"
          aria-hidden
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
