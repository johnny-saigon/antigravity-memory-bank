#!/usr/bin/env bash

# Antigravity Memory Bank — Universal On-the-Fly Installer
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/johnny-saigon/antigravity-memory-bank/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/johnny-saigon/antigravity-memory-bank/main/install.sh | bash -s -- --yes

set -e

REPO_URL="https://github.com/johnny-saigon/antigravity-memory-bank.git"
INSTALL_DIR=$(pwd)

echo "🧠 Initializing Antigravity Memory Bank in: ${INSTALL_DIR}"

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Error: Node.js (>= 18.0.0) is required to run the installer."
  exit 1
fi

TEMP_CLONE="/tmp/antigravity-memory-bank-$$"
mkdir -p "${TEMP_CLONE}"

cleanup() {
  rm -rf "${TEMP_CLONE}"
}
trap cleanup EXIT INT TERM

# If this script is executed from inside the cloned repo
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
if [ -f "${SCRIPT_DIR}/bin/cli.mjs" ]; then
  node "${SCRIPT_DIR}/bin/cli.mjs" "$@"
else
  # Remote invocation via curl | bash
  git clone --depth=1 "${REPO_URL}" "${TEMP_CLONE}" >/dev/null 2>&1
  cd "${INSTALL_DIR}"
  node "${TEMP_CLONE}/bin/cli.mjs" "$@"
fi
