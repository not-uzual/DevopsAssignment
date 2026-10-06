# Task 2: Troubleshoot Common Issues

## CrashLoopBackOff

### Identify the problem

```sh
kubectl apply -f crashloop-broken.yaml
```

![kubectl apply -f crashloop-broken.yaml](screenshots/01-kubectl-apply-f-crashloop-broken-yaml.png)

```sh
kubectl get pod crash-demo
```

![kubectl get pod crash-demo](screenshots/02-kubectl-get-pod-crash-demo.png)

### Investigate

```sh
kubectl logs crash-demo
```

![kubectl logs crash-demo](screenshots/03-kubectl-logs-crash-demo.png)

```sh
kubectl describe pod crash-demo
```

![kubectl describe pod crash-demo](screenshots/04-kubectl-describe-pod-crash-demo.png)

### Root cause

The container's command runs `exit 1`, so the application exits with an error right after starting. Kubernetes restarts it, it fails again, and the restart delay keeps growing — that is `CrashLoopBackOff`.

### Fix

```sh
kubectl delete pod crash-demo
```

![kubectl delete pod crash-demo](screenshots/05-kubectl-delete-pod-crash-demo.png)

```sh
kubectl apply -f crashloop-fixed.yaml
```

![kubectl apply -f crashloop-fixed.yaml](screenshots/06-kubectl-apply-f-crashloop-fixed-yaml.png)

### Verify

```sh
kubectl get pod crash-demo
```

![kubectl get pod crash-demo](screenshots/07-kubectl-get-pod-crash-demo.png)

```sh
kubectl logs crash-demo
```

![kubectl logs crash-demo](screenshots/08-kubectl-logs-crash-demo.png)

## ErrImagePull

### Identify the problem

```sh
kubectl apply -f image-broken.yaml
```

![kubectl apply -f image-broken.yaml](screenshots/09-kubectl-apply-f-image-broken-yaml.png)

```sh
kubectl get pod image-demo
```

![kubectl get pod image-demo](screenshots/10-kubectl-get-pod-image-demo.png)

### Investigate

```sh
kubectl describe pod image-demo
```

![kubectl describe pod image-demo](screenshots/11-kubectl-describe-pod-image-demo.png)

### Root cause

The image tag `nginx:this-image-does-not-exist` does not exist in the registry, so the kubelet cannot pull it (`ErrImagePull`). The fix is shown under ImagePullBackOff below (same Pod, same fix).

## ImagePullBackOff

### Identify the problem

```sh
kubectl get pod image-demo
```

![kubectl get pod image-demo](screenshots/12-kubectl-get-pod-image-demo.png)

### Investigate

```sh
kubectl describe pod image-demo
```

![kubectl describe pod image-demo](screenshots/13-kubectl-describe-pod-image-demo.png)

### Root cause

After the first failed pull (`ErrImagePull`), Kubernetes retries with an increasing delay and the status changes to `ImagePullBackOff`. The cause is the same: the image tag does not exist.

### Fix

```sh
kubectl apply -f image-fixed.yaml
```

![kubectl apply -f image-fixed.yaml](screenshots/14-kubectl-apply-f-image-fixed-yaml.png)

### Verify

```sh
kubectl get pod image-demo
```

![kubectl get pod image-demo](screenshots/15-kubectl-get-pod-image-demo.png)

## Pending

### Identify the problem

```sh
kubectl apply -f pending-broken.yaml
```

![kubectl apply -f pending-broken.yaml](screenshots/16-kubectl-apply-f-pending-broken-yaml.png)

```sh
kubectl get pod pending-demo
```

![kubectl get pod pending-demo](screenshots/17-kubectl-get-pod-pending-demo.png)

### Investigate

```sh
kubectl describe pod pending-demo
```

![kubectl describe pod pending-demo](screenshots/18-kubectl-describe-pod-pending-demo.png)

```sh
kubectl get nodes --show-labels
```

![kubectl get nodes --show-labels](screenshots/19-kubectl-get-nodes-show-labels.png)

### Root cause

The Pod has `nodeSelector: kubernetes.io/hostname: node-that-does-not-exist`. No node has that label, so the scheduler cannot place the Pod and it stays `Pending`.

### Fix

```sh
kubectl delete pod pending-demo
```

