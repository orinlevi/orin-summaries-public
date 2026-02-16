import fs from "fs";
import path from "path";
import type { Course, Unit } from "./courses";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getUnitContent(course: Course, unit: Unit): string {
  const filePath = path.join(CONTENT_DIR, course.contentDir, unit.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Content file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
}

export function getAllContentFiles(courseId: string): string[] {
  const courseDir = path.join(CONTENT_DIR, courseId);
  if (!fs.existsSync(courseDir)) return [];

  const files: string[] = [];
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".md")) {
        files.push(path.relative(courseDir, fullPath));
      }
    }
  }
  walk(courseDir);
  return files;
}
