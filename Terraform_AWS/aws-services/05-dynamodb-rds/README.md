# Database Services: DynamoDB and RDS

# Amazon DynamoDB

## What is it? NoSQL
A fully managed, serverless **NoSQL key-value and document** database with single-digit-millisecond latency at any scale. No servers, patching or capacity planning (on-demand mode). NoSQL means schemaless items, horizontal scaling by partitioning, and access modeled around known query patterns rather than joins.

## Data model
- **Table**: collection of items; only the primary key is declared up front.
- **Item**: a single record (like a row), up to 400 KB.
- **Attribute**: a field on an item (like a column) - string, number, binary, boolean, null, list, map, sets. Items in one table may have different attributes.

## Keys
- **Partition key (hash key)**: hashed to choose the physical partition. Pick a high-cardinality value (`userId`) to spread load evenly; avoid hot keys.
- **Sort key (range key)**: optional; orders items within a partition and enables range queries (`begins_with`, `between`).
- **Primary key** = partition key alone, or partition + sort (composite, must be unique).

Example `Orders`: partition key `customerId`, sort key `orderDate` -> "all orders for customer X in March".

## Other features
Global/Local Secondary Indexes (alternative query keys), on-demand vs provisioned capacity, DynamoDB Streams, TTL (auto-expire items), Point-in-time recovery, Global Tables (multi-region), DAX (in-memory cache), transactions, encryption at rest by default. Prefer `Query` (by key) over `Scan` (reads everything).

## Use cases
Session stores, shopping carts, user profiles, gaming leaderboards, IoT/time-series, serverless backends (with Lambda/API Gateway), high-traffic key-based lookups.

```bash
aws dynamodb create-table --table-name Orders \
  --attribute-definitions AttributeName=customerId,AttributeType=S AttributeName=orderDate,AttributeType=S \
  --key-schema AttributeName=customerId,KeyType=HASH AttributeName=orderDate,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

---

# Amazon RDS (Relational Database Service)

## What is it? Relational database
Managed **relational (SQL)** databases: tables with fixed schemas, relationships, joins and ACID transactions. AWS handles provisioning, OS/engine patching, backups and failover; you manage schema, queries and tuning (no OS access).

## Supported engines
Amazon Aurora (MySQL- and PostgreSQL-compatible, cloud-native, up to 15 replicas), MySQL, PostgreSQL, MariaDB, Oracle, Microsoft SQL Server, and Db2.

## DB instances
The isolated database environment: choose engine/version, **instance class** (`db.t3.micro`, `db.r6g.large`), storage (gp3/io1, autoscaling), and a **DB subnet group** (subnets in 2+ AZs). Aurora uses a cluster with a shared storage volume.

## Security
- Run in **private subnets**; set "publicly accessible" to No.
- **Security groups** restrict access to app tier only (e.g. port 5432 from the app SG).
- **Encryption at rest** with KMS (enable at creation) and in transit with TLS.
- IAM database authentication; credentials in **Secrets Manager** with rotation.
- Audit logging, parameter groups, minor-version auto-upgrade.

## Backups
- **Automated backups**: daily snapshot + transaction logs, retention 0-35 days, enabling **point-in-time restore** (to a new instance).
- **Manual snapshots**: kept until you delete them; can be copied cross-region/account.
- Restores always create a new instance.

## Multi-AZ
Synchronous standby in another AZ for **high availability**, with automatic failover (typically 60-120s) with the same endpoint, plus patching with minimal downtime. The standby is not readable in classic Multi-AZ instance deployments (Multi-AZ DB *cluster* has two readable standbys). It is about availability, not performance.

## Read replicas
Asynchronous copies for **read scaling** (and cross-region DR); each has its own endpoint; can be promoted to standalone. Replication lag means eventual consistency. Different purpose from Multi-AZ:

| | Multi-AZ | Read replica |
|---|---|---|
| Purpose | HA / failover | read scaling |
| Replication | synchronous | asynchronous |
| Serves reads | no (instance mode) | yes |
| Cross-region | no | yes |

## Use cases
OLTP apps needing joins and transactions: e-commerce, ERP/CRM, financial systems, CMS backends, migrations of existing MySQL/PostgreSQL/Oracle/SQL Server workloads.

---

# DynamoDB vs RDS

| | DynamoDB | RDS |
|---|---|---|
| Model | key-value / document | relational tables |
| Schema | flexible | fixed |
| Queries | by key/index; no joins | full SQL, joins |
| Scaling | automatic, horizontal | vertical + read replicas (Aurora scales further) |
| Latency | single-digit ms at scale | depends on query/size |
| Best when | known access patterns, massive scale | complex queries, transactions, existing SQL apps |
