# Task 2: Helm Rollback

## 1. Install

```sh
helm install app ./mychart
```

![helm install app ./mychart](screenshots/01-helm-install-app-mychart.png)

## 2. Verify

```sh
helm list
```

![helm list](screenshots/02-helm-list.png)

```sh
kubectl get deployment app-mychart -o wide
```

![kubectl get deployment app-mychart -o wide](screenshots/03-kubectl-get-deployment-app-mychart-o.png)

## 3. Upgrade (replicas 2)

```sh
helm upgrade app ./mychart --set replicaCount=2
```

![helm upgrade app ./mychart --set replicaCount=2](screenshots/04-helm-upgrade-app-mychart-set-replica.png)

## 4. Verify

```sh
helm history app
```

![helm history app](screenshots/05-helm-history-app.png)

```sh
kubectl get deployment app-mychart -o wide
```

![kubectl get deployment app-mychart -o wide](screenshots/06-kubectl-get-deployment-app-mychart-o.png)

## 5. Upgrade again (replicas 3, image nginx:1.27)

```sh
helm upgrade app ./mychart --set replicaCount=3 --set image.tag=1.27
```

![helm upgrade app ./mychart --set replicaCount=3 --set image.tag=1.27](screenshots/07-helm-upgrade-app-mychart-set-replica.png)

## 6. Verify

```sh
helm history app
```

![helm history app](screenshots/08-helm-history-app.png)

```sh
kubectl get deployment app-mychart -o wide
```

![kubectl get deployment app-mychart -o wide](screenshots/09-kubectl-get-deployment-app-mychart-o.png)

## 7. Rollback to revision 2

```sh
helm rollback app 2
```

![helm rollback app 2](screenshots/10-helm-rollback-app-2.png)

## 8. Verify

```sh
helm history app
```

![helm history app](screenshots/11-helm-history-app.png)

```sh
kubectl get deployment app-mychart -o wide
```

![kubectl get deployment app-mychart -o wide](screenshots/12-kubectl-get-deployment-app-mychart-o.png)

```sh
helm get values app
```

![helm get values app](screenshots/13-helm-get-values-app.png)
