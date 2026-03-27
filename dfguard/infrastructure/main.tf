# ============================================================
# DFGuard Infrastructure — Root Module
# ============================================================
# Prerequisites:
#   1. Install Terraform >= 1.5  https://developer.hashicorp.com/terraform/install
#   2. Configure AWS CLI:        aws configure
#   3. Copy terraform.tfvars.example → terraform.tfvars
#   4. Fill in your values in terraform.tfvars
#
# Deploy:
#   terraform init
#   terraform plan
#   terraform apply
#
# Destroy when done:
#   terraform destroy
# ============================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.30"
    }
  }

  # Optional: store state in S3 so teammates share state
  # Uncomment after creating the S3 bucket manually first
  # backend "s3" {
  #   bucket = "dfguard-terraform-state"
  #   key    = "prod/terraform.tfstate"
  #   region = "ap-south-1"
  # }
}

# ── Provider ─────────────────────────────────────────────────
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ── Data Sources ─────────────────────────────────────────────
data "aws_caller_identity" "current" {}
data "aws_region"          "current" {}

# ── Networking ───────────────────────────────────────────────
module "networking" {
  source       = "./modules/networking"
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

# ── IAM Roles & Policies ─────────────────────────────────────
module "iam" {
  source           = "./modules/iam"
  project_name     = var.project_name
  environment      = var.environment
  aws_account_id   = data.aws_caller_identity.current.account_id
  aws_region       = var.aws_region
  s3_images_bucket = module.storage.images_bucket_arn
  sqs_queue_arn    = module.queue.queue_arn
  sns_topic_arn    = module.monitoring.sns_topic_arn
}

# ── Storage (S3 Buckets) ─────────────────────────────────────
module "storage" {
  source       = "./modules/storage"
  project_name = var.project_name
  environment  = var.environment
  frontend_url = var.frontend_url
}

# ── Auth (Cognito) ───────────────────────────────────────────
module "auth" {
  source       = "./modules/auth"
  project_name = var.project_name
  environment  = var.environment
  frontend_url = var.frontend_url
  domain_name  = var.domain_name
}

# ── Queue (SQS) ──────────────────────────────────────────────
module "queue" {
  source       = "./modules/queue"
  project_name = var.project_name
  environment  = var.environment
}

# ── Compute (EC2 + Nginx) ────────────────────────────────────
module "compute" {
  source              = "./modules/compute"
  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.networking.vpc_id
  public_subnet_id    = module.networking.public_subnet_ids[0]
  ec2_sg_id           = module.networking.ec2_sg_id
  key_name            = var.ec2_key_name
  instance_type       = var.ec2_instance_type
  ec2_instance_profile= module.iam.ec2_instance_profile_name
}

# ── CDN (Route 53 + ACM) ─────────────────────────────────────
module "cdn" {
  source         = "./modules/cdn"
  project_name   = var.project_name
  environment    = var.environment
  domain_name    = var.domain_name
  ec2_public_ip  = module.compute.ec2_public_ip
}

# ── Monitoring (CloudWatch + SNS Alerts) ─────────────────────
module "monitoring" {
  source         = "./modules/monitoring"
  project_name   = var.project_name
  environment    = var.environment
  alert_email    = var.alert_email
  ec2_instance_id= module.compute.ec2_instance_id
  sqs_queue_name = module.queue.queue_name
}
