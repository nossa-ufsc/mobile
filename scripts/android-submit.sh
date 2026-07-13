#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-$(pwd)}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

set -a
source "$ROOT/.env.android"
set +a

AAB="${2:-$(ls -t "$APP_DIR"/*.aab 2>/dev/null | head -1 || true)}"
if [[ -z "$AAB" ]]; then
  echo "❌ No .aab found in $APP_DIR"
  exit 1
fi

PACKAGE="$(node -p "require('$APP_DIR/app.json').expo.android.package")"

echo "📦 Submitting $AAB ($PACKAGE) to track '$PLAY_TRACK'"
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
cd "$ROOT"
fastlane android submit aab:"$AAB" package_name:"$PACKAGE"
