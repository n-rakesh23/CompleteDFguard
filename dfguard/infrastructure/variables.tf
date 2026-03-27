# ============================================================
# Root Variables
# ============================================================
# Set values in terraform.tfvars (never commit that file)

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Short project identifier — used in all resource names"
  type        = string
  default     = "dfguard"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,20}$", var.project_name))
    error_message = "project_name must be 3-20 lowercase letters, numbers, or hyphens."
  }
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}

variable "domain_name" {
  description = "Your registered domain name e.g. dfguard.com"
  type        = string
}

variable "frontend_url" {
  description = "Full public URL of the frontend e.g. https://dfguard.com"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "ec2_key_name" {
  description = "Name of the EC2 Key Pair for SSH access (must exist in AWS Console)"
  type        = string
}

variable "ec2_instance_type" {
  description = "EC2 instance type — t2.micro is free tier eligible"
  type        = string
  default     = "t2.micro"
}

variable "alert_email" {
  description = "Email address for CloudWatch alarm notifications"
  type        = string
}
