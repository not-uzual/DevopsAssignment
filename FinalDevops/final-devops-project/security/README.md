# Security (DevSecOps)

| Control | Tool | Config | Blocks pipeline when |
|---|---|---|---|
| SAST | Semgrep | [semgrep-rules.yml](semgrep-rules.yml) + registry packs | any finding |
| SCA | `npm audit`, Trivy fs | [.trivyignore](.trivyignore) | HIGH/CRITICAL dependency vuln |
| Secret scanning | Gitleaks (full history) | [gitleaks.toml](gitleaks.toml) | any secret |
| IaC / K8s misconfig | Trivy config | | HIGH/CRITICAL misconfig (Terraform, Helm, manifests, Dockerfile) |
| Image scanning | Trivy image | [.trivyignore](.trivyignore) | fixable HIGH/CRITICAL CVE |
| **Security gate** | `security-gate` job | `.github/workflows/ci-cd.yml` | any job above is not `success`; push and deploy never run |

Runtime hardening: non-root user, read-only root filesystem, all capabilities dropped, seccomp RuntimeDefault,
restricted Pod Security namespace, no service account token, resource limits, API key from a Secret (not in the image or ConfigMap).

Known gaps to close for production: pin Actions by commit SHA, sign images (cosign) and verify at admission,
use an external secret manager instead of `kubernetes/secret.yaml`, add NetworkPolicies.
