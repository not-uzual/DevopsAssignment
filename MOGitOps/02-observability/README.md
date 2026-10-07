# Task 2: Observability

## Monitoring vs observability
- **Monitoring** answers *known* questions: "Is CPU above 80%? Is the service up?" You define the checks in advance.
- **Observability** is the ability to understand a system's internal state from the data it emits, so you can ask *new* questions about *unknown* failures ("why are only checkout requests from EU users slow?") without shipping new code.

Monitoring is something you do; observability is a property of the system. Monitoring depends on observability data.

## The three pillars

| | Metrics | Logs | Traces |
|---|---|---|---|
| What | numeric measurements aggregated over time | timestamped records of discrete events | the path of one request across services |
| Answers | **Is something wrong?** How much, how often? | **What happened?** Details and context | **Where** is it slow or failing? |
| Shape | name + labels + value, e.g. `http_requests_total{status="500"}` | text or JSON lines | tree of **spans** sharing a trace ID |
| Cost | cheap, small, fixed size | expensive at volume | moderate; usually sampled |
| Good for | dashboards, alerts, trends, capacity | debugging, audit, errors with stack traces | microservice latency, dependency mapping |
| Weak at | no per-request detail; high-cardinality labels are costly | hard to aggregate; noisy | needs instrumentation in every service |

### Metrics
Types: **counter** (only goes up; use `rate()`), **gauge** (up/down: memory, queue depth), **histogram** (distribution, enables percentiles like p95/p99). Common frameworks: **RED** for services (Rate, Errors, Duration), **USE** for resources (Utilization, Saturation, Errors), and Google's **four golden signals** (latency, traffic, errors, saturation). Keep label cardinality low: never label by user ID or request ID.

### Logs
Prefer **structured** (JSON) logs with level, timestamp, service, and a **trace ID** so they link to traces. Log levels: debug/info/warn/error. Don't log secrets or personal data. Centralize them; container logs vanish when pods do.

### Traces
A **trace** is one request's whole journey; a **span** is one unit of work in it (name, start, duration, attributes, parent). **Context propagation** passes the trace ID between services in headers (W3C `traceparent`). Shows which downstream call caused the latency. High-volume systems **sample** (head-based random, or tail-based "keep slow/errored traces").

### How they work together
1. A **metric** alert fires: p95 latency of `/checkout` is high.
2. A **trace** shows the slowest span is the payment service's DB call.
3. The **logs** for that trace ID show `connection pool exhausted`.

Increasingly a fourth signal is added: **profiles** (continuous CPU/memory profiling, e.g. Pyroscope), and **events** (deploys, config changes) for correlation.

## Why observability is required
- **Distributed systems fail in new ways**: microservices, containers and autoscaling mean no single machine to inspect; pods are ephemeral.
- **Faster detection and recovery**: lower MTTD (detect) and MTTR (resolve).
- **Unknown unknowns**: you can't pre-write an alert for every failure mode.
- **Safe, frequent releases**: see the effect of a deploy immediately; enables canary and rollback decisions.
- **Reliability targets**: SLIs/SLOs and error budgets need measurable data.
- **Business insight and cost**: find slow user journeys, over-provisioned resources, wasteful calls.
- **Security and audit**: log trails for investigation and compliance.

## Common tools

| Area | Open source | Commercial / managed |
|---|---|---|
| Metrics | Prometheus, VictoriaMetrics, Thanos / Mimir (scale) | Datadog, New Relic, CloudWatch, Grafana Cloud |
| Logs | Loki, Elasticsearch/OpenSearch (ELK/EFK), Fluent Bit, Fluentd, Vector | Splunk, Datadog Logs, CloudWatch Logs |
| Traces | Jaeger, Zipkin, Grafana Tempo | Datadog APM, Honeycomb, Lightstep, AWS X-Ray |
| Visualization | Grafana, Kibana | vendor UIs |
| Alerting | Alertmanager, Grafana Alerting | PagerDuty, Opsgenie |
| Instrumentation | **OpenTelemetry** (vendor-neutral APIs, SDKs, Collector for metrics, logs and traces) | - |

**OpenTelemetry (OTel)** is the CNCF standard: instrument once, export to any backend through the OTel Collector (receive -> process -> export). Typical open-source stack: **OTel + Prometheus + Loki + Tempo + Grafana** ("LGTM"). The demo in [../01-monitoring](../01-monitoring) uses Prometheus + Loki + Grafana + Alertmanager.

## Kubernetes observability

Kubernetes adds layers to watch: cluster, nodes, control plane, workloads (pods/deployments) and the app inside.

### Metrics
| Source | Gives you |
|---|---|
| **kubelet / cAdvisor** | per-container CPU, memory, network, filesystem |
| **metrics-server** | live CPU/memory for `kubectl top` and the HPA (not historical) |
| **kube-state-metrics** | object state: replicas desired vs available, pod phase, restarts, `OOMKilled`, pending pods |
| **node-exporter** | node CPU, memory, disk, network |
| **Control plane** | API server latency/errors, etcd, scheduler, controller-manager metrics |
| **App metrics** | `/metrics` endpoints scraped via `ServiceMonitor` / `PodMonitor` |

Install the whole thing with **kube-prometheus-stack** (Prometheus Operator, Alertmanager, Grafana, exporters, ready-made dashboards and alerts):
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```
Scrape an app with a custom resource:
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata: { name: my-app, labels: { release: monitoring } }
spec:
  selector: { matchLabels: { app: my-app } }
  endpoints: [{ port: http, path: /metrics, interval: 15s }]
```

### Logs
Containers write to stdout/stderr; the node keeps them at `/var/log/pods`. A **DaemonSet** agent (Promtail, Fluent Bit, Vector) on every node ships them to Loki/Elasticsearch, enriched with labels (namespace, pod, container). `kubectl logs <pod> [-p] [-f]` only sees a live or last-terminated container, hence central logging.

### Traces
Instrument apps with OpenTelemetry SDKs (or auto-instrumentation via the OTel Operator), send to an OTel Collector (DaemonSet or Deployment) and on to Tempo/Jaeger. Service meshes (Istio, Linkerd) and eBPF tools (Cilium/Hubble, Pixie, Beyla) give network-level traces with little code change.

### Events and troubleshooting signals
- `kubectl get events --sort-by=.lastTimestamp` and `kubectl describe pod`: scheduling failures, image pull errors, probe failures.
- Probes: **liveness** (restart), **readiness** (remove from Service), **startup**. These are health signals Kubernetes itself acts on.

### Useful Kubernetes alerts
- Pod `CrashLoopBackOff`, frequent restarts (`kube_pod_container_status_restarts_total`)
- `OOMKilled` containers, CPU throttling
- Deployment replicas unavailable (`kube_deployment_status_replicas_unavailable`)
- Node `NotReady`, disk or memory pressure
- PersistentVolume nearly full; pods `Pending` too long
- API server 5xx / latency; etcd leader changes

### Handy commands
```bash
kubectl top nodes
kubectl top pods -A
kubectl logs deploy/my-app --tail=100
kubectl get events -A --sort-by=.lastTimestamp | tail
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
```

## Best practices
- Instrument with OpenTelemetry to avoid vendor lock-in.
- Use structured logs carrying trace IDs; keep metric labels low-cardinality.
- Alert on **symptoms users feel** (error rate, latency, SLO burn rate) more than on causes (CPU %); every alert should be actionable and have a runbook.
- Define SLIs/SLOs; track error budgets.
- Set retention and sampling to control cost.
- Treat dashboards and alert rules as code (and deploy them with GitOps, see [../03-gitops](../03-gitops)).
