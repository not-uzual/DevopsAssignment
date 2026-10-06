# CI/CD with GitHub Actions

Small project: a Python calculator (`app.py`) with tests, a GitHub Actions workflow (`.github/workflows/ci.yml`) and scripts that run the same stages locally. All commands below were run for real; the output is shown under each command.

## CI vs CD

- **CI (Continuous Integration):** every change is automatically built, linted and tested, so broken code is caught early.
- **CD (Continuous Delivery):** the verified build is packaged and always ready to release, with a manual approval before production.
- **CD (Continuous Deployment):** the same, but production release is automatic once the pipeline passes.

CI — `scripts/ci.sh` (lint + test):

```sh
bash scripts/ci.sh
```

```text
[CI] lint
flake8: no issues
[CI] test
....                                                                     [100%]

--------- coverage: platform darwin, python 3.11.16-final-0 ----------
Name     Stmts   Miss  Cover   Missing
--------------------------------------
app.py       8      0   100%
--------------------------------------
TOTAL        8      0   100%

4 passed in 0.01s
[CI] result: code verified
```

CD, Continuous Delivery — `scripts/cd.sh` (package, deploy to staging, wait for approval):

```sh
bash scripts/cd.sh
```

```text
[CD] build package
total 8
-rw-r--r--@ 1 ujjwalsahu  staff  485 Oct  7 05:21 calc-app.zip
[CD] deploy to staging
[CD] health check
health ok: add(2,3) = 5
[CD] waiting for manual approval before production (Continuous Delivery)
```

CD, Continuous Deployment — `scripts/cd.sh deployment` (auto-promote):

```sh
bash scripts/cd.sh deployment
```

```text
[CD] build package
total 8
-rw-r--r--@ 1 ujjwalsahu  staff  485 Oct  7 05:21 calc-app.zip
[CD] deploy to staging
[CD] health check
health ok: add(2,3) = 5
[CD] auto-promoted to production (Continuous Deployment)
```

## CI/CD pipeline

A pipeline is an automated sequence of stages that takes code from commit to release; a failing stage stops it.

```text
commit -> checkout -> build -> lint -> test -> artifacts -> deploy
```

Full pipeline run, stage by stage (`scripts/pipeline.sh`):

```sh
bash scripts/pipeline.sh
```

```text
=== STAGE 1: checkout ===
3b77c72 session 15: HELM
=== STAGE 2: build (install dependencies) ===
dependencies installed
=== STAGE 3: lint + test ===
[CI] lint
flake8: no issues
[CI] test
....                                                                     [100%]

--------- coverage: platform darwin, python 3.11.16-final-0 ----------
Name     Stmts   Miss  Cover   Missing
--------------------------------------
app.py       8      0   100%
--------------------------------------
TOTAL        8      0   100%

4 passed in 0.01s
[CI] result: code verified
=== STAGE 4: artifacts ===
total 8
-rw-r--r--@ 1 ujjwalsahu  staff  526 Oct  7 05:21 results.xml
=== STAGE 5: deploy ===
[CD] build package
total 8
-rw-r--r--@ 1 ujjwalsahu  staff  485 Oct  7 05:21 calc-app.zip
[CD] deploy to staging
[CD] health check
health ok: add(2,3) = 5
[CD] auto-promoted to production (Continuous Deployment)
=== PIPELINE SUCCEEDED ===

[notice] A new release of pip is available: 24.0 -> 26.2.1
[notice] To update, run: pip install --upgrade pip
```

## GitHub Actions

GitHub's built-in CI/CD service. Pipelines are YAML files in `.github/workflows/` and run automatically on events (push, pull request, manual, schedule) on GitHub-hosted machines.

## Workflow

A workflow is one YAML file — here [.github/workflows/ci.yml](.github/workflows/ci.yml) — with a name, triggers (`on:`) and jobs.

```sh
cat .github/workflows/ci.yml
```

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

env:
  APP_NAME: calc-app

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install flake8
        run: pip install flake8==6.1.0
      - name: Run flake8
        run: flake8 app.py tests/

  test:
    name: Test (Python ${{ matrix.python-version }})
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        python-version: ['3.10', '3.11']
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests with coverage
        run: python -m pytest tests/ --junitxml=test-results/results.xml --cov=app --cov-report=xml:coverage.xml --cov-report=term-missing
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-py${{ matrix.python-version }}
          path: |
            test-results/
            coverage.xml
          retention-days: 7

  build:
    name: Build package
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Build distributable package
        run: |
          mkdir -p dist
          zip -r dist/${{ env.APP_NAME }}-${{ github.sha }}.zip app.py requirements.txt
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-package
          path: dist/
          retention-days: 7

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: build-package
          path: dist/
      - name: Deploy using a secret
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        run: |
          echo "Deploying package to server..."
          echo "Token length: ${#DEPLOY_TOKEN}"   # the token value itself is masked as *** in logs
