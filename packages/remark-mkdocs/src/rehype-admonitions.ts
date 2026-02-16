/**
 * rehype-admonitions
 *
 * Transforms blockquotes that start with [!TYPE] marker
 * into styled admonition divs.
 *
 * This runs AFTER remark has parsed all markdown (including math),
 * so all content inside is already proper HTML/KaTeX.
 *
 * Input HTML (from remark):
 *   <blockquote>
 *     <p>[!INFO] Title with <span class="katex">...</span></p>
 *     <p>Content with <span class="katex">...</span></p>
 *   </blockquote>
 *
 * Output HTML:
 *   <div class="admonition admonition-info">
 *     <div class="admonition-title">Title with <span class="katex">...</span></div>
 *     <div class="admonition-content">
 *       <p>Content with <span class="katex">...</span></p>
 *     </div>
 *   </div>
 */

import { visit } from "unist-util-visit";

const ALERT_REGEX = /^\[!(\w+)\](\+)?\s*/;

export function rehypeAdmonitions() {
  return (tree: any) => {
    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (node.tagName !== "blockquote" || !parent || index === undefined) return;

      // Find the first <p> child
      const firstP = node.children?.find(
        (child: any) => child.type === "element" && child.tagName === "p"
      );
      if (!firstP) return;

      // Extract text from first paragraph to check for [!TYPE] marker
      const firstText = extractText(firstP);
      const match = firstText.match(ALERT_REGEX);
      if (!match) return;

      const type = match[1].toLowerCase();
      const isCollapsible = !!match[2];

      // Extract title children: remove the [!TYPE] marker text from the
      // first paragraph's children, preserving KaTeX spans and other HTML nodes.
      const titleChildren = extractTitleChildren(firstP, match[0]);

      // If no title children remain, use the type as a fallback
      if (titleChildren.length === 0) {
        titleChildren.push({ type: "text", value: type });
      }

      // Remove the first paragraph (the marker line)
      const contentChildren = node.children.filter((child: any) => child !== firstP);

      // Build the admonition structure
      const titleDiv = {
        type: "element",
        tagName: "div",
        properties: { className: ["admonition-title"] },
        children: titleChildren,
      };

      const contentDiv = {
        type: "element",
        tagName: "div",
        properties: { className: ["admonition-content"] },
        children: contentChildren,
      };

      if (isCollapsible) {
        const summary = {
          type: "element",
          tagName: "summary",
          properties: { className: ["admonition-title"] },
          children: titleChildren,
        };

        node.tagName = "details";
        node.properties = {
          className: ["admonition", `admonition-${type}`, "collapsible"],
        };
        node.children = [summary, contentDiv];
      } else {
        node.tagName = "div";
        node.properties = {
          className: ["admonition", `admonition-${type}`],
        };
        node.children = [titleDiv, contentDiv];
      }
    });
  };
}

/**
 * Extract all text content from a node tree (used for pattern matching).
 */
function extractText(node: any): string {
  if (node.type === "text") return node.value || "";
  if (node.children) {
    return node.children.map(extractText).join("");
  }
  return "";
}

/**
 * Extract children for the title, removing the [!TYPE] marker prefix.
 * Preserves KaTeX spans and other HTML nodes that come after the marker.
 */
function extractTitleChildren(paragraph: any, markerText: string): any[] {
  const result: any[] = [];
  let markerRemaining = markerText;
  let markerRemoved = false;

  for (const child of paragraph.children || []) {
    if (markerRemoved) {
      // After marker is fully removed, keep all remaining children
      result.push(child);
      continue;
    }

    if (child.type === "text") {
      const text = child.value || "";
      if (markerRemaining.length > 0) {
        if (text.startsWith(markerRemaining)) {
          // This text node contains the rest of the marker
          const remaining = text.substring(markerRemaining.length);
          markerRemoved = true;
          if (remaining) {
            result.push({ type: "text", value: remaining });
          }
        } else if (markerRemaining.startsWith(text)) {
          // This text node is part of the marker, skip it
          markerRemaining = markerRemaining.substring(text.length);
        } else {
          // Doesn't match — shouldn't happen, but be safe
          markerRemoved = true;
          result.push(child);
        }
      } else {
        markerRemoved = true;
        result.push(child);
      }
    } else {
      // Non-text node (like a KaTeX span) — if marker is gone, keep it
      if (markerRemaining.length === 0) {
        markerRemoved = true;
      }
      if (markerRemoved || markerRemaining.length === 0) {
        markerRemoved = true;
        result.push(child);
      }
      // If marker still has text to remove, skip this node
      // (this case shouldn't normally happen — the marker is at the start)
    }
  }

  return result;
}
