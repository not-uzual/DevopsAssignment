# Latest Amazon Linux 2023 AMI, resolved at plan time via the public SSM parameter.
data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "web" {
  ami                    = data.aws_ssm_parameter.al2023.value
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    project_name = var.project_name
    environment  = var.environment
    bucket_name  = aws_s3_bucket.app.id
  })
  user_data_replace_on_change = true

  metadata_options {
    http_tokens = "required" # enforce IMDSv2
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 8
    encrypted   = true
  }

  # EXPLICIT dependency: nothing in this resource references the route table
  # association, but the instance needs internet (to install httpd) at boot, so
  # we force ordering.
  depends_on = [
    aws_route_table_association.public,
    aws_iam_role_policy.bucket_access,
  ]

  tags = { Name = "${var.project_name}-web" }
}
