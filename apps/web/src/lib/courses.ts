import fs from "fs";
import path from "path";

export interface Unit {
  id: number;
  slug: string;
  file: string;
  title: string;
  free: boolean;
}

export interface Section {
  name: string;
  items: Unit[];
}

export interface Downloadable {
  title: string;
  file: string;
  adminOnly?: boolean;
  free?: boolean;
}

export interface Notebook {
  title: string;
  file: string;
  colab: string;
}

export interface CodeFile {
  title: string;
  file: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  semester: string;
  year: number;
  category: string;
  accentColor: string;
  priceILS: number;
  university: "tau" | "huji";
  contentDir: string;
  sections: Section[];
  downloadables: Downloadable[];
  notebooks: Notebook[];
  codeFiles: CodeFile[];
  /** Flat list of all items across all sections */
  units: Unit[];
}

interface RawUnit {
  id: number;
  slug: string;
  file: string;
  title: string;
  free: boolean;
}

interface RawSection {
  name: string;
  items: RawUnit[];
}

interface RawCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  semester: string;
  year: number;
  category: string;
  accentColor: string;
  priceILS: number;
  university?: "tau" | "huji";
  contentDir: string;
  sections?: RawSection[];
  units?: RawUnit[];
  downloadables?: Downloadable[];
  notebooks?: Notebook[];
  codeFiles?: CodeFile[];
}

interface CoursesData {
  courses: RawCourse[];
}

function loadCourses(): Course[] {
  const filePath = path.join(process.cwd(), "content", "courses.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data: CoursesData = JSON.parse(raw);

  return data.courses.map((c) => {
    // Support both old flat "units" and new "sections" format
    const sections: Section[] = c.sections
      ? c.sections
      : c.units
        ? [{ name: "סיכומים", items: c.units }]
        : [];

    const units = sections.flatMap((s) => s.items);

    const downloadables: Downloadable[] = c.downloadables ?? [];
    const notebooks: Notebook[] = c.notebooks ?? [];
    const codeFiles: CodeFile[] = c.codeFiles ?? [];
    const university = c.university || "tau";
    return { ...c, university, sections, units, downloadables, notebooks, codeFiles };
  });
}

let _cache: Course[] | null = null;
function getCourses(): Course[] {
  if (!_cache) _cache = loadCourses();
  return _cache;
}

export function getAllCourses(): Course[] {
  return getCourses();
}

export function getTauCourses(): Course[] {
  return getCourses().filter((c) => c.university === "tau");
}

export function getHujiCourses(): Course[] {
  return getCourses().filter((c) => c.university === "huji");
}

export function getCourseById(id: string): Course | null {
  return getCourses().find((c) => c.id === id) || null;
}

export function getCourseBySlug(slug: string): Course | null {
  return getCourses().find((c) => c.slug === slug) || null;
}

export function getUnitBySlug(course: Course, unitSlug: string): Unit | null {
  return course.units.find((u) => u.slug === unitSlug) || null;
}

export function getAdjacentUnits(
  course: Course,
  unitSlug: string
): { prev: Unit | null; next: Unit | null } {
  const index = course.units.findIndex((u) => u.slug === unitSlug);
  return {
    prev: index > 0 ? course.units[index - 1] : null,
    next: index < course.units.length - 1 ? course.units[index + 1] : null,
  };
}
