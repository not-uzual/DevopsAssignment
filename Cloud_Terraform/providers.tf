terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # State is local by default (terraform.tfstate). For teams, uncomment and
  # create the bucket + lock table first (see README "Terraform state"):
  #
  # backend "s3" {
  #   bucket         = "my-tf-state-bucket"
  #   key            = "cloud-terraform/terraform.tfstate"
  #   region         = "ap-south-1"
  #   dynamodb_table = "tf-state-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  # Applied to every taggable resource automatically.
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
