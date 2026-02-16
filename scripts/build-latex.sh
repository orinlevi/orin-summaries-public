#!/bin/bash
# Build all LaTeX projects and copy PDFs to public/assets for download
#
# Usage: ./scripts/build-latex.sh [course-id]
#   No args = build all courses
#   With arg = build specific course (e.g., ./scripts/build-latex.sh discrete1)
#
# Requirements: xelatex (from MacTeX or TeX Live)

set -e

CONTENT_DIR="$(cd "$(dirname "$0")/../apps/web/content" && pwd)"
ASSETS_DIR="$(cd "$(dirname "$0")/../apps/web/public/assets" && pwd)"

build_course() {
  local course="$1"
  local latex_dir="$CONTENT_DIR/$course/latex"

  if [ ! -f "$latex_dir/main.tex" ]; then
    echo "  ⏭  $course: no LaTeX project, skipping"
    return
  fi

  echo "  🔨 $course: compiling..."
  cd "$latex_dir"

  # Run xelatex twice for TOC/references
  xelatex -interaction=nonstopmode main.tex > /dev/null 2>&1 || true
  xelatex -interaction=nonstopmode main.tex > /dev/null 2>&1 || true

  if [ -f main.pdf ]; then
    mkdir -p "$ASSETS_DIR/$course"
    cp main.pdf "$ASSETS_DIR/$course/${course}_latex_summary.pdf"
    echo "  ✅ $course: PDF copied to public/assets/$course/${course}_latex_summary.pdf"
  else
    echo "  ❌ $course: compilation failed"
  fi

  # Clean build artifacts
  rm -f main.aux main.log main.out main.toc main.fls main.fdb_latexmk main.xdv main.synctex.gz missfont.log 2>/dev/null
}

echo "📄 Building LaTeX summaries..."
echo ""

COURSES="discrete1 discrete2 calculus1b calculus2b lini1b lini2b cs1001 statistics1 neuroscience intro-psychology"

if [ -n "$1" ]; then
  build_course "$1"
else
  for course in $COURSES; do
    build_course "$course"
  done
fi

echo ""
echo "Done!"
