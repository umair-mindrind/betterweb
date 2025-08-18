#!/usr/bin/env bash
# usage: ./extract-latest-verification.sh [path/to/laravel.log]
LOG="${1:-storage/logs/laravel.log}"

if [ ! -f "$LOG" ]; then
  echo "Log not found: $LOG" >&2
  exit 1
fi

latest=""
while IFS= read -r line; do
  # extract http(s) URLs from the line
  urls=$(printf '%s\n' "$line" | grep -Eo 'https?://[^"'"' ]+' || true)
  for u in $urls; do
    # adjust filter if your verification link has a different pattern
    if printf '%s\n' "$u" | grep -Ei 'email/verify|/verify|verification' >/dev/null; then
      latest="$u"
    fi
  done
done < "$LOG"

if [ -z "$latest" ]; then
  echo "No verification link found in $LOG" >&2
  exit 2
fi

printf '%s\n' "$latest"
