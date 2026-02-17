import Fuse, { type FuseResult } from "fuse.js";

export interface SearchEntry {
  courseId: string;
  courseTitle: string;
  unitSlug: string;
  unitTitle: string;
  text: string;
  university?: "tau" | "huji";
}

let _fuseInstance: Fuse<SearchEntry> | null = null;
let _rawData: SearchEntry[] | null = null;
let _loadingPromise: Promise<void> | null = null;

/** Lazy-load the full search index and cache it. */
async function ensureLoaded(): Promise<void> {
  if (_rawData) return;

  if (!_loadingPromise) {
    _loadingPromise = fetch("/search-index.json")
      .then((r) => r.json())
      .then((data: SearchEntry[]) => {
        _rawData = data;
      });
  }

  await _loadingPromise;
}

/** Get the global Fuse instance (searches all courses). */
export async function getGlobalFuse(): Promise<Fuse<SearchEntry>> {
  await ensureLoaded();

  if (!_fuseInstance) {
    _fuseInstance = new Fuse(_rawData!, {
      keys: [
        { name: "unitTitle", weight: 2 },
        { name: "text", weight: 1 },
        { name: "courseTitle", weight: 0.5 },
      ],
      threshold: 0.35,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }

  return _fuseInstance;
}

// Cache per-university Fuse instances
const _universityFuseCache = new Map<string, Fuse<SearchEntry>>();

/** Get a Fuse instance scoped to a specific university. */
export async function getUniversityFuse(university: "tau" | "huji"): Promise<Fuse<SearchEntry>> {
  await ensureLoaded();

  if (!_universityFuseCache.has(university)) {
    const uniData = _rawData!.filter((e) =>
      university === "huji" ? e.university === "huji" : e.university !== "huji"
    );
    const fuse = new Fuse(uniData, {
      keys: [
        { name: "unitTitle", weight: 2 },
        { name: "text", weight: 1 },
        { name: "courseTitle", weight: 0.5 },
      ],
      threshold: 0.35,
      includeMatches: true,
      minMatchCharLength: 2,
    });
    _universityFuseCache.set(university, fuse);
  }

  return _universityFuseCache.get(university)!;
}

// Cache per-course Fuse instances
const _courseFuseCache = new Map<string, Fuse<SearchEntry>>();

/** Get a Fuse instance scoped to a specific course. */
export async function getCourseFuse(courseId: string): Promise<Fuse<SearchEntry>> {
  await ensureLoaded();

  if (!_courseFuseCache.has(courseId)) {
    const courseData = _rawData!.filter((e) => e.courseId === courseId);
    const fuse = new Fuse(courseData, {
      keys: [
        { name: "unitTitle", weight: 2 },
        { name: "text", weight: 1 },
      ],
      threshold: 0.35,
      includeMatches: true,
      minMatchCharLength: 2,
    });
    _courseFuseCache.set(courseId, fuse);
  }

  return _courseFuseCache.get(courseId)!;
}

/** Extract a ~60 char snippet from text around the query match. */
export function getSnippet(text: string, query: string): string | null {
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return text.slice(0, 60);
  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, idx + query.length + 40);
  return text.slice(start, end);
}
