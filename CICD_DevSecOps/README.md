# CI/CD + DevSecOps Pipeline

Node.js/Express service with a GitHub Actions pipeline that builds, tests, security-scans, containerizes and deploys to Kubernetes.

## Flow

```
Code → Build → Unit Test → SAST → SCA → Secret Scan → Docker Build
     → Image Scan → Security Gate → Push Image (GHCR) → Deploy (Kubernetes)
```

| Stage | Tool | Fails when |
|---|---|---|
| Build | `npm ci` + `scripts/build.js` | syntax/build error |
| Unit test | Jest + Supertest | test fails or coverage < 80% |
| SAST | Semgrep (JS, Node, OWASP rules + `.semgrep/custom.yml`) | any finding |
| SCA | `npm audit` + Trivy fs | HIGH/CRITICAL dependency vuln |
| Secret scan | Gitleaks (full history) | any secret detected |
| Docker build | Buildx, multi-stage, non-root | build error |
| Image scan | Trivy | HIGH/CRITICAL (fixable) CVE in image |
| Security gate | `security-gate` job | any scan job not `success` |
| Push | GHCR (`:sha` and `:latest`) | main branch only, after gate |
| Deploy | kubectl + kustomize, rollout check, auto-rollback | rollout not ready in 120s |

The image is built once, saved as an artifact, scanned, and then the *same* image is pushed — so what was scanned is what ships.
PRs run everything up to the gate; push and deploy happen only on `main`.

## Layout

```
src/ test/ scripts/     app, unit tests, build script
Dockerfile              multi-stage, non-root, healthcheck
k8s/                    namespace, deployment, service, kustomization
.github/workflows/      ci-cd.yml
.gitleaks.toml  .trivyignore  .semgrep/custom.yml
```

## Setup

1. Push to a GitHub repo. GHCR uses the built-in `GITHUB_TOKEN`; no registry secret needed.
2. Create a GitHub **Environment** named `production` (add required reviewers for manual approval).
3. Add secret `KUBE_CONFIG_B64`: `base64 < ~/.kube/config` (use a namespace-scoped service account in real use).
4. If the cluster is private for the image, create an `imagePullSecret` or make the GHCR package public.

## Run locally

```bash
npm ci && npm run build && npm test
docker build -t devsecops-demo . && docker run -p 3000:3000 devsecops-demo
curl localhost:3000/healthz
```

## Hardening notes

- Container: non-root, read-only root FS, all capabilities dropped, seccomp RuntimeDefault, restricted Pod Security namespace.
- Action versions are tag-pinned; for stricter supply-chain control pin to commit SHAs.
- Accepted risks go in `.trivyignore` with justification and expiry.
