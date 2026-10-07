# Troubleshooting Challenge: Answer Key (instructors)

Every fix below was applied in order on minikube and verified; the real command output is in
[../docs/evidence-troubleshooting.txt](../docs/evidence-troubleshooting.txt).

| # | Symptom | Where to look | Root cause | Fix | Prevention |
|---|---|---|---|---|---|
| 1 | Pod `Pending`, PVC `Pending` | `describe pvc` -> `storageclass "fast-ssd" not found`; `kubectl get storageclass` | PVC requests a StorageClass that doesn't exist in the cluster | PVC spec is immutable: scale deploy to 0, delete the PVC, recreate with `storageClassName: standard` (or omit it to use the default) | Omit `storageClassName` unless needed; parameterize it in Helm (`persistence.storageClass`) |
| 2 | `ErrImagePull` / `ImagePullBackOff` | `describe pod` events: `Failed to pull image "notes-api:v1.0.0"` | Tag doesn't exist (image was built as `v1`) | `kubectl set image deploy/notes-api notes-api=notes-api:v1` | Deploy immutable tags written by CI (commit SHA); never hand-type tags |
| 3 | `CreateContainerConfigError` | `describe pod`: `secret "notes-api-secrets" not found`; `get secret` shows `notes-api-secret` | Typo in `envFrom.secretRef.name` | Patch the name to `notes-api-secret` | `helm template`/`kubectl --dry-run=server`, Helm helper templates for names |
| 4 | `CrashLoopBackOff` | `describe pod` -> Last State `OOMKilled`, exit code 137; `logs --previous` is empty | Memory limit 10Mi is smaller than a Node.js process needs | Request 64Mi / limit 128Mi | Size from `kubectl top`/Prometheus; alert on `NotesApiMemoryNearLimit` and restarts |
| 5 | Pod `Running` but `0/1` Ready | `describe pod` -> `Readiness probe failed: HTTP probe failed with statuscode: 404` | Probe path `/ready`; the app serves `/readyz` | Patch probe path to `/readyz` | Keep probe paths in one place (chart values); test probe endpoints in unit tests (done: `GET /readyz`) |
| 6 | Pod Ready, Service has no endpoints | `get endpoints notes-api` -> `<none>`; compare `svc` selector with `get pod --show-labels` | Service selector `app: notes-app` doesn't match pod label `app: notes-api` | Patch selector to `app: notes-api` | Generate selector and labels from the same Helm helper (`notes-api.selectorLabels`) |
| 7 | Ingress returns `503` | `describe ingress` -> `services "notes-api-svc" not found`; `get svc` | Ingress backend names a Service that doesn't exist | Patch backend to `notes-api` | Same: derive names from one template; smoke test via the Ingress in CI/CD |

## Discovery order (why faults hide each other)
Scheduling (1) -> image pull (2) -> container creation/config (3) -> process runs (4) -> readiness (5) -> Service routing (6) -> Ingress (7).
Follow the request path in the opposite direction for runtime issues: **Ingress -> Service -> Endpoints -> Pod -> Container -> Node/Storage**.

## Bonus note found while building the project
The first version of the broken manifest reused host `notes.local`. The ingress-nginx admission webhook rejected the Ingress
because the host+path already belonged to another namespace's Ingress (`host "notes.local" and path "/" is already defined`).
This is a real production gotcha; the challenge now uses `notes-broken.local`.

## Verify (all must hold)
```bash
kubectl -n devops-final-broken get pods                       # 1/1 Running, 0 restarts
kubectl -n devops-final-broken get endpoints notes-api        # has an IP:3000
curl -H 'Host: notes-broken.local' localhost:8082/            # 200
KEY=$(kubectl -n devops-final-broken get secret notes-api-secret -o jsonpath='{.data.API_KEY}' | base64 -d)
curl -XPOST -H "x-api-key: $KEY" -H 'content-type: application/json' -H 'Host: notes-broken.local' -d '{"text":"fixed"}' localhost:8082/notes   # 201
```

## Extension ideas
- Add a CI fault: break a unit test, introduce a vulnerable dependency, or commit a fake AWS key and watch the security gate block the pipeline.
- Add a GitOps fault: `kubectl edit` a live Deployment and watch Argo CD self-heal it.
- Add a monitoring fault: make `/readyz` fail by making `/data` read-only and trace it through alerts.
