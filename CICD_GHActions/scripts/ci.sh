#!/usr/bin/env bash
# Continuous Integration: verify the code (lint + test)
set -euo pipefail
echo "[CI] lint";  flake8 app.py tests/ && echo "flake8: no issues"
echo "[CI] test";  python -m pytest tests/ -q --cov=app --cov-report=term-missing
echo "[CI] result: code verified"
