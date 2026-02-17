"use client";

import { useEffect, useState, useMemo } from "react";
import { PaywallGate } from "./PaywallGate";

const loadingQuips = [
  "Thinking...",
  "Loading stuff...",
  "Almost there...",
  "Brewing coffee...",
  "Summoning knowledge...",
  "Convincing the server...",
  "One sec, not boring...",
];

interface Props {
  isFree: boolean;
  courseName: string;
  children: React.ReactNode;
}

export function ProtectedContent({ isFree, courseName, children }: Props) {
  const [status, setStatus] = useState<"loading" | "granted" | "blocked">(
    isFree ? "granted" : "loading"
  );

  const loadingText = useMemo(
    () => loadingQuips[Math.floor(Math.random() * loadingQuips.length)],
    []
  );

  useEffect(() => {
    if (isFree) return;

    fetch("/api/auth/check")
      .then((r) => setStatus(r.ok ? "granted" : "blocked"))
      .catch(() => setStatus("blocked"));
  }, [isFree]);

  if (status === "loading") {
    return (
      <div className="py-16 text-center text-gray-400 dark:text-gray-600 animate-pulse text-sm">
        {loadingText}
      </div>
    );
  }

  if (status === "blocked") {
    return <PaywallGate courseName={courseName} />;
  }

  return <>{children}</>;
}
