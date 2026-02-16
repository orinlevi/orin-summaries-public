"use client";

import { useEffect, useState } from "react";
import { PaywallGate } from "./PaywallGate";

interface Props {
  isFree: boolean;
  courseName: string;
  children: React.ReactNode;
}

export function ProtectedContent({ isFree, courseName, children }: Props) {
  const [status, setStatus] = useState<"loading" | "granted" | "blocked">(
    isFree ? "granted" : "loading"
  );

  useEffect(() => {
    if (isFree) return;

    fetch("/api/auth/check")
      .then((r) => setStatus(r.ok ? "granted" : "blocked"))
      .catch(() => setStatus("blocked"));
  }, [isFree]);

  if (status === "loading") {
    return (
      <div className="py-16 text-center text-gray-500 animate-pulse">
        טוען...
      </div>
    );
  }

  if (status === "blocked") {
    return <PaywallGate courseName={courseName} />;
  }

  return <>{children}</>;
}
