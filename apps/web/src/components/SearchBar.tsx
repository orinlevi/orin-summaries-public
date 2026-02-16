"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchableCourse {
  id: string;
  title: string;
  description: string;
  category: string;
}

const categoryEmoji: Record<string, string> = {
  "cs-math": "\u{1F4BB}",
  psychology: "\u{1F9E0}",
  neuroscience: "\u{1F52C}",
};

export function SearchBar({ courses }: { courses: SearchableCourse[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered =
    query.length > 0
      ? courses.filter(
          (c) =>
            c.title.includes(query) ||
            c.description.includes(query) ||
            c.title.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md mx-auto mb-12">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.length > 0 && setOpen(true)}
          placeholder="חיפוש קורס..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
          dir="rtl"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((course) => (
            <li key={course.id}>
              <button
                onClick={() => {
                  router.push(`/course/${course.id}`);
                  setQuery("");
                  setOpen(false);
                }}
                className="w-full text-right px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <span className="text-lg">
                  {categoryEmoji[course.category] || "\u{1F4DA}"}
                </span>
                <div>
                  <p className="text-gray-200 text-sm font-medium">
                    {course.title}
                  </p>
                  <p className="text-gray-500 text-xs">{course.description}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.length > 0 && filtered.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl px-4 py-3">
          <p className="text-gray-500 text-sm text-center">
            לא נמצאו קורסים
          </p>
        </div>
      )}
    </div>
  );
}
