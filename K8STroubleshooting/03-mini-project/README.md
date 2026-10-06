# Task 3: Kubernetes Troubleshooting Mini Project

## 1. Deploy the application

```sh
kubectl apply -f deployment.yaml
```

![kubectl apply -f deployment.yaml](screenshots/01-kubectl-apply-f-deployment-yaml.png)

```sh
kubectl apply -f service.yaml
```

![kubectl apply -f service.yaml](screenshots/02-kubectl-apply-f-service-yaml.png)

```sh
kubectl get pods
```

![kubectl get pods](screenshots/03-kubectl-get-pods.png)

```sh
kubectl get service
```

![kubectl get service](screenshots/04-kubectl-get-service.png)

## 2. Check the application

```sh
kubectl get pods -o wide
```

![kubectl get pods -o wide](screenshots/05-kubectl-get-pods-o-wide.png)

```sh
kubectl describe pod -l app=troubleshooting-app
```

![kubectl describe pod -l app=troubleshooting-app](screenshots/06-kubectl-describe-pod-l-app-troubleshooti.png)

```sh
kubectl logs deploy/troubleshooting-app
```

![kubectl logs deploy/troubleshooting-app](screenshots/07-kubectl-logs-deploy-troubleshooting-app.png)

```sh
kubectl exec deploy/troubleshooting-app -- curl -s localhost
```

![kubectl exec deploy/troubleshooting-app -- curl -s localhost](screenshots/08-kubectl-exec-deploy-troubleshooting-app.png)

## 3. Check the Service

```sh
kubectl describe service troubleshooting-service
```

![kubectl describe service troubleshooting-service](screenshots/09-kubectl-describe-service-troubleshooting.png)

## 4. Check endpoints

```sh
kubectl get endpoints troubleshooting-service
```

![kubectl get endpoints troubleshooting-service](screenshots/10-kubectl-get-endpoints-troubleshooting-se.png)

## 5. Create a broken Pod

```sh
kubectl apply -f broken-pod.yaml
```

![kubectl apply -f broken-pod.yaml](screenshots/11-kubectl-apply-f-broken-pod-yaml.png)

```sh
kubectl get pod project-broken-pod
```

![kubectl get pod project-broken-pod](screenshots/12-kubectl-get-pod-project-broken-pod.png)

## 6. Troubleshoot it

```sh
kubectl describe pod project-broken-pod
```

![kubectl describe pod project-broken-pod](screenshots/13-kubectl-describe-pod-project-broken-pod.png)

## 7. Answers

**Question 1:** What is the Pod status?  
*Answer:* `ErrImagePull`, which then changes to `ImagePullBackOff`.

**Question 2:** What is the actual error?  
*Answer:* The kubelet cannot pull the image `nginx:this-tag-does-not-exist` — the tag was not found in the registry.

**Question 3:** Which command helped you find the reason?  
*Answer:* `kubectl describe pod project-broken-pod` — the Events section shows the failed pull.

**Question 4:** What is wrong with the image?  
*Answer:* The tag `this-tag-does-not-exist` does not exist for the `nginx` image.

**Question 5:** How would you fix it?  
*Answer:* Use a valid tag, e.g. `kubectl set image pod/project-broken-pod app=nginx:1.27`.

## 8. Service troubleshooting challenge

```sh
kubectl patch service troubleshooting-service -p '{"spec":{"selector":{"app":"wrong-app"}}}'
```

![kubectl patch service troubleshooting-service -p '{"spec":{"selector":{"app":"wrong-app"}}}'](screenshots/14-kubectl-patch-service-troubleshooting-se.png)

```sh
kubectl get service
```

![kubectl get service](screenshots/15-kubectl-get-service.png)

```sh
kubectl get endpoints troubleshooting-service
```

![kubectl get endpoints troubleshooting-service](screenshots/16-kubectl-get-endpoints-troubleshooting-se.png)

## 9. Find the root cause

```sh
kubectl get pods --show-labels
```

![kubectl get pods --show-labels](screenshots/17-kubectl-get-pods-show-labels.png)

```sh
kubectl describe service troubleshooting-service
```

