#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://arkhamdb.com"
OUT_DIR="public/images/cards"
DATA_FILE="data/cards.json"
BATCH_SIZE=100

mkdir -p "$OUT_DIR"

download_batch() {
  local urls=("$@")
  local downloaded=0
  local skipped=0
  local failed=0
  for src in "${urls[@]}"; do
    local filename
    filename=$(basename "$src")
    local dest="$OUT_DIR/$filename"
    if [[ -f "$dest" ]]; then
      ((skipped++))
      continue
    fi
    if curl -sL "${BASE_URL}${src}" -o "$dest"; then
      ((downloaded++))
    else
      echo "  FAILED: $src"
      ((failed++))
    fi
  done
  echo "$downloaded" "$skipped" "$failed"
}

process() {
  local label="$1"
  shift
  local urls=("$@")
  local total=${#urls[@]}
  local i=0
  local total_downloaded=0
  local total_skipped=0
  local total_failed=0

  echo "$label: $total images"

  while (( i < total )); do
    local batch=("${urls[@]:i:BATCH_SIZE}")
    local result
    result=$(download_batch "${batch[@]}")
    read -r downloaded skipped failed <<< "$result"
    total_downloaded=$((total_downloaded + downloaded))
    total_skipped=$((total_skipped + skipped))
    total_failed=$((total_failed + failed))
    i=$((i + BATCH_SIZE))
    local progress=$((i < total ? i : total))
    printf "\r  %d / %d  (downloaded: %d, skipped: %d, failed: %d)" \
      "$progress" "$total" "$total_downloaded" "$total_skipped" "$total_failed"
    if (( i < total )); then
      sleep 1
    fi
  done
  echo
}

mapfile -t front < <(jq -r '.[] | select(.imagesrc) | .imagesrc' "$DATA_FILE")
mapfile -t back < <(jq -r '.[] | select(.backimagesrc) | .backimagesrc' "$DATA_FILE")

process "Front images" "${front[@]}"
process "Back images" "${back[@]}"

echo "Done. $(find "$OUT_DIR" -type f | wc -l) images in $OUT_DIR"
