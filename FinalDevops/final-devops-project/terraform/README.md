# Terraform infrastructure (AWS)

Provisions: VPC (2 AZs, public + private subnets, NAT), EKS cluster with a managed node group, ECR repository
(scan-on-push, lifecycle policy), EBS CSI driver (so PersistentVolumeClaims work on EKS).

```bash
terraform init && terraform fmt -recursive && terraform validate
terraform plan -out=tfplan
terraform apply tfplan
$(terraform output -raw configure_kubectl)
terraform destroy      # EKS + NAT cost real money: destroy when finished
```
After the cluster exists, install ingress-nginx and metrics-server (needed for the Ingress and HPA), then Argo CD
(see ../gitops/README.md).

**Not executed**: Terraform and AWS credentials were not available when this was written, so it has not been validated
or applied. Treat `terraform validate` as the first step. Approximate cost: EKS control plane (~$0.10/h) + 2x t3.medium + NAT gateway.
