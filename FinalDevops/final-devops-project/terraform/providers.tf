terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state (recommended). Create the bucket + lock table once, then uncomment:
  # backend "s3" {
  #   bucket         = "my-tf-state"
  #   key            = "final-devops/terraform.tfstate"
  #   region         = "ap-south-1"
  #   dynamodb_table = "tf-state-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
