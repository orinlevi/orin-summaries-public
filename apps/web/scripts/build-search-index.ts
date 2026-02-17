/**
 * Build a static search index from all markdown content.
 * Run: npx tsx scripts/build-search-index.ts
 * Output: public/search-index.json
 */

import fs from "fs";
import path from "path";

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
  title: string;
  contentDir: string;
  university?: "tau" | "huji";
  sections?: RawSection[];
  units?: RawUnit[];
}

interface SearchEntry {
  courseId: string;
  courseTitle: string;
  unitSlug: string;
  unitTitle: string;
  text: string; // plain text snippet for searching
  university?: "tau" | "huji";
}

const CONTENT_DIR = path.join(__dirname, "..", "content");
const OUTPUT_PATH = path.join(__dirname, "..", "public", "search-index.json");

/** Strip markdown/latex/html to get searchable plain text */
function stripToPlainText(markdown: string): string {
  let text = markdown;

  // Remove YAML frontmatter
  text = text.replace(/^---[\s\S]*?---\n?/, "");

  // Remove display math blocks
  text = text.replace(/\$\$[\s\S]*?\$\$/g, " ");

  // Remove inline math
  text = text.replace(/\$[^$\n]+?\$/g, " ");

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Remove admonition markers (MkDocs style)
  text = text.replace(/^!!!?\s+\w+.*$/gm, "");
  text = text.replace(/^\?\?\?\+?\s+\w+.*$/gm, "");

  // Remove markdown images
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, "");

  // Remove markdown links, keep text
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

  // Remove markdown formatting
  text = text.replace(/#{1,6}\s+/g, ""); // headings
  text = text.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1"); // bold/italic
  text = text.replace(/`{1,3}[^`]*`{1,3}/g, " "); // inline code
  text = text.replace(/```[\s\S]*?```/g, " "); // code blocks

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}$/gm, "");

  // Remove table formatting
  text = text.replace(/\|/g, " ");
  text = text.replace(/^[-:]+$/gm, "");

  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

function main() {
  const coursesPath = path.join(CONTENT_DIR, "courses.json");
  const coursesData = JSON.parse(fs.readFileSync(coursesPath, "utf-8"));
  const courses: RawCourse[] = coursesData.courses;

  const index: SearchEntry[] = [];
  let totalFiles = 0;

  for (const course of courses) {
    const units: RawUnit[] = course.sections
      ? course.sections.flatMap((s) => s.items)
      : course.units || [];

    for (const unit of units) {
      const filePath = path.join(CONTENT_DIR, course.contentDir, unit.file);

      if (!fs.existsSync(filePath)) {
        continue;
      }

      const raw = fs.readFileSync(filePath, "utf-8");
      const plainText = stripToPlainText(raw);

      // Take first 600 chars for the index — enough for search matching
      const snippet = plainText.slice(0, 600);

      index.push({
        courseId: course.id,
        courseTitle: course.title,
        unitSlug: unit.slug,
        unitTitle: unit.title,
        text: snippet,
        university: course.university || "tau",
      });

      totalFiles++;
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index));

  const sizeKB = Math.round(fs.statSync(OUTPUT_PATH).size / 1024);
  console.log(`Search index built: ${totalFiles} units, ${sizeKB} KB → ${OUTPUT_PATH}`);
}

main();
