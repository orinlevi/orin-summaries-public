import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import {
  preprocessMkdocsAdmonitions,
  preprocessMathFixup,
  rehypeAdmonitions,
} from "@orin/remark-mkdocs";
import { getCourseById } from "@/lib/courses";

interface MarkdownRendererProps {
  content: string;
  courseId?: string;
  /** The file path of the current unit (e.g. "notes/basics.md") */
  currentFile?: string;
}

/**
 * Build a map from .md filename -> slug for a given course.
 * This is used to rewrite MkDocs-style relative links like [text](filename.md)
 * to the correct Next.js route like /course/courseId/slug.
 */
function buildFileToSlugMap(courseId: string): Map<string, string> {
  const course = getCourseById(courseId);
  if (!course) return new Map();

  const map = new Map<string, string>();
  for (const unit of course.units) {
    // Map the full file path (e.g. "notes/basics.md") -> slug
    map.set(unit.file, unit.slug);
    // Also map just the filename (e.g. "basics.md")
    const basename = unit.file.split("/").pop();
    if (basename) {
      map.set(basename, unit.slug);
    }
  }
  return map;
}

/**
 * Rewrite MkDocs-style relative .md links to Next.js routes.
 * Handles patterns like:
 * - [text](filename.md) -> [text](/course/courseId/slug)
 * - [text](../notes/filename.md) -> [text](/course/courseId/slug)
 * - [text](folder/filename.md) -> [text](/course/courseId/slug)
 *
 * Links to files not found in the course (like .py, .ipynb, or non-existent .md)
 * are removed (replaced with just the text).
 */
function rewriteLinks(
  markdown: string,
  courseId: string,
  fileToSlug: Map<string, string>
): string {
  // Match markdown links: [text](url)
  return markdown.replace(
    /\[([^\]]*)\]\(([^)]+)\)/g,
    (match, text, url) => {
      // Skip external URLs, anchors, and absolute paths
      if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("#") ||
        url.startsWith("/")
      ) {
        return match;
      }

      // Handle .md links
      if (url.endsWith(".md")) {
        // Extract just the filename from paths like ../notes/filename.md or folder/filename.md
        const filename = url.split("/").pop() || url;
        // Also try the path after removing leading ../
        const cleanPath = url.replace(/^(\.\.\/)+/, "");

        // Try to find a matching slug
        const slug =
          fileToSlug.get(cleanPath) ||
          fileToSlug.get(filename);

        if (slug) {
          return `[${text}](/course/${courseId}/${slug})`;
        }

        // No matching slug found - just show the text without a broken link
        return text;
      }

      // Handle .py, .ipynb and other non-web files - remove the link
      if (
        url.endsWith(".py") ||
        url.endsWith(".ipynb") ||
        url.endsWith(".csv") ||
        url.endsWith(".txt")
      ) {
        return text;
      }

      // Keep other links as-is
      return match;
    }
  );
}

export function MarkdownRenderer({
  content,
  courseId,
  currentFile,
}: MarkdownRendererProps) {
  // Preprocess: convert MkDocs syntax to standard markdown/HTML
  // This runs BEFORE the remark/rehype pipeline
  let processed = content;
  processed = preprocessMkdocsAdmonitions(processed);
  processed = preprocessMathFixup(processed);

  // Rewrite MkDocs-style relative links to Next.js routes
  if (courseId) {
    const fileToSlug = buildFileToSlugMap(courseId);
    processed = rewriteLinks(processed, courseId, fileToSlug);
  }

  return (
    <article className="prose dark:prose-invert max-w-none" dir="rtl">
      <MDXRemote
        source={processed}
        options={{
          mdxOptions: {
            format: "md",
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [
              rehypeRaw,
              rehypeKatex,
              rehypeAdmonitions,
              rehypeSlug,
            ],
          },
        }}
      />
    </article>
  );
}
