# Amazon S3 (Simple Storage Service) - Storage

## What is S3?
Highly durable (11 nines), highly available, virtually unlimited **object storage** accessed over HTTP APIs. Not a filesystem or block device. Pay for storage, requests and data transfer out.

## Buckets
Top-level containers for objects. Names are **globally unique**, DNS-compliant (3-63 chars, lowercase). A bucket lives in one region. Flat namespace; "folders" are just key prefixes (`logs/2026/app.log`). New buckets block public access by default and have ACLs disabled (Object Ownership: bucket owner enforced).

## Objects
Data + metadata, identified by **key** within a bucket. Max size 5 TB; single PUT up to 5 GB, so use **multipart upload** above ~100 MB. Parts: key, value, version ID, metadata, tags. Strong read-after-write consistency.

## Storage classes
| Class | Use |
|---|---|
| Standard | frequently accessed |
| Intelligent-Tiering | unknown/changing access; auto-moves between tiers |
| Standard-IA | infrequent, rapid access, 30-day min |
| One Zone-IA | infrequent, re-creatable, single AZ |
| Glacier Instant Retrieval | archive with millisecond access |
| Glacier Flexible Retrieval | archive, minutes-to-hours retrieval |
| Glacier Deep Archive | cheapest, 12-48 hour retrieval |
Cheaper classes have retrieval fees and minimum durations.

## Versioning
Keeps every version of an object; deletes add a *delete marker* rather than erasing. Protects from accidental overwrite/delete and enables recovery. Once enabled it can only be suspended, not removed. Combine with MFA Delete or Object Lock (WORM) for stronger protection. Old versions cost storage, so pair with lifecycle rules.

## Lifecycle policies
Rules that automate cost control by prefix/tag:
- **Transition** objects to cheaper classes after N days.
- **Expire** current objects, **expire noncurrent versions**, clean up incomplete multipart uploads.
```json
{"Rules":[{"ID":"archive-logs","Status":"Enabled","Filter":{"Prefix":"logs/"},
 "Transitions":[{"Days":30,"StorageClass":"STANDARD_IA"},{"Days":90,"StorageClass":"GLACIER"}],
 "Expiration":{"Days":365}}]}
```

## Encryption
- **In transit**: HTTPS (enforce with a `aws:SecureTransport` deny policy).
- **At rest**: all new objects are encrypted by default with SSE-S3 (AES-256). Options: **SSE-KMS** (audit/control via KMS keys), **DSSE-KMS**, **SSE-C** (customer-supplied keys), or client-side encryption.

## Bucket policies
Resource-based JSON policies attached to a bucket; grant cross-account or conditional access and enforce rules.
```json
{"Version":"2012-10-17","Statement":[{
  "Sid":"DenyInsecureTransport","Effect":"Deny","Principal":"*","Action":"s3:*",
  "Resource":["arn:aws:s3:::my-bucket","arn:aws:s3:::my-bucket/*"],
  "Condition":{"Bool":{"aws:SecureTransport":"false"}}}]}
```
Access control layers: IAM policies, bucket policies, **Block Public Access** (keep on), access points, pre-signed URLs, and (legacy) ACLs.

## Common use cases
Static website/asset hosting (with CloudFront), backups and archives, data lakes (Athena/Glue/EMR), application and user uploads, log storage, software distribution, disaster recovery (cross-region replication), and event triggers (S3 events to Lambda/SQS/SNS).

## Useful CLI
```bash
aws s3 mb s3://my-unique-bucket
aws s3 cp file.txt s3://my-unique-bucket/
aws s3 sync ./site s3://my-unique-bucket/
aws s3api put-bucket-versioning --bucket my-unique-bucket --versioning-configuration Status=Enabled
aws s3 rb s3://my-unique-bucket --force
```