```

## Jobs and steps

A **job** is a group of steps that runs on one runner; jobs run in parallel unless `needs:` orders them. A **step** is a single task: either `uses:` a ready-made action or `run:` a shell command. Structure of this workflow:

```sh
python scripts/describe_workflow.py
```

```text
Workflow : CI/CD Pipeline
Triggers : push, pull_request, workflow_dispatch

Job 'lint'  runner: ubuntu-latest  needs: -
   step 1: Checkout code  (uses actions/checkout@v4)
   step 2: Set up Python  (uses actions/setup-python@v5)
   step 3: Install flake8  (run)
   step 4: Run flake8  (run)
Job 'test'  runner: ubuntu-latest  needs: lint
   matrix: {'python-version': ['3.10', '3.11']}
   step 1: Checkout code  (uses actions/checkout@v4)
   step 2: Set up Python ${{ matrix.python-version }}  (uses actions/setup-python@v5)
   step 3: Install dependencies  (run)
   step 4: Run tests with coverage  (run)
   step 5: Upload test results  (uses actions/upload-artifact@v4)
Job 'build'  runner: ubuntu-latest  needs: test
   step 1: Checkout code  (uses actions/checkout@v4)
   step 2: Build distributable package  (run)
   step 3: Upload build artifact  (uses actions/upload-artifact@v4)
Job 'deploy'  runner: ubuntu-latest  needs: build
   step 1: Download build artifact  (uses actions/download-artifact@v4)
   step 2: Deploy using a secret  (run)
```

Here: `lint -> test (matrix) -> build -> deploy`.

## Runners

A runner is the machine that executes a job. `runs-on: ubuntu-latest` uses a GitHub-hosted Linux VM; self-hosted runners are your own machines. A `matrix` runs the same job for several Python versions (see the `test` job above). The local machine plays the runner here:

```sh
uname -sm
```

```text
Darwin arm64
```

## Secrets

Secrets are encrypted values (tokens, passwords) stored in the repo under *Settings -> Secrets and variables -> Actions* and read as `${{ secrets.NAME }}`. They are never committed, and GitHub masks their value as `***` in logs.

```sh
grep -n 'secrets\.' .github/workflows/ci.yml
```

```text
88:          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

The deploy step run locally with a dummy token:

```sh
DEPLOY_TOKEN=abc123xyz bash -c 'echo "Deploying package to server..."; echo "Token length: ${#DEPLOY_TOKEN}"'
```

```text
Deploying package to server...
Token length: 9
```

## Artifacts

Artifacts are files produced by a job (test reports, build packages) that are kept after the job ends and shared with later jobs via `upload-artifact` / `download-artifact`.

```sh
ls -l test-results coverage.xml
```

```text
-rw-r--r--@ 1 ujjwalsahu  staff  1051 Oct  7 05:21 coverage.xml

test-results:
total 8
-rw-r--r--@ 1 ujjwalsahu  staff  526 Oct  7 05:21 results.xml
```

```sh
mkdir -p dist && zip -r dist/calc-app.zip app.py requirements.txt
```

```text
  adding: app.py (deflated 36%)
  adding: requirements.txt (deflated 13%)
```

```sh
unzip -l dist/calc-app.zip
```

```text
Archive:  dist/calc-app.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
      173  10-07-2026 05:20   app.py
       60  10-07-2026 05:21   requirements.txt
---------                     -------
      233                     2 files
```

## Build

Build = install dependencies and produce the deployable package.

```sh
python3 -m venv .venv
```

```sh
source .venv/bin/activate
```

```sh
pip install -r requirements.txt
```