![kubectl describe service troubleshooting-service](screenshots/18-kubectl-describe-service-troubleshooting.png)

The Pods are labelled `app=troubleshooting-app` but the Service selector is `app=wrong-app`, so no Pods match and the endpoints are `<none>`.

## Fix and verify

```sh
kubectl apply -f service.yaml
```

![kubectl apply -f service.yaml](screenshots/19-kubectl-apply-f-service-yaml.png)

```sh
kubectl get endpoints troubleshooting-service
```

![kubectl get endpoints troubleshooting-service](screenshots/20-kubectl-get-endpoints-troubleshooting-se.png)

```sh
kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://troubleshooting-service
```

![kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://troubleshooting-service](screenshots/21-kubectl-run-tmp-rm-i-restart-never-image.png)

```sh
kubectl set image pod/project-broken-pod app=nginx:1.27
```

![kubectl set image pod/project-broken-pod app=nginx:1.27](screenshots/22-kubectl-set-image-pod-project-broken-pod.png)

```sh
kubectl get pod project-broken-pod
```

![kubectl get pod project-broken-pod](screenshots/23-kubectl-get-pod-project-broken-pod.png)

## 10. Final troubleshooting checklist

```sh
kubectl get events --sort-by=.metadata.creationTimestamp
```

![kubectl get events --sort-by=.metadata.creationTimestamp](screenshots/24-kubectl-get-events-sort-by-metadata-crea.png)

```sh
kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- nslookup troubleshooting-service
```

![kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- nslookup troubleshooting-service](screenshots/25-kubectl-run-tmp-rm-i-restart-never-image.png)

## 11. Troubleshooting table

| Problem | What I Saw | Command I Used | Root Cause | Fix |
| :--- | :--- | :--- | :--- | :--- |
| **Broken Pod** | `project-broken-pod` never became Running (`ErrImagePull` / `ImagePullBackOff`) | `kubectl get pod`, `kubectl describe pod` | Image tag does not exist | `kubectl set image pod/project-broken-pod app=nginx:1.27` |
| **Service Problem** | `get endpoints` showed `<none>` | `kubectl get endpoints`, `kubectl get pods --show-labels`, `kubectl describe service` | Service selector `wrong-app` does not match Pod label `troubleshooting-app` | `kubectl apply -f service.yaml` (selector back to `troubleshooting-app`) |
| **Image Problem** | Events: failed to pull image `nginx:this-tag-does-not-exist` | `kubectl describe pod project-broken-pod` | Non-existent tag | Use a valid tag (`nginx:1.27`) |

## 12. README questions

1. **What does `kubectl get` tell us?** It lists resources (Pods, Services, nodes, ...) with their status, readiness, restarts, age and, with `-o wide`, extra details like IPs and nodes.
2. **Difference between `get` and `describe`?** `get` gives a short summary table; `describe` gives full details of one object, including configuration and the Events that explain what happened.
3. **Why use `kubectl logs`?** To read the output of a container — to see why an application crashed or what it is doing.
4. **When would you use `kubectl exec`?** To run a command inside a running container, for example to test connectivity, inspect files or environment variables.
5. **What does `CrashLoopBackOff` mean?** The container starts, crashes, and is restarted again and again with an increasing delay between restarts.
6. **What does `ImagePullBackOff` mean?** Kubernetes failed to pull the container image and is waiting before retrying (wrong name/tag, missing registry access, ...).
7. **Why can a Pod remain `Pending`?** The scheduler cannot place it: not enough CPU/memory, a `nodeSelector`/affinity that matches no node, taints, or an unbound PersistentVolumeClaim.
8. **Why can a Service have no endpoints?** Its selector matches no ready Pods — a label mismatch, no Pods running, or Pods failing their readiness probe.
9. **Relationship between a Service selector and Pod labels?** The Service sends traffic only to Pods whose labels match its selector exactly; the matching Pods become its endpoints.
10. **What is Kubernetes DNS?** The cluster DNS service (CoreDNS) that gives Services names like `<service>.<namespace>.svc.cluster.local`, so Pods can find each other by name instead of IP.
