#!/usr/bin/env bash
set -euo pipefail

echo "Running npm audit..."
npm audit --audit-level=moderate || true

echo "(Optional) Run trivy container scan if trivy is installed"
if command -v trivy >/dev/null 2>&1; then
  trivy fs --severity HIGH,CRITICAL . || true
else
  echo "trivy not found; skipping container/image scan"
fi

echo "Done"
