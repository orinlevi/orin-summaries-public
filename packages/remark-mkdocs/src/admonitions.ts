/**
 * MkDocs Admonition Preprocessor
 *
 * Converts MkDocs admonitions to GitHub-style blockquote alerts
 * which remark parses naturally as blockquotes.
 *
 * Input:
 *   !!! info "Important Note"
 *       Content with $math$ and **bold**
 *
 * Output:
 *   > **info: Important Note**
 *   >
 *   > Content with $math$ and **bold**
 *
 * The blockquote is then styled via CSS using data attributes
 * added by a rehype plugin, or simply by matching the bold prefix pattern.
 *
 * Actually, we'll use a cleaner approach:
 * Convert to blockquotes with a special first line marker.
 */

const ADMONITION_REGEX = /^(!{3})\s+(\w+)(?:\s+"([^"]*)")?$/;
const COLLAPSIBLE_REGEX = /^(\?{3})\s+(\w+)(?:\s+"([^"]*)")?$/;

export function preprocessMkdocsAdmonitions(markdown: string): string {
  const lines = markdown.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const admonitionMatch = lines[i].match(ADMONITION_REGEX);
    const collapsibleMatch = lines[i].match(COLLAPSIBLE_REGEX);

    if (admonitionMatch || collapsibleMatch) {
      const match = (admonitionMatch || collapsibleMatch)!;
      const type = match[2];
      const title = match[3] || type;
      const isCollapsible = !!collapsibleMatch;
      const { contentLines, endIndex } = collectIndentedContent(lines, i + 1);

      // Use a special marker that we can target with CSS
      // [!TYPE] is inspired by GitHub's alert syntax
      if (isCollapsible) {
        result.push(`> [!${type.toUpperCase()}]+ ${title}`);
      } else {
        result.push(`> [!${type.toUpperCase()}] ${title}`);
      }
      result.push(">");

      for (const line of contentLines) {
        if (line.trim() === "") {
          result.push(">");
        } else {
          result.push(`> ${line}`);
        }
      }
      result.push("");

      i = endIndex;
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result.join("\n");
}

function collectIndentedContent(
  lines: string[],
  startIndex: number
): { contentLines: string[]; endIndex: number } {
  const contentLines: string[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("    ")) {
      contentLines.push(line.substring(4));
      i++;
    } else if (line.trim() === "") {
      if (i + 1 < lines.length && lines[i + 1].startsWith("    ")) {
        contentLines.push("");
        i++;
      } else {
        i++;
        break;
      }
    } else {
      break;
    }
  }

  return { contentLines, endIndex: i };
}
