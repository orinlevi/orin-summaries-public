#!/bin/bash
# clean.sh — Remove build artifacts and junk from the project
# Usage: bash scripts/clean.sh
# Safe to run anytime — only deletes generated/cached files

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Cleaning $ROOT ..."

# Remove build outputs
rm -rf "$ROOT/.next" "$ROOT/.turbo" "$ROOT/dist" "$ROOT/out" "$ROOT/build"
rm -rf "$ROOT/apps/web/.next" "$ROOT/apps/web/.turbo"
rm -rf "$ROOT/packages/*/dist" "$ROOT/packages/*/.turbo"

# Remove node caches
find "$ROOT" -name ".DS_Store" -delete 2>/dev/null || true
find "$ROOT" -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find "$ROOT" -name "*.pyc" -delete 2>/dev/null || true

# Remove LaTeX artifacts (if any got in)
find "$ROOT" -name "*.aux" -o -name "*.synctex.gz" -o -name "*.fls" \
  -o -name "*.fdb_latexmk" -o -name "*.xdv" | xargs rm -f 2>/dev/null || true

echo "Done."
