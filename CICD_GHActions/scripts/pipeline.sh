#!/usr/bin/env bash
# Runs the whole pipeline locally, stage by stage (same stages as .github/workflows/ci.yml)
set -euo pipefail
echo "=== STAGE 1: checkout ===";  git log -1 --oneline 2>/dev/null || echo "(no git history here)"
echo "=== STAGE 2: build (install dependencies) ==="; pip install -q -r requirements.txt && echo "dependencies installed"
echo "=== STAGE 3: lint + test ==="; bash scripts/ci.sh
echo "=== STAGE 4: artifacts ==="; mkdir -p test-results && python -m pytest tests/ -q --junitxml=test-results/results.xml >/dev/null && ls -l test-results
echo "=== STAGE 5: deploy ==="; bash scripts/cd.sh deployment
echo "=== PIPELINE SUCCEEDED ==="
