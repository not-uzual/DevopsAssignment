# Amazon VPC (Virtual Private Cloud) - Networking

## What is VPC?
A logically isolated virtual network in your AWS account where you launch resources, with full control over IP ranges, subnets, routing and gateways. A VPC spans one region and all its AZs. Every account gets a **default VPC** per region.

## CIDR
Classless Inter-Domain Routing notation defines an IP range: `10.0.0.0/16` = 65,536 addresses (the `/16` is the network prefix length; larger number = smaller range).
- VPC CIDR: /16 (largest) to /28 (smallest); use private RFC1918 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- Don't overlap CIDRs with networks you'll peer or connect to.
- AWS reserves 5 IPs per subnet (network, router, DNS, future, broadcast).

## Subnets
A slice of the VPC CIDR inside **one AZ**, e.g. `10.0.1.0/24` in `ap-south-1a`. Use at least two AZs for availability. A subnet is "public" or "private" purely by its route table.

## Route tables
Rules (`destination -> target`) that decide where subnet traffic goes. Each subnet has exactly one; the `local` route covers intra-VPC traffic.
```
10.0.0.0/16  -> local
0.0.0.0/0    -> igw-xxxx   (public subnet)
0.0.0.0/0    -> nat-xxxx   (private subnet)
```

## Internet Gateway (IGW)
Horizontally scaled, managed gateway attached to a VPC that enables two-way internet connectivity for resources with public IPs. Free itself.

## NAT Gateway
Managed service that lets resources in **private** subnets initiate outbound internet connections (updates, APIs) while blocking unsolicited inbound. Lives in a public subnet with an Elastic IP; the private route table points `0.0.0.0/0` to it. Billed hourly + per GB, so one per AZ for HA, or one shared for cost. Use VPC endpoints (S3/DynamoDB gateway endpoints, interface endpoints) to avoid NAT costs and keep traffic private.

## Security Groups
Stateful, resource (ENI)-level firewall. Allow rules only; default deny inbound, allow outbound; can reference other security groups (e.g. app SG allowed to reach DB SG on 5432).

## Network ACLs (NACLs)
Stateless, **subnet-level** firewall with numbered, ordered allow **and deny** rules, evaluated lowest number first. Because stateless, you must allow return traffic (ephemeral ports 1024-65535) explicitly. Default NACL allows all; use custom NACLs for coarse blocking (e.g. block a malicious CIDR).

| | Security Group | NACL |
|---|---|---|
| Level | instance/ENI | subnet |
| State | stateful | stateless |
| Rules | allow only | allow + deny |
| Evaluation | all rules | in order |

## Public vs private subnet
| | Public | Private |
|---|---|---|
| Route to internet | via IGW | none, or via NAT |
| Resources have public IP | yes (if assigned) | no |
| Typical contents | load balancers, bastion, NAT GW | app servers, databases |

Typical 3-tier layout: public (ALB) -> private app subnets -> private DB subnets, replicated across 2-3 AZs.

## Other things worth knowing
VPC Peering and Transit Gateway (connect VPCs), VPN / Direct Connect (on-prem), VPC Flow Logs (traffic logging), DNS settings (`enableDnsSupport`, `enableDnsHostnames`).

## Useful CLI
```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16
aws ec2 create-subnet --vpc-id <vpc> --cidr-block 10.0.1.0/24 --availability-zone ap-south-1a
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --internet-gateway-id <igw> --vpc-id <vpc>
```
