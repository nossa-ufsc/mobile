#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-$(pwd)}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

set -a
source "$ROOT/.env.apple"
set +a

if [[ "${ASC_ISSUER_ID:-FILL_ME_IN}" == "FILL_ME_IN" ]]; then
  echo "❌ Set ASC_ISSUER_ID in $ROOT/.env.apple (App Store Connect → Users and Access → Integrations)"
  exit 1
fi

IPA="${2:-$(ls -t "$APP_DIR"/*.ipa 2>/dev/null | head -1 || true)}"
if [[ -z "$IPA" ]]; then
  echo "❌ No .ipa found in $APP_DIR"
  exit 1
fi

echo "📦 Submitting $IPA"
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
cd "$ROOT"
fastlane ios submit ipa:"$IPA"

rm -f "$IPA"
echo "🧹 Removed $IPA"
