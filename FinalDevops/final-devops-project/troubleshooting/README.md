# Final Troubleshooting Challenge (student guide)

The application is deployed to namespace `devops-final-broken` with **seven independent faults**. Faults hide one another:
as you fix one, the next appears. Your job is to find and fix all of them using only `kubectl` evidence, and to write down what you did.

## Setup
```bash
kubectl apply -f troubleshooting/broken/app.yaml
kubectl -n devops-final-broken get all,pvc,ingress
```
(You need a cluster with the `nginx` ingress class and a default StorageClass, e.g. minikube with `minikube addons enable ingress`. The image `notes-api:v1` must exist in the cluster: `docker build -f docker/Dockerfile -t notes-api:v1 application/ && minikube image load notes-api:v1`.)

**Goal**: `curl -H "Host: notes-broken.local" http://<ingress>/notes` returns `200`, and a note can be created using the API key stored in the Secret.
(minikube: `kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8082:80`, then use `localhost:8082`.)

## Method: for every fault write down
| Step | Question |
|---|---|
| 1. Identify | What is the symptom? (`kubectl get`, STATUS, READY, RESTARTS) |
| 2. Investigate | What do `describe`, events and `logs` say? Which resource owns the problem? |
| 3. Root cause | Why is it happening, not just what is it? |
| 4. Fix | The smallest change that fixes it. Also: how do you prevent it next time? |
| 5. Verify | Which command proves it is fixed? |

## Toolbox
```bash
kubectl -n devops-final-broken get pods -o wide
kubectl -n devops-final-broken describe pod <pod>      # read the Events at the bottom
kubectl -n devops-final-broken logs <pod> [--previous]
kubectl -n devops-final-broken get events --sort-by=.lastTimestamp
kubectl -n devops-final-broken get endpoints,svc,ingress
kubectl -n devops-final-broken describe pvc <name>
kubectl -n ingress-nginx logs deploy/ingress-nginx-controller
```

## Rules
- Do not read [SOLUTIONS.md](SOLUTIONS.md) until you have tried every fault.
- Do not just `kubectl delete` and recreate everything; explain each root cause.
- To restart the exercise: `kubectl delete ns devops-final-broken` and re-apply.

## Template to document each fault
```
### Fault N: <short title>
Symptom:
Investigation (commands + key output):
Root cause:
Fix:
Verification:
Prevention:
```
