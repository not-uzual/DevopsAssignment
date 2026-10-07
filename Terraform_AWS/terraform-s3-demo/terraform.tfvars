aws_region        = "ap-south-1"
bucket_prefix     = "terraform-s3-demo"
enable_versioning = true
force_destroy     = true # demo only: lets `terraform destroy` succeed even if objects were added

tags = {
  Project     = "terraform-s3-demo"
  Environment = "dev"
  ManagedBy   = "terraform"
}
