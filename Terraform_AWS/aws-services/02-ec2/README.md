# Amazon EC2 (Elastic Compute Cloud) - Compute

## What is EC2?
Resizable virtual servers (instances) in the cloud. You choose OS, CPU, memory, storage and network, pay per second (On-Demand/Spot) or commit for discounts (Savings Plans/Reserved), and have full control of the guest OS.

## AMI (Amazon Machine Image)
A template used to launch instances: root volume snapshot (OS + software), launch permissions and block device mappings. Sources: AWS (Amazon Linux, Ubuntu, Windows), Marketplace, or your own custom/golden images. AMIs are regional; copy to use elsewhere.

## Instance types
Naming: `m5.large` = family `m`, generation `5`, size `large`.
| Family | Optimized for | Examples |
|---|---|---|
| General purpose | balanced | `t3`, `t4g` (burstable), `m5`, `m7g` |
| Compute | CPU-bound | `c5`, `c7g` |
| Memory | in-memory DBs/caches | `r5`, `x2` |
| Storage | high IOPS/throughput | `i3`, `d3` |
| Accelerated | GPU/ML | `p4`, `g5`, `inf2` |
A `g` suffix indicates Graviton (ARM), often better price/performance. Burstable `t` types use CPU credits.

## Key pairs
Public/private key pair for SSH (Linux) or decrypting the Windows admin password. AWS stores the public key; you keep the `.pem` private key (download once, `chmod 400`). Prefer **SSM Session Manager** to avoid opening SSH at all.

## Security Groups
Stateful, instance-level virtual firewalls attached to network interfaces.
- Allow rules only (no deny); default is deny inbound, allow all outbound.
- Stateful: return traffic is automatically allowed.
- Rules can reference CIDRs or other security groups.
- Example: allow TCP 443 from `0.0.0.0/0`, SSH 22 only from your IP.

## EBS (Elastic Block Store)
Network-attached block storage for instances.
- Volume types: `gp3`/`gp2` (general SSD), `io2`/`io1` (provisioned IOPS), `st1`/`sc1` (HDD throughput/cold).
- Lives in one AZ; persists independently of the instance (if "delete on termination" is off).
- Snapshots stored in S3 (incremental), used for backup and AMIs. Supports encryption (KMS).
- **Instance store** is the alternative: ephemeral, physically attached, lost on stop/terminate.

## Public vs private IP
- **Private IP**: assigned from the subnet CIDR; stays for the instance's life; reachable inside the VPC.
- **Public IP**: auto-assigned from Amazon's pool if enabled; **changes on stop/start**; released on termination.
- **Elastic IP**: static public IPv4 you own until released; can be remapped between instances.
Instances in private subnets reach the internet via a NAT gateway.

## Instance lifecycle
`pending` → `running` → (`stopping` → `stopped` → `pending`) or (`shutting-down` → `terminated`); also `hibernate`.
- **Stop**: no compute charge; EBS still billed; public IP lost (unless Elastic IP).
- **Reboot**: keeps IPs and data.
- **Terminate**: instance is deleted; root EBS deleted by default.
- Termination protection and stop protection guard against accidents.

## Common use cases
Web/app servers, batch processing, self-managed databases, CI build agents, ML training (GPU), lift-and-shift of on-prem VMs, backing nodes for ECS/EKS, and workloads that need OS-level control. Use Auto Scaling Groups + ELB for scale and resilience.

## Useful CLI
```bash
aws ec2 describe-instances --query 'Reservations[].Instances[].[InstanceId,State.Name,InstanceType]'
aws ec2 run-instances --image-id <ami> --instance-type t3.micro --key-name my-key --security-group-ids <sg> --subnet-id <subnet>
aws ec2 stop-instances --instance-ids <id>
aws ec2 terminate-instances --instance-ids <id>
```
