# Task 1: Monitoring Demo

A runnable stack that demonstrates **metrics, logs, alerts, CPU, memory and application health**.
Tested with Docker Compose: all targets scraped, four app alerts fired, logs reached Loki, dashboard provisioned.

```
        +-------------+  /metrics   +------------+  rules   +--------------+
        |  Node app   |<------------| Prometheus |--------->| Alertmanager |
        | (fault      |             +-----+------+          +--------------+
        |  injection) |  stdout JSON      |  PromQL
        +------+------+                   v
               | docker logs        +-------------+
               v                    |   Grafana   |  <-- Loki (logs)
        Promtail ------> Loki ----->+-------------+
        node-exporter (host CPU/mem) --> Prometheus
```

## Run

```bash
docker compose up -d --build
```

| URL | What |
|---|---|
| http://localhost:3000 | the app (`/metrics`, `/healthz`) |
| http://localhost:9090 | Prometheus (Alerts tab, Graph) |
| http://localhost:9093 | Alertmanager |
| http://localhost:3001 | Grafana (no login), dashboard **App Monitoring Overview** |

Stop: `docker compose down -v`

## What is being monitored

### Metrics (numbers over time)
The app uses `prom-client`; Prometheus scrapes it every 5s.
- `http_request_duration_seconds` histogram: request rate, errors, p95 latency (the "RED" method: Rate, Errors, Duration).
- `app_health_status`: custom gauge, 1 healthy / 0 unhealthy.
- Default Node metrics: CPU, memory, event loop lag, GC.

### CPU utilization
- App: `rate(process_cpu_seconds_total{job="app"}[30s])` (1.0 = one full core)
- Host: `100 - avg(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100`

### Memory utilization
- App: `process_resident_memory_bytes{job="app"}`
- Host: `(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100`
- Note: node-exporter in Docker Desktop reports the Linux VM, not your Mac.

### Application health
`/healthz` returns 200 or 503; Docker `HEALTHCHECK` uses it; `app_health_status` and `up{job="app"}` expose it to Prometheus. Two different failures: `up == 0` means "can't scrape the app at all", `app_health_status == 0` means "app is running but says it is sick".

### Logs
The app writes JSON lines to stdout; Promtail ships them to Loki; Grafana shows them in the dashboard's log panel and in **Explore**:
```
{service="app"}                          # all logs
{service="app", level="error"}           # errors only
{service="app"} |= "health toggled"      # text filter
```

### Alerts ([prometheus/alerts.yml](prometheus/alerts.yml))
| Alert | Condition | Severity |
|---|---|---|
| AppDown | target not scrapable 15s | critical |
| AppUnhealthy | `app_health_status == 0` 15s | critical |
| HighAppCPU | app CPU > 0.5 core for 20s | warning |
| HighAppMemory | app RSS > 150 MiB for 20s | warning |
| HighErrorRate | > 20% of requests are 5xx for 20s | critical |
| HostHighCPU / HostHighMemory | host > 80% / > 85% for 1m | warning |

The lifecycle is **inactive -> pending** (condition true, waiting out `for:`) **-> firing** (sent to Alertmanager). Alertmanager groups, deduplicates and routes them; the demo receiver has no destination, so alerts are only visible in its UI. Add Slack/PagerDuty/email in [alertmanager.yml](alertmanager/alertmanager.yml).

## Trigger problems and watch them

| Do this | Watch |
|---|---|
| `for i in $(seq 30); do curl -s localhost:3000/fail; done` | error rate panel, **HighErrorRate**, error logs |
| `curl "localhost:3000/cpu?ms=60000"` | CPU panel, **HighAppCPU** |
| `curl "localhost:3000/mem?mb=100"` (repeat 2-3x) | memory panel, **HighAppMemory** |
| `curl localhost:3000/health/toggle` | health stat turns 0, **AppUnhealthy**, `/healthz` 503 |
| `docker compose stop app` | **AppDown** |
| `curl localhost:3000/mem/free` | memory drops, alert resolves |

Alerts need roughly 20-30 seconds (scrape + `for:`) to go from pending to firing.

## Observed in testing
- All three Prometheus targets (`app`, `node`, `prometheus`) reported `up`.
- `AppUnhealthy` appeared in both Prometheus and Alertmanager after toggling health.
- `HighAppCPU`, `HighErrorRate` and `HighAppMemory` each reached `firing` under load.
- Loki returned the app's JSON log lines, including `"health toggled"` and 503 `/healthz` entries.
- Grafana auto-loaded both datasources and the dashboard.

## Gotcha found while testing
The CPU burner originally blocked Node's single event loop, so `/metrics` could not respond and the app looked "down" during the burn. It now works in 50 ms slices and yields, which is a real lesson: a busy single-threaded process can fail its own health checks. Also, after editing a bind-mounted config on Docker Desktop, `docker compose restart prometheus` was needed for it to see the change.
