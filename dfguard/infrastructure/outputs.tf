# ============================================================
# Root Outputs
# Copy these values into your .env files after terraform apply
# ============================================================

# ── EC2 ──────────────────────────────────────────────────────
output "ec2_public_ip" {
  description = "EC2 Elastic IP — add as A record in Route 53"
  value       = module.compute.ec2_public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = module.compute.ec2_instance_id
}

output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh -i ${var.ec2_key_name}.pem ubuntu@${module.compute.ec2_public_ip}"
}

# ── S3 ───────────────────────────────────────────────────────
output "s3_frontend_bucket" {
  description = "Frontend S3 bucket → copy React build here"
  value       = module.storage.frontend_bucket_name
}

output "s3_images_bucket" {
  description = "Images S3 bucket → add to backend .env as S3_BUCKET"
  value       = module.storage.images_bucket_name
}

# ── Cognito ──────────────────────────────────────────────────
output "cognito_user_pool_id" {
  description = "Add to backend .env as COGNITO_USER_POOL_ID"
  value       = module.auth.user_pool_id
}

output "cognito_client_id" {
  description = "Add to frontend .env as VITE_COGNITO_CLIENT_ID"
  value       = module.auth.client_id
}

output "cognito_issuer_url" {
  description = "JWT issuer URL — used by backend auth middleware"
  value       = module.auth.issuer_url
}

# ── SQS ──────────────────────────────────────────────────────
output "sqs_queue_url" {
  description = "Add to backend .env as SQS_QUEUE_URL"
  value       = module.queue.queue_url
}

output "sqs_queue_arn" {
  description = "SQS Queue ARN"
  value       = module.queue.queue_arn
}

output "sqs_dlq_url" {
  description = "Dead Letter Queue URL — monitor this for failed jobs"
  value       = module.queue.dlq_url
}

# ── Route 53 ─────────────────────────────────────────────────
output "route53_nameservers" {
  description = "Copy these 4 nameservers into Hostinger DNS settings"
  value       = module.cdn.route53_nameservers
}

output "route53_zone_id" {
  description = "Route 53 Hosted Zone ID"
  value       = module.cdn.route53_zone_id
}

# ── SNS / Monitoring ─────────────────────────────────────────
output "sns_topic_arn" {
  description = "Add to backend .env as SNS_TOPIC_ARN"
  value       = module.monitoring.sns_topic_arn
}

# ── IAM ──────────────────────────────────────────────────────
output "ec2_iam_role_arn" {
  description = "IAM role attached to EC2 for S3/SQS/SNS access"
  value       = module.iam.ec2_role_arn
}

# ── Summary ──────────────────────────────────────────────────
output "deployment_summary" {
  description = "All values needed for .env files"
  value = {
    # Backend .env
    AWS_REGION            = var.aws_region
    COGNITO_USER_POOL_ID  = module.auth.user_pool_id
    S3_BUCKET             = module.storage.images_bucket_name
    SQS_QUEUE_URL         = module.queue.queue_url
    SNS_TOPIC_ARN         = module.monitoring.sns_topic_arn
    FRONTEND_URL          = var.frontend_url

    # Frontend .env
    VITE_AWS_REGION             = var.aws_region
    VITE_COGNITO_USER_POOL_ID   = module.auth.user_pool_id
    VITE_COGNITO_CLIENT_ID      = module.auth.client_id
    VITE_API_URL                = var.frontend_url

    # ML Worker secrets
    S3_IMAGE_BUCKET = module.storage.images_bucket_name
    SQS_QUEUE_URL   = module.queue.queue_url
  }
}
