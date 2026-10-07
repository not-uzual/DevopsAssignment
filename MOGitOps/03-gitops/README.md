# Task 3: GitOps

## What is GitOps?
GitOps is an operating model where **Git is the single source of truth for the desired state of infrastructure and applications**, and an automated agent continuously makes the live system match Git. You change a system by changing Git (a pull request), not by running `kubectl apply` or clicking in a console. The term was coined by Weaveworks; the CNCF **OpenGitOps** project defines four principles.

## The four principles (OpenGitOps)
1. **Declarative**: the system is described by *what* it should be (YAML/Helm/Kustomize), not step-by-step commands.
2. **Versioned and immutable**: desired state lives in Git, giving history, review, audit trail and easy rollback.
3. **Pulled automatically**: an agent in the cluster pulls the desired state from Git; CI does not push to the cluster.
4. **Continuously reconciled**: the agent compares desired vs actual state in a loop and corrects drift.

## Git as the source of truth
- Every change is a commit; every commit has an author, a reason and a review (PR, approvals, CODEOWNERS).
- `git log` is the audit trail; `git revert` is the rollback.
- Disaster recovery: a new cluster can be rebuilt by pointing an agent at the repo.
- Access: engineers need Git access, not cluster credentials; the cluster credentials stay inside the cluster.
- Secrets must **not** be stored in plain text: use Sealed Secrets, SOPS, or External Secrets Operator.

## Declarative configuration
Imperative: `kubectl scale deploy web --replicas=5`. Declarative:
```yaml
spec:
  replicas: 5
```
Tools for composing declarative config: plain YAML, **Kustomize** (overlays per environment), **Helm** (templated charts). The system figures out the diff and how to reach the state; applying twice is safe (idempotent).

## Continuous reconciliation
The controller runs a loop: **observe** live state -> **diff** against Git -> **act** to converge.
- **Drift detection**: someone runs `kubectl edit` or deletes a resource by hand; the agent notices.
- **Self-heal**: it reverts the manual change (Argo CD `selfHeal: true`).
- **Prune**: resources removed from Git are deleted from the cluster (`prune: true`).
- Sync status: **Synced / OutOfSync**; health: **Healthy / Progressing / Degraded**.
This is the same pattern Kubernetes itself uses (controllers reconciling spec vs status), extended to cover the whole environment.

## GitOps workflow

```
 Developer                     CI pipeline                       Config repo (Git)              Cluster
     |  1. push app code          |                                     |                           |
     |--------------------------->| 2. build, test, scan                |                           |
     |                            | 3. push image :sha to registry      |                           |
     |                            | 4. update image tag in manifests -->| (commit / PR)             |
     |                            |                                     |                           |
     |                                                                  |<-- 5. Argo CD / Flux pulls|
     |                                                                  |    detects new commit     |
     |                                                                  |        6. apply, reconcile|
     |                                                                  |        7. report health ->|
```
1. Developer merges code; 2. CI builds, tests and scans (see the [CI/CD DevSecOps project](../../CICD_DevSecOps)); 3. image is pushed; 4. CI (or an image-updater) bumps the tag in the **config repo**; 5. the in-cluster agent notices the new commit; 6. it applies the change and keeps it reconciled; 7. status is reported; a bad deploy is undone with `git revert`.

**CI vs CD split**: CI ends at "artifact published + manifest updated". CD is the agent. Keeping **application repo** and **config (environment) repo** separate is common: it avoids CI-loops and lets ops control what is promoted.

**Promotion**: dev -> staging -> prod by merging between folders/branches (`overlays/dev`, `overlays/prod`), with PR approval as the gate.

## Push (traditional CD) vs Pull (GitOps)
| | Push (Jenkins/GitHub Actions `kubectl apply`) | Pull (Argo CD / Flux) |
|---|---|---|
| Cluster credentials | stored in CI | stay inside the cluster |
| Drift | unnoticed until next deploy | detected and healed |
| Source of truth | pipeline run | Git |
| Rollback | re-run a pipeline | `git revert` |

## Kubernetes + GitOps

### Tools
- **Argo CD**: UI, `Application` CRD, multi-cluster, SSO/RBAC, ApplicationSets, sync waves, hooks.
- **Flux**: toolkit of controllers (source, kustomize, helm, notification, image automation), CLI/CRD-driven.
- Progressive delivery add-ons: **Argo Rollouts**, **Flagger** (canary/blue-green with metric analysis, tying GitOps back to observability).

### Hands-on with Argo CD
Install:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8080:443
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
```
This directory contains:
- [app-manifests/](app-manifests): a Kustomize app (Deployment, Service, namespace). This is what would live in the config repo.
- [argocd/application.yaml](argocd/application.yaml): the Argo CD `Application` that points at that path, with automated sync, prune and self-heal.
- [flux/](flux): the equivalent for Flux (`GitRepository` + `Kustomization`).

Steps:
1. Put `app-manifests/` in a Git repo and edit `repoURL` in `argocd/application.yaml`.
2. `kubectl apply -f argocd/application.yaml`. Argo CD deploys the app.
3. **Change via Git**: edit `replicas: 2` -> `3`, commit and push. Within ~3 minutes (or on webhook) Argo CD syncs it.
4. **Drift test**: `kubectl -n gitops-demo scale deploy/web --replicas=1`. With `selfHeal`, Argo CD sets it back to what Git says.
5. **Rollback**: `git revert <commit>` and push.

### Repository layout (typical)
```
config-repo/
  base/                  # shared manifests
  overlays/
    dev/    kustomization.yaml   # replicas: 1, image tag: dev
    prod/   kustomization.yaml   # replicas: 3, image tag: v1.4.2
  apps/                  # Argo CD Application definitions ("app of apps")
```

### Where observability meets GitOps
Dashboards, alert rules, ServiceMonitors and even the Prometheus stack itself can be deployed through GitOps, so monitoring is versioned and reviewed like everything else. In return, observability validates GitOps rollouts: Argo Rollouts/Flagger query Prometheus during a canary and abort automatically on a bad error rate.

## Benefits and challenges
**Benefits**: audit and compliance, fast reliable rollback, consistent environments, better security (no CI credentials to the cluster), self-healing, easy DR and multi-cluster management.
**Challenges**: secrets management, repo structure and promotion strategy, handling controller-managed fields (HPA replicas vs Git: use `ignoreDifferences`), initial learning curve, and propagation delay (poll interval vs webhooks).

## Status
The manifests here were rendered locally with `kubectl kustomize`; they were not applied to a live cluster, and Argo CD / Flux behavior described above is from their documented behavior, not from a run in this environment.
