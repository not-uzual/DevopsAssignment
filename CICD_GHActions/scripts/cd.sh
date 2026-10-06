#!/usr/bin/env bash
# Continuous Delivery/Deployment: package the verified code and release it
set -euo pipefail
MODE="${1:-delivery}"
echo "[CD] build package"
mkdir -p dist && rm -f dist/*.zip && zip -q dist/calc-app.zip app.py requirements.txt && ls -l dist
echo "[CD] deploy to staging"
rm -rf staging && mkdir staging && unzip -q dist/calc-app.zip -d staging
echo "[CD] health check"; (cd staging && python -c "import app; print('health ok: add(2,3) =', app.add(2, 3))")
if [ "$MODE" = "deployment" ]; then echo "[CD] auto-promoted to production (Continuous Deployment)"
else echo "[CD] waiting for manual approval before production (Continuous Delivery)"; fi