```text
Collecting pytest==7.4.0 (from -r requirements.txt (line 1))
  Downloading pytest-7.4.0-py3-none-any.whl.metadata (8.0 kB)
Collecting pytest-cov==4.1.0 (from -r requirements.txt (line 2))
  Downloading pytest_cov-4.1.0-py3-none-any.whl.metadata (26 kB)
Collecting flake8==6.1.0 (from -r requirements.txt (line 3))
  Downloading flake8-6.1.0-py2.py3-none-any.whl.metadata (3.8 kB)
Collecting pyyaml==6.0.1 (from -r requirements.txt (line 4))
  Downloading PyYAML-6.0.1-cp311-cp311-macosx_11_0_arm64.whl.metadata (2.1 kB)
Collecting iniconfig (from pytest==7.4.0->-r requirements.txt (line 1))
  Downloading iniconfig-2.3.1-py3-none-any.whl.metadata (2.8 kB)
Collecting packaging (from pytest==7.4.0->-r requirements.txt (line 1))
  Downloading packaging-26.3-py3-none-any.whl.metadata (3.5 kB)
Collecting pluggy<2.0,>=0.12 (from pytest==7.4.0->-r requirements.txt (line 1))
  Downloading pluggy-1.6.0-py3-none-any.whl.metadata (4.8 kB)
Collecting coverage>=5.2.1 (from coverage[toml]>=5.2.1->pytest-cov==4.1.0->-r requirements.txt (line 2))
  Downloading coverage-7.16.2-cp311-cp311-macosx_11_0_arm64.whl.metadata (8.2 kB)
Collecting mccabe<0.8.0,>=0.7.0 (from flake8==6.1.0->-r requirements.txt (line 3))
  Downloading mccabe-0.7.0-py2.py3-none-any.whl.metadata (5.0 kB)
Collecting pycodestyle<2.12.0,>=2.11.0 (from flake8==6.1.0->-r requirements.txt (line 3))
  Downloading pycodestyle-2.11.1-py2.py3-none-any.whl.metadata (4.5 kB)
Collecting pyflakes<3.2.0,>=3.1.0 (from flake8==6.1.0->-r requirements.txt (line 3))
  Downloading pyflakes-3.1.0-py2.py3-none-any.whl.metadata (3.5 kB)
Downloading pytest-7.4.0-py3-none-any.whl (323 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 323.6/323.6 kB 4.9 MB/s eta 0:00:00
Downloading pytest_cov-4.1.0-py3-none-any.whl (21 kB)
Downloading flake8-6.1.0-py2.py3-none-any.whl (58 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 58.3/58.3 kB 5.8 MB/s eta 0:00:00
Downloading PyYAML-6.0.1-cp311-cp311-macosx_11_0_arm64.whl (167 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 167.5/167.5 kB 6.7 MB/s eta 0:00:00
Downloading coverage-7.16.2-cp311-cp311-macosx_11_0_arm64.whl (224 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 224.3/224.3 kB 14.6 MB/s eta 0:00:00
Downloading mccabe-0.7.0-py2.py3-none-any.whl (7.3 kB)
Downloading pluggy-1.6.0-py3-none-any.whl (20 kB)
Downloading pycodestyle-2.11.1-py2.py3-none-any.whl (31 kB)
Downloading pyflakes-3.1.0-py2.py3-none-any.whl (62 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 62.6/62.6 kB 5.4 MB/s eta 0:00:00
Downloading iniconfig-2.3.1-py3-none-any.whl (7.6 kB)
Downloading packaging-26.3-py3-none-any.whl (129 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 130.0/130.0 kB 16.6 MB/s eta 0:00:00
Installing collected packages: pyyaml, pyflakes, pycodestyle, pluggy, packaging, mccabe, iniconfig, coverage, pytest, flake8, pytest-cov
Successfully installed coverage-7.16.2 flake8-6.1.0 iniconfig-2.3.1 mccabe-0.7.0 packaging-26.3 pluggy-1.6.0 pycodestyle-2.11.1 pyflakes-3.1.0 pytest-7.4.0 pytest-cov-4.1.0 pyyaml-6.0.1

[notice] A new release of pip is available: 24.0 -> 26.2.1
[notice] To update, run: pip install --upgrade pip
```

```sh
python --version
```

```text
Python 3.11.16
```

```sh
pip list | grep -E 'pytest|flake8|PyYAML'
```

```text
flake8      6.1.0
pytest      7.4.0
pytest-cov  4.1.0
PyYAML      6.0.1

[notice] A new release of pip is available: 24.0 -> 26.2.1
[notice] To update, run: pip install --upgrade pip
```

## Test

Lint, then unit tests, then tests with coverage and reports:

```sh
flake8 app.py tests/; echo "exit code: $?"
```

```text
exit code: 0
```

```sh
python -m pytest tests/ -v
```

```text
============================= test session starts ==============================
platform darwin -- Python 3.11.16, pytest-7.4.0, pluggy-1.6.0 -- /Users/ujjwalsahu/Development/Ujjwal/Devops/Assignments/CICD_GHActions/.venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/ujjwalsahu/Development/Ujjwal/Devops/Assignments/CICD_GHActions
plugins: cov-4.1.0
collecting ... collected 4 items

tests/test_app.py::test_add PASSED                                       [ 25%]
tests/test_app.py::test_subtract PASSED                                  [ 50%]
tests/test_app.py::test_divide PASSED                                    [ 75%]
tests/test_app.py::test_divide_by_zero PASSED                            [100%]

============================== 4 passed in 0.01s ===============================
```

```sh
python -m pytest tests/ --junitxml=test-results/results.xml --cov=app --cov-report=xml:coverage.xml --cov-report=term-missing
```

```text
============================= test session starts ==============================
platform darwin -- Python 3.11.16, pytest-7.4.0, pluggy-1.6.0
rootdir: /Users/ujjwalsahu/Development/Ujjwal/Devops/Assignments/CICD_GHActions
plugins: cov-4.1.0
collected 4 items

tests/test_app.py ....                                                   [100%]

- generated xml file: /Users/ujjwalsahu/Development/Ujjwal/Devops/Assignments/CICD_GHActions/test-results/results.xml -

--------- coverage: platform darwin, python 3.11.16-final-0 ----------
Name     Stmts   Miss  Cover   Missing
--------------------------------------
app.py       8      0   100%
--------------------------------------
TOTAL        8      0   100%
Coverage XML written to file coverage.xml

============================== 4 passed in 0.03s ===============================
```

## Pipeline execution

On GitHub the pipeline runs automatically when this folder is pushed as a repository (the workflow file must be at the repo root's `.github/workflows/`). The same stages were run locally above with `bash scripts/pipeline.sh`.
