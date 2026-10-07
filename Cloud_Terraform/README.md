# Cloud Terraform: VPC + Subnet + Security Group + EC2 + S3

An end-to-end AWS environment defined as code: a web server in a public subnet, with an IAM role that lets it use a private S3 bucket.

## Architecture

```
                         Internet
                            |
                    [ Internet Gateway ]
                            |
 VPC 10.0.0.0/16  ----------+------------------------------
 |                          |  Route table: 0.0.0.0/0 -> IGW
 |   Public subnet 10.0.1.0/24 (AZ a)
 |   +---------------------------------------------+
 |   |  EC2 (Amazon Linux 2023, httpd, IMDSv2)     |
 |   |  Security group: 80 in (SSH optional)       |
 |   |  IAM instance profile ------------------+   |
 |   +-----------------------------------------|---+
 --------------------------------------------- | -----
                                               v
                          S3 bucket (private, versioned, encrypted)
```

## Concepts demonstrated, and where

| Concept | Where |
|---|---|
| **Providers** | [providers.tf](providers.tf): `aws` (with `default_tags`) and `random`, version-constrained |
| **Variables** | [variables.tf](variables.tf) (types, defaults, validation), values in [terraform.tfvars](terraform.tfvars) |
| **Resources** | [network.tf](network.tf), [security.tf](security.tf), [ec2.tf](ec2.tf), [s3.tf](s3.tf), [iam.tf](iam.tf) |
| **Data sources** | AZ list, latest AL2023 AMI (SSM parameter), IAM policy documents |
| **Outputs** | [outputs.tf](outputs.tf) |
| **Dependencies** | implicit (references) and explicit (`depends_on`), see below |
| **Loops / conditionals** | `for_each` over CIDR lists: SSH rule exists only if CIDRs are given |
| **Templating** | [user_data.sh.tftpl](user_data.sh.tftpl) via `templatefile()` |
| **State** | see "Terraform state" |

## Dependencies

**Implicit**: when one resource references another's attribute, Terraform builds a graph and orders creation automatically:
```
random_id -> aws_s3_bucket -> (versioning, SSE, public-access-block)
aws_vpc -> aws_subnet, aws_internet_gateway, aws_security_group -> ingress/egress rules
aws_internet_gateway -> aws_route_table -> aws_route_table_association
aws_s3_bucket -> IAM policy document -> aws_iam_role_policy
aws_iam_role -> aws_iam_instance_profile -> aws_instance
```
**Explicit**: `aws_instance.web` has `depends_on` for the route-table association and bucket policy. The instance doesn't reference them, but it needs internet access to install `httpd` at boot and S3 permission once running, so ordering is forced.

Independent branches (e.g. S3 and the VPC) are created **in parallel**. See the graph with:
```bash
terraform graph | dot -Tpng > graph.png   # needs graphviz
```

## Prerequisites

- Terraform >= 1.5 (`brew tap hashicorp/tap && brew install hashicorp/tap/terraform`)
- AWS credentials (`aws configure` or `aws sso login`); check with `aws sts get-caller-identity`
- Permissions to manage VPC, EC2, IAM and S3

## Workflow

```bash
terraform init                 # download providers, create .terraform/ and .terraform.lock.hcl
terraform fmt -recursive       # canonical formatting
terraform validate             # syntax/consistency check, no AWS calls
terraform plan -out=tfplan     # preview; nothing changes
terraform apply tfplan         # create resources
terraform output               # show outputs
terraform output -raw website_url
terraform state list           # resources tracked in state
terraform destroy              # tear everything down
```

### What `plan` shows
About 18 resources to add with the default tfvars. `+` = create, `~` = in-place update, `-/+` = replace, `-` = destroy. Always read the summary line (`Plan: N to add, N to change, N to destroy`) before applying.

### Verify after apply
```bash
curl "$(terraform output -raw website_url)"          # wait ~1 min for boot
aws ssm start-session --target "$(terraform output -raw instance_id)"
# on the instance (role credentials, no keys):
aws s3 cp /etc/hostname s3://<bucket_name>/hostname.txt
```

### Observe change handling
Edit `instance_type` in `terraform.tfvars` and run `terraform plan`: the instance is updated (stop/start) while the VPC and bucket are untouched. Change `user_data` content and the instance is replaced (`user_data_replace_on_change`). This is declarative infrastructure: you describe the end state, Terraform computes the diff against state.

## Terraform state

- `terraform.tfstate` (created by `apply`) maps each resource in code to the real AWS object (IDs, attributes). Plan = desired config vs. state vs. real infrastructure.
- It can contain sensitive values; it is in `.gitignore`. **Never commit it.**
- Useful commands:
  ```bash
  terraform state list
  terraform state show aws_instance.web
  terraform show
  terraform refresh            # (or plan -refresh-only) sync state with reality
  terraform import <addr> <id> # adopt an existing resource
  terraform state rm <addr>    # forget a resource without destroying it
  ```
- **Remote state** for teams: an S3 backend with encryption and DynamoDB locking (commented block in [providers.tf](providers.tf)). Create the bucket and table first (separately, not in this config), uncomment, then run `terraform init -migrate-state`. Locking prevents two people applying at once.
- Don't edit the state file by hand; losing it means Terraform no longer knows what it manages.

## Cost and cleanup

A `t3.micro`, an 8 GB gp3 volume and an empty bucket cost very little but are not free in every account. There is no NAT gateway (the expensive part of many VPC demos). Run `terraform destroy` when done; `force_destroy_bucket = true` lets it delete the bucket even with objects.

## Security choices

- Bucket: private, public access blocked, versioned, encrypted.
- EC2: IMDSv2 required, encrypted root volume, no SSH by default (use SSM Session Manager), role scoped to this one bucket, no static credentials.
- HTTP is open to `0.0.0.0/0` by default for the demo; narrow `allowed_http_cidrs` for real use.

## Status

Written without running Terraform: it was not installed in the authoring environment, and no AWS account was available. Run `terraform init && terraform validate` first; if `validate` reports anything, fix before `plan`. The resource count is from counting blocks, so trust your own plan output.
