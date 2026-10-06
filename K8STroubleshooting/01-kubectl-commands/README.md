# Task 1: Kubernetes Troubleshooting Commands

## kubectl get

```sh
kubectl apply -f get-pod.yaml
```

![kubectl apply -f get-pod.yaml](screenshots/01-kubectl-apply-f-get-pod-yaml.png)

```sh
kubectl get pods
```

![kubectl get pods](screenshots/02-kubectl-get-pods.png)

```sh
kubectl get pods --show-labels
```

![kubectl get pods --show-labels](screenshots/03-kubectl-get-pods-show-labels.png)

```sh
kubectl get pods,svc
```

![kubectl get pods,svc](screenshots/04-kubectl-get-pods-svc.png)

## kubectl get -o wide

```sh
kubectl get pods -o wide
```

![kubectl get pods -o wide](screenshots/05-kubectl-get-pods-o-wide.png)

```sh
kubectl get nodes -o wide
```

![kubectl get nodes -o wide](screenshots/06-kubectl-get-nodes-o-wide.png)

## kubectl describe

```sh
kubectl apply -f describe-pod.yaml
```

![kubectl apply -f describe-pod.yaml](screenshots/07-kubectl-apply-f-describe-pod-yaml.png)

```sh
kubectl describe pod describe-demo
```

![kubectl describe pod describe-demo](screenshots/08-kubectl-describe-pod-describe-demo.png)

## kubectl logs

```sh
kubectl apply -f logs-pod.yaml
```

![kubectl apply -f logs-pod.yaml](screenshots/09-kubectl-apply-f-logs-pod-yaml.png)

```sh
kubectl logs logs-demo
```

![kubectl logs logs-demo](screenshots/10-kubectl-logs-logs-demo.png)

```sh
kubectl logs logs-demo --tail=3
```

![kubectl logs logs-demo --tail=3](screenshots/11-kubectl-logs-logs-demo-tail-3.png)

```sh
kubectl logs logs-demo --since=10s
```

![kubectl logs logs-demo --since=10s](screenshots/12-kubectl-logs-logs-demo-since-10s.png)

```sh
kubectl logs -f logs-demo
```

![kubectl logs -f logs-demo](screenshots/13-kubectl-logs-f-logs-demo.png)

## kubectl exec

```sh
kubectl apply -f exec-pod.yaml
```

![kubectl apply -f exec-pod.yaml](screenshots/14-kubectl-apply-f-exec-pod-yaml.png)

```sh
kubectl exec exec-demo -- hostname
```

![kubectl exec exec-demo -- hostname](screenshots/15-kubectl-exec-exec-demo-hostname.png)

```sh
kubectl exec exec-demo -- ls /usr/share/nginx/html
```

![kubectl exec exec-demo -- ls /usr/share/nginx/html](screenshots/16-kubectl-exec-exec-demo-ls-usr-share-ngin.png)

```sh
kubectl exec exec-demo -- cat /etc/os-release
```

![kubectl exec exec-demo -- cat /etc/os-release](screenshots/17-kubectl-exec-exec-demo-cat-etc-os-releas.png)

```sh
kubectl exec exec-demo -- curl -s localhost
```

![kubectl exec exec-demo -- curl -s localhost](screenshots/18-kubectl-exec-exec-demo-curl-s-localhost.png)

```sh
kubectl exec -it exec-demo -- sh -c 'echo inside $(hostname); nginx -v'
```

![kubectl exec -it exec-demo -- sh -c 'echo inside $(hostname); nginx -v'](screenshots/19-kubectl-exec-it-exec-demo-sh-c-echo-insi.png)

## kubectl events

```sh
kubectl apply -f events-pod.yaml
```

![kubectl apply -f events-pod.yaml](screenshots/20-kubectl-apply-f-events-pod-yaml.png)

```sh
kubectl events --for pod/events-demo
```

![kubectl events --for pod/events-demo](screenshots/21-kubectl-events-for-pod-events-demo.png)

```sh
kubectl get events --field-selector involvedObject.name=events-demo --sort-by=.metadata.creationTimestamp
```

![kubectl get events --field-selector involvedObject.name=events-demo --sort-by=.metadata.creationTimestamp](screenshots/22-kubectl-get-events-sort-by-metadata-crea.png)

## kubectl explain

```sh
kubectl explain pod.spec.containers.image
```

![kubectl explain pod.spec.containers.image](screenshots/23-kubectl-explain-pod-spec-containers-imag.png)

```sh
kubectl explain deployment.spec.replicas
```

![kubectl explain deployment.spec.replicas](screenshots/24-kubectl-explain-deployment-spec-replicas.png)

```sh
kubectl explain service.spec.selector
```

![kubectl explain service.spec.selector](screenshots/25-kubectl-explain-service-spec-selector.png)

```sh
kubectl explain pod.metadata.labels
```

![kubectl explain pod.metadata.labels](screenshots/26-kubectl-explain-pod-metadata-labels.png)

## kubectl top

```sh
kubectl top nodes
```

![kubectl top nodes](screenshots/27-kubectl-top-nodes.png)

```sh
kubectl top pods
```

![kubectl top pods](screenshots/28-kubectl-top-pods.png)

```sh
kubectl top pod --containers
```

![kubectl top pod --containers](screenshots/29-kubectl-top-pod-containers.png)
