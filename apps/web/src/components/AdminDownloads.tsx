"use client";

import { useEffect, useState } from "react";
import type { Downloadable } from "@/lib/courses";

function downloadUrl(filePath: string): string {
  return `/api/download?file=${encodeURIComponent(filePath)}`;
}

interface AdminDownloadsProps {
  items: Downloadable[];
}

/**
 * Client component that renders admin-only download buttons.
 * Checks admin status via /api/auth/check and only renders if user is admin.
 */
export function AdminDownloads({ items }: AdminDownloadsProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error("not authorized");
      })
      .then((data) => {
        if (data?.admin) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  if (!isAdmin || items.length === 0) return null;

  return (
    <>
      {items.map((dl) => (
        <a
          key={dl.file}
          href={downloadUrl(dl.file)}
          download
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors border border-amber-900/30"
        >
          {dl.title}
          <span className="text-xs bg-amber-900/50 text-amber-400 px-1.5 py-0.5 rounded">
            admin
          </span>
        </a>
      ))}
    </>
  );
}
