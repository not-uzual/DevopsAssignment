# Terraform S3 Demo

Creates a private, encrypted, versioned S3 bucket on AWS.

## Files

| File | Purpose |
|---|---|
| `provider.tf` | Terraform + provider version constraints, AWS provider config |
| `variables.tf` | Input variables (with validation) |
| `terraform.tfvars` | Values for the variables |
| `main.tf` | Resources: random suffix, bucket, versioning, SSE, public-access block |
| `outputs.tf` | Bucket name, ARN, region, versioning status |

Bucket name = `<bucket_prefix>-<random hex>`, because bucket names are globally unique.

## Prerequisites

1. Terraform >= 1.5 (`brew install terraform`, or `brew tap hashicorp/tap && brew install hashicorp/tap/terraform`)
2. AWS CLI configured with credentials allowed to manage S3 (`aws configure`, or `aws sso login`)
3. Verify: `aws sts get-caller-identity`

> Never commit credentials. Use `aws configure`, SSO, or environment variables, not values in `.tf` files.

## Workflow

Run all commands from this directory.

### 1. `terraform init`
Downloads the `aws` and `random` providers into `.terraform/` and writes `.terraform.lock.hcl` (commit the lock file).
```bash
terraform init
```
Look for: `Terraform has been successfully initialized!`

### 2. `terraform fmt`
Rewrites `.tf` files to canonical style. Prints the names of files it changed.
```bash
terraform fmt
```
Use `terraform fmt -check` in CI to fail on unformatted code.

### 3. `terraform validate`
Checks syntax and internal consistency (no AWS calls).
```bash
terraform validate
```
Look for: `Success! The configuration is valid.`

### 4. `terraform plan`
Shows what would be created, without changing anything.
```bash
terraform plan -out=tfplan
```
Expect `Plan: 5 to add, 0 to change, 0 to destroy.` (random_id, bucket, versioning, encryption, public-access block). Read it: `+` create, `~` update, `-` destroy.

### 5. `terraform apply`
Creates the resources. Applying the saved plan skips the confirmation prompt and guarantees it matches what you reviewed.
```bash
terraform apply tfplan
```
(Or `terraform apply` and type `yes`.) Expect `Apply complete! Resources: 5 added, 0 changed, 0 destroyed.`

### 6. `terraform show`
Prints the current state: every resource and its attributes.
```bash
terraform show
```

### 7. `terraform output`
Prints output values; use `-raw` for scripting.
```bash
terraform output
terraform output -raw bucket_name
```
Verify in AWS: `aws s3 ls | grep terraform-s3-demo`

### 8. `terraform destroy`
Deletes everything Terraform created. Review the plan, then confirm with `yes`.
```bash
terraform destroy
```
Expect `Destroy complete! Resources: 5 destroyed.` `force_destroy = true` in `terraform.tfvars` lets this succeed even if you uploaded objects; set it to `false` for anything real.

## Notes

- State (`terraform.tfstate`) is local here and can contain sensitive data; it is git-ignored. For teams, use a remote backend (S3 + DynamoDB locking, or Terraform Cloud).
- Provider resources `aws_s3_bucket_versioning`, `..._server_side_encryption_configuration` and `..._public_access_block` are separate resources in AWS provider v4+; don't use the deprecated inline `versioning {}` block.
- Cost: an empty bucket is effectively free; destroy when finished.

## Status of this write-up

The code and commands were written without running Terraform (Terraform and AWS credentials were not available in the authoring environment). The expected outputs above are what Terraform normally prints; run the workflow yourself and compare, and paste your real output if you need proof of execution for submission.
