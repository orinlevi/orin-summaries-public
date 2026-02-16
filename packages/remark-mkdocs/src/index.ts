export { preprocessMkdocsAdmonitions } from "./admonitions";
export { preprocessMathFixup } from "./math-fixup";
export { rehypeAdmonitions } from "./rehype-admonitions";

/**
 * Apply all MkDocs preprocessors to raw markdown content.
 * Call this BEFORE passing content to MDXRemote.
 */
export function preprocessMkdocs(markdown: string): string {
  // Inline to avoid dynamic imports
  const { preprocessMkdocsAdmonitions: admonitions } = require("./admonitions");
  const { preprocessMathFixup: mathFixup } = require("./math-fixup");

  let result = markdown;
  result = admonitions(result);
  result = mathFixup(result);
  return result;
}
