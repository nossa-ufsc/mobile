#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(pwd)"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="${1:-production}"
SUBMIT="${2:-}"

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"

eas build -p android --profile "$PROFILE" --local

if [[ "$SUBMIT" == "--submit" ]]; then
  bash "$ROOT/scripts/android-submit.sh" "$APP_DIR"
fi
