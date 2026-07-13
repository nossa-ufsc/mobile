#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(pwd)"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="${1:-production}"
SUBMIT="${2:-}"

ENV_FILE="$ROOT/.env.apple"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
  if [[ "${ASC_ISSUER_ID:-FILL_ME_IN}" != "FILL_ME_IN" ]]; then
    export EXPO_ASC_API_KEY_PATH="$ASC_KEY_PATH"
    export EXPO_ASC_KEY_ID="$ASC_KEY_ID"
    export EXPO_ASC_ISSUER_ID="$ASC_ISSUER_ID"
    export EXPO_APPLE_TEAM_ID="$APPLE_TEAM_ID"
    export EXPO_APPLE_TEAM_TYPE="$APPLE_TEAM_TYPE"
  else
    echo "⚠️  ASC_ISSUER_ID not set in .env.apple — falling back to interactive Apple login"
  fi
fi

eas build -p ios --profile "$PROFILE" --local

if [[ "$SUBMIT" == "--submit" ]]; then
  bash "$ROOT/scripts/ios-submit.sh" "$APP_DIR"
fi