![kubectl delete pod pending-demo](screenshots/20-kubectl-delete-pod-pending-demo.png)

```sh
kubectl apply -f pending-fixed.yaml
```

![kubectl apply -f pending-fixed.yaml](screenshots/21-kubectl-apply-f-pending-fixed-yaml.png)

### Verify

```sh
kubectl get pod pending-demo -o wide
```

![kubectl get pod pending-demo -o wide](screenshots/22-kubectl-get-pod-pending-demo-o-wide.png)

## ContainerCreating

### Identify the problem

```sh
kubectl apply -f containercreating-broken.yaml
```

![kubectl apply -f containercreating-broken.yaml](screenshots/23-kubectl-apply-f-containercreating-broken.png)

```sh
kubectl get pod cc-demo
```

![kubectl get pod cc-demo](screenshots/24-kubectl-get-pod-cc-demo.png)

### Investigate

```sh
kubectl describe pod cc-demo
```

![kubectl describe pod cc-demo](screenshots/25-kubectl-describe-pod-cc-demo.png)

```sh
kubectl get configmap missing-config
```

![kubectl get configmap missing-config](screenshots/26-kubectl-get-configmap-missing-config.png)

### Root cause

The Pod mounts a volume from the ConfigMap `missing-config`, which does not exist. The kubelet cannot set up the volume, so the container is never started and the Pod stays in `ContainerCreating`.

### Fix

```sh
kubectl apply -f containercreating-fix-configmap.yaml
```

![kubectl apply -f containercreating-fix-configmap.yaml](screenshots/27-kubectl-apply-f-containercreating-fix-co.png)

### Verify

```sh
kubectl get pod cc-demo
```

![kubectl get pod cc-demo](screenshots/28-kubectl-get-pod-cc-demo.png)

```sh
kubectl exec cc-demo -- cat /etc/app/app.properties
```

![kubectl exec cc-demo -- cat /etc/app/app.properties](screenshots/29-kubectl-exec-cc-demo-cat-etc-app-app-pro.png)

## Service connectivity issue

### Identify the problem

```sh
kubectl apply -f web-deployment.yaml
```

![kubectl apply -f web-deployment.yaml](screenshots/30-kubectl-apply-f-web-deployment-yaml.png)

```sh
kubectl apply -f service-broken.yaml
```

![kubectl apply -f service-broken.yaml](screenshots/31-kubectl-apply-f-service-broken-yaml.png)

```sh
kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://web-service
```

![kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://web-service](screenshots/32-kubectl-run-tmp-rm-i-restart-never-image.png)

### Investigate

```sh
kubectl get svc web-service
```

![kubectl get svc web-service](screenshots/33-kubectl-get-svc-web-service.png)

```sh
kubectl get endpoints web-service
```

![kubectl get endpoints web-service](screenshots/34-kubectl-get-endpoints-web-service.png)

```sh
kubectl describe svc web-service
```

![kubectl describe svc web-service](screenshots/35-kubectl-describe-svc-web-service.png)

```sh
kubectl get pods --show-labels
```

![kubectl get pods --show-labels](screenshots/36-kubectl-get-pods-show-labels.png)

### Root cause

The Service selector is `app: web-ahsgdf`, but the Pods are labelled `app: web`. The selector matches no Pods, so the Service has no endpoints and traffic goes nowhere.

### Fix

```sh
kubectl apply -f service-fixed.yaml
```

![kubectl apply -f service-fixed.yaml](screenshots/37-kubectl-apply-f-service-fixed-yaml.png)

### Verify

```sh
kubectl get endpoints web-service
```

![kubectl get endpoints web-service](screenshots/38-kubectl-get-endpoints-web-service.png)

```sh
kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://web-service
```

![kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://web-service](screenshots/39-kubectl-run-tmp-rm-i-restart-never-image.png)

## DNS issue

### Identify the problem

```sh
kubectl apply -f dns-test-pod.yaml
```

![kubectl apply -f dns-test-pod.yaml](screenshots/40-kubectl-apply-f-dns-test-pod-yaml.png)

```sh
kubectl apply -f dns-backend.yaml
```

![kubectl apply -f dns-backend.yaml](screenshots/41-kubectl-apply-f-dns-backend-yaml.png)

```sh
kubectl exec dns-test -- nslookup backend
```

![kubectl exec dns-test -- nslookup backend](screenshots/42-kubectl-exec-dns-test-nslookup-backend.png)

### Investigate

```sh
kubectl get svc -n dns-lab
```

![kubectl get svc -n dns-lab](screenshots/43-kubectl-get-svc-n-dns-lab.png)

```sh
kubectl exec dns-test -- cat /etc/resolv.conf
```

![kubectl exec dns-test -- cat /etc/resolv.conf](screenshots/44-kubectl-exec-dns-test-cat-etc-resolv-con.png)

### Root cause

The Service `backend` lives in the namespace `dns-lab`, but the client Pod is in a different namespace. A short name like `backend` only resolves inside the caller's own namespace (the resolver search list contains only the caller's namespace), so the lookup returns NXDOMAIN.

### Fix

```sh
kubectl exec dns-test -- nslookup backend.dns-lab
```

![kubectl exec dns-test -- nslookup backend.dns-lab](screenshots/45-kubectl-exec-dns-test-nslookup-backend-d.png)

### Verify

```sh
kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://backend.dns-lab
```

![kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://backend.dns-lab](screenshots/46-kubectl-run-tmp-rm-i-restart-never-image.png)

## Pod networking issue

### Identify the problem

```sh
kubectl apply -f netpod.yaml
```

![kubectl apply -f netpod.yaml](screenshots/47-kubectl-apply-f-netpod-yaml.png)

```sh
kubectl get pod net-demo -o wide
```

![kubectl get pod net-demo -o wide](screenshots/48-kubectl-get-pod-net-demo-o-wide.png)

```sh
kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://$(kubectl get pod net-demo -o jsonpath='{.status.podIP}'):80
```

![kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://$(kubectl get pod net-demo -o jsonpath='{.status.podIP}'):80](screenshots/49-kubectl-run-tmp-rm-i-restart-never-image.png)

### Investigate

```sh
kubectl exec net-demo -- netstat -ltn
```

![kubectl exec net-demo -- netstat -ltn](screenshots/50-kubectl-exec-net-demo-netstat-ltn.png)

### Root cause

The application listens on port `8080`, but the request was sent to port `80`. Nothing listens on 80, so the connection is refused.

### Fix and Verify

```sh
kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://$(kubectl get pod net-demo -o jsonpath='{.status.podIP}'):8080
```

![kubectl run tmp --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- -T 3 http://$(kubectl get pod net-demo -o jsonpath='{.status.podIP}'):8080](screenshots/51-kubectl-run-tmp-rm-i-restart-never-image.png)

## Configuration issue

### Identify the problem

```sh
kubectl apply -f config-broken.yaml
```

![kubectl apply -f config-broken.yaml](screenshots/52-kubectl-apply-f-config-broken-yaml.png)

```sh
kubectl get pod config-demo
```

![kubectl get pod config-demo](screenshots/53-kubectl-get-pod-config-demo.png)

### Investigate

```sh
kubectl describe pod config-demo
```

![kubectl describe pod config-demo](screenshots/54-kubectl-describe-pod-config-demo.png)

```sh
kubectl describe configmap app-settings
```

![kubectl describe configmap app-settings](screenshots/55-kubectl-describe-configmap-app-settings.png)

### Root cause

The Pod reads the environment variable `DB_HOST` from the key `DB_HOST` of the ConfigMap `app-settings`, but the ConfigMap only has the key `DB_URL`. The key is missing, so the container cannot be created (`CreateContainerConfigError`).

### Fix

```sh
kubectl delete pod config-demo
```

![kubectl delete pod config-demo](screenshots/56-kubectl-delete-pod-config-demo.png)

```sh
kubectl apply -f config-fixed.yaml
```

![kubectl apply -f config-fixed.yaml](screenshots/57-kubectl-apply-f-config-fixed-yaml.png)

### Verify

```sh
kubectl get pod config-demo
```

![kubectl get pod config-demo](screenshots/58-kubectl-get-pod-config-demo.png)

```sh
kubectl exec config-demo -- env | grep DB_
```

![kubectl exec config-demo -- env | grep DB_](screenshots/59-kubectl-exec-config-demo-env.png)
