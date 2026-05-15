"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Extract heading text from the rendered DOM, skipping KaTeX's hidden MathML
 * annotation (which would otherwise duplicate the math content as raw LaTeX).
 */
function getHeadingText(h: Element): string {
  const clone = h.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".katex-mathml").forEach((n) => n.remove());
  return clone.textContent?.replace(/\s+/g, " ").trim() || "";
}

export function TableOfContents({ markdown: _markdown }: { markdown?: string } = {}) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const article = document.querySelector("article.prose");
      if (!article) return;
      const items: TocItem[] = [];
      article.querySelectorAll("h2, h3").forEach((h) => {
        const id = h.id;
        const text = getHeadingText(h);
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

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
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
