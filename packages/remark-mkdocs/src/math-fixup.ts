/**
 * MkDocs Math Fixup Preprocessor
 *
 * Fixes LaTeX expressions that work with MathJax but not KaTeX.
 * This is a string preprocessor, NOT a remark plugin.
 *
 * Fixes:
 * - \(...\) -> $...$ (MathJax inline math to remark-math syntax)
 * - \[...\] -> $$...$$ (MathJax display math to remark-math syntax)
 * - \begin{align} -> \begin{aligned} (KaTeX needs 'aligned' inside $$)
 * - \end{align} -> \end{aligned}
 * - \stackrel{text}{symbol} -> \overset{text}{symbol}
 * - \bold{x} -> \mathbf{x}
 * - \htext{} -> \text{} (common Hebrew text typo)
 */

export function preprocessMathFixup(markdown: string): string {
  // First: convert MathJax delimiters to remark-math delimiters
  // \(...\) -> $...$  (inline math)
  // Must be careful: \( is always LaTeX math in our content (MkDocs convention)
  let result = markdown.replace(
    /\\\((.+?)\\\)/g,
    (_, math) => `$${math}$`
  );

  // \[...\] -> $$...$$ (display math) - can be multiline
  result = result.replace(
    /\\\[([\s\S]+?)\\\]/g,
    (_, math) => `$$${math}$$`
  );

  // Then: fix KaTeX-incompatible LaTeX commands
  result = result
    .replace(/\\begin\{align\}/g, "\\begin{aligned}")
    .replace(/\\end\{align\}/g, "\\end{aligned}")
    .replace(/\\begin\{align\*\}/g, "\\begin{aligned}")
    .replace(/\\end\{align\*\}/g, "\\end{aligned}")
    .replace(/\\stackrel\{([^}]*)\}\{([^}]*)\}/g, "\\overset{$1}{$2}")
    .replace(/\\bold\{([^}]*)\}/g, "\\mathbf{$1}")
    .replace(/\\htext\{/g, "\\text{");

  // Ensure multiline display math has $$ on its own line.
  // remark-math requires $$ delimiters on their own line for multiline blocks.
  // This handles both plain lines and blockquote-prefixed lines (> ).
  // "$$\begin{aligned}" -> "$$\n\\begin{aligned}"
  // "> $$\begin{aligned}" -> "> $$\n> \\begin{aligned}"
  result = result.replace(/^((?:>\s*)*)\$\$(\\begin\{)/gm, "$1$$\n$1$2");
  result = result.replace(/^((?:>\s*)*)(\\end\{[^}]+\})\$\$\s*$/gm, "$1$2\n$1$$");

  // Convert MkDocs <figure markdown="span"> with markdown images to plain HTML
  // Pattern: <figure markdown="span">\n  ![alt](src)\n  <figcaption>text</figcaption>\n</figure>
  result = result.replace(
    /<figure\s+markdown="span">\s*\n\s*!\[([^\]]*)\]\(([^)]*)\)\s*\n\s*<figcaption>(.*?)<\/figcaption>\s*\n\s*<\/figure>/g,
    '<figure>\n  <img src="$2" alt="$1" />\n  <figcaption>$3</figcaption>\n</figure>'
  );

  return result;
}
