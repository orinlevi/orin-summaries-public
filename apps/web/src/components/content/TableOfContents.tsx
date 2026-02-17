"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    // Skip headings inside code blocks
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2]
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/`[^`]*`/g, (m) => m.slice(1, -1))
        .replace(/\$[^$]*\$/g, "")
        .trim();

      // Generate ID same as rehype-slug
      const id = text
        .toLowerCase()
        .replace(/[^\w\u0590-\u05FF\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      if (text && id) {
        headings.push({ id, text, level });
      }
    }
  }

  return headings;
}

export function TableOfContents({ markdown }: { markdown: string }) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = extractHeadings(markdown);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav aria-label="תוכן עניינים" className="hidden xl:block sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto text-sm">
      <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wider mb-3">
        תוכן עניינים
      </h3>
      <ul className="space-y-1.5 border-r border-gray-200 dark:border-gray-800 pr-3">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                setActiveId(id);
              }}
              className={`block transition-colors leading-snug ${
                level === 3 ? "pr-3 text-xs" : "text-xs"
              } ${
                activeId === id
                  ? "text-purple-600 dark:text-purple-400 border-r-2 border-purple-600 dark:border-purple-400 -mr-[calc(0.75rem+1px)] pr-[calc(0.75rem-1px)]"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
