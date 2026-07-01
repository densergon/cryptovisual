#!/bin/bash
# Bundle budget check for CI
# Checks that built JS chunks are within acceptable size limits (gzipped)

set -e

BUILD_DIR="dist"
MAX_MAIN_SIZE_KB=250
MAX_PIXI_SIZE_KB=800

if [ ! -d "$BUILD_DIR" ]; then
  echo "Build directory not found. Run 'pnpm build' first."
  exit 1
fi

echo "Checking bundle budgets..."
echo ""

# Check if gzip is available
if command -v gzip &> /dev/null; then
  USE_GZIP=true
  echo "Using gzip compression for accurate size check"
else
  USE_GZIP=false
  echo "gzip not available; using raw file sizes (less accurate)"
fi
echo ""

total_main=0
total_pixi=0

for f in "$BUILD_DIR"/assets/*.js; do
  if [ "$USE_GZIP" = true ]; then
    gz_size=$(gzip -c "$f" | wc -c | tr -d ' ')
    size_kb=$((gz_size / 1024))
  else
    raw_size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null)
    size_kb=$((raw_size / 1024))
  fi

  filename=$(basename "$f")

  if echo "$filename" | grep -q "pixi"; then
    total_pixi=$((total_pixi + size_kb))
    echo "  [PIXI] $filename: ${size_kb}KB (gzipped)"
  elif echo "$filename" | grep -q "gsap\|motion"; then
    total_main=$((total_main + size_kb))
    echo "  [VENDOR] $filename: ${size_kb}KB (gzipped)"
  else
    total_main=$((total_main + size_kb))
    echo "  [MAIN] $filename: ${size_kb}KB (gzipped)"
  fi
done

echo ""
echo "Summary:"
echo "  Main JS (excl. PixiJS): ${total_main}KB gzipped (limit: ${MAX_MAIN_SIZE_KB}KB)"
echo "  PixiJS: ${total_pixi}KB gzipped (limit: ${MAX_PIXI_SIZE_KB}KB)"
echo ""

if [ "$total_main" -gt "$MAX_MAIN_SIZE_KB" ]; then
  echo "FAIL: Main JS bundle too large (${total_main}KB > ${MAX_MAIN_SIZE_KB}KB limit)"
  exit 1
fi

if [ "$total_pixi" -gt "$MAX_PIXI_SIZE_KB" ]; then
  echo "FAIL: PixiJS bundle too large (${total_pixi}KB > ${MAX_PIXI_SIZE_KB}KB limit)"
  exit 1
fi

echo "PASS: All bundle budgets OK"
