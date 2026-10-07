aws_region         = "ap-south-1"
project_name       = "cloud-tf"
environment        = "dev"
vpc_cidr           = "10.0.0.0/16"
public_subnet_cidr = "10.0.1.0/24"
instance_type      = "t3.micro"

# Restrict this to your own IP (e.g. ["203.0.113.7/32"]) if you want to open SSH.
allowed_ssh_cidrs = []
