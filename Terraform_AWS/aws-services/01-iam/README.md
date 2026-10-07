# AWS IAM (Identity and Access Management) - Governance

## What is IAM?
IAM is the global AWS service that controls **who** (authentication) can do **what** (authorization) on **which resources**. It is free, not region-scoped, and every AWS API call is evaluated by it.

## Core concepts

### Users
A long-lived identity for a person or application, with a name and credentials (console password, access keys). Best practice: humans use SSO/Identity Center instead of IAM users; avoid long-lived access keys.

### Groups
A collection of users. Attach policies to the group and every member inherits them. Groups cannot be nested and cannot be used as a principal in a policy.

### Roles
An identity with permissions but **no permanent credentials**; it is *assumed* and issues temporary credentials via STS. Used by EC2/Lambda/ECS (instance profiles/execution roles), cross-account access, and federated users. A role has a **trust policy** (who may assume it) and **permission policies** (what it may do).

### Policies
JSON documents defining permissions.
- **AWS managed**: maintained by AWS (e.g. `AmazonS3ReadOnlyAccess`).
- **Customer managed**: yours, reusable and versioned.
- **Inline**: embedded in a single identity.
- **Resource-based**: attached to a resource (S3 bucket policy, role trust policy).
- Others: permissions boundaries, SCPs (Organizations), session policies.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"]
  }]
}
```
Elements: `Effect`, `Action`, `Resource`, `Principal` (resource policies), `Condition` (e.g. MFA, source IP, tags).

### Permissions: how evaluation works
1. Everything is **implicitly denied** by default.
2. An explicit **Allow** grants access.
3. An explicit **Deny** always wins over any Allow.
4. Guardrails (SCPs, permissions boundaries, session policies) limit the maximum; they never grant on their own.

## Least privilege
Grant only the actions, on only the resources, under only the conditions needed. Start narrow and widen; avoid `"Action": "*"` / `"Resource": "*"`. Tools: **IAM Access Analyzer** (policy generation from CloudTrail, unused-access findings), "last accessed" data, policy simulator.

## Best practices
- Lock down the root user: MFA, no access keys, use only for the few root-only tasks.
- Use SSO / roles with temporary credentials instead of long-lived keys.
- Enforce MFA for humans; rotate or remove unused credentials.
- Use groups/roles for permissions, not per-user policies.
- Use conditions and permissions boundaries to delegate safely.
- Separate accounts per environment (AWS Organizations) with SCPs.
- Turn on CloudTrail; review with Access Analyzer.
- Never embed keys in code or repos; use roles, Secrets Manager or SSM Parameter Store.

## Common use cases
- Giving an EC2 instance or Lambda access to S3/DynamoDB via a role.
- CI/CD (e.g. GitHub Actions) assuming a role through OIDC, with no stored keys.
- Cross-account access (central logging, shared services).
- Separating duties: developers, read-only auditors, admins.
- Federating corporate identities (SAML/OIDC) into AWS.

## Useful CLI
```bash
aws iam list-users
aws iam create-group --group-name developers
aws iam attach-group-policy --group-name developers --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
aws sts get-caller-identity
```
