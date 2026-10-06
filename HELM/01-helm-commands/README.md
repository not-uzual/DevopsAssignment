# Task 1: Helm Commands

## helm create

Scaffolds a new chart (Chart.yaml, values.yaml, templates/).

```sh
helm create mychart
```

![helm create mychart](screenshots/01-helm-create-mychart.png)

```sh
ls mychart
```

![ls mychart](screenshots/02-ls-mychart.png)

## helm repo

Adds and manages chart repositories.

```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
```

![helm repo add bitnami https://charts.bitnami.com/bitnami](screenshots/03-helm-repo-add-bitnami-https-charts-b.png)

```sh
helm repo update
```

![helm repo update](screenshots/04-helm-repo-update.png)

```sh
helm repo list
```

![helm repo list](screenshots/05-helm-repo-list.png)

## helm search

Searches charts in added repositories.

```sh
helm search repo bitnami/nginx
```

![helm search repo bitnami/nginx](screenshots/06-helm-search-repo-bitnami-nginx.png)

## helm install

Installs a chart as a named release.

```sh
helm install web ./mychart
```

![helm install web ./mychart](screenshots/07-helm-install-web-mychart.png)

## helm list

Lists releases in the namespace.

```sh
helm list
```

![helm list](screenshots/08-helm-list.png)

## helm status

Shows the status of a release.

```sh
helm status web
```

![helm status web](screenshots/09-helm-status-web.png)

## helm get

Shows what a release deployed (values, notes, manifest).

```sh
helm get values web
```

![helm get values web](screenshots/10-helm-get-values-web.png)

```sh
helm get notes web
```

![helm get notes web](screenshots/11-helm-get-notes-web.png)

## helm upgrade

Upgrades a release with new values/chart (creates a new revision).

```sh
helm upgrade web ./mychart --set replicaCount=2
```

![helm upgrade web ./mychart --set replicaCount=2](screenshots/12-helm-upgrade-web-mychart-set-replica.png)

## helm history

Lists the revisions of a release.

```sh
helm history web
```

![helm history web](screenshots/13-helm-history-web.png)

## helm rollback

Rolls a release back to an earlier revision.

```sh
helm rollback web 1
```

![helm rollback web 1](screenshots/14-helm-rollback-web-1.png)

```sh
helm history web
```

![helm history web](screenshots/15-helm-history-web.png)

## helm uninstall

Removes a release and its resources.

```sh
helm uninstall web
```

![helm uninstall web](screenshots/16-helm-uninstall-web.png)

```sh
helm list
```

![helm list](screenshots/17-helm-list.png)
