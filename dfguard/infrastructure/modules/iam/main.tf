# ============================================================
# IAM Module — EC2 Instance Role
# Grants EC2 least-privilege access to S3, SQS, SNS,
# CloudWatch, and Secrets Manager
# ============================================================

data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# ── EC2 IAM Role ─────────────────────────────────────────────
resource "aws_iam_role" "ec2" {
  name               = "${var.project_name}-ec2-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
  description        = "DFGuard EC2 role — S3, SQS, SNS, CloudWatch"
}

# ── Instance Profile (attaches role to EC2) ──────────────────
resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-ec2-profile-${var.environment}"
  role = aws_iam_role.ec2.name
}

# ── S3 Policy: images bucket only ────────────────────────────
resource "aws_iam_role_policy" "s3_images" {
  name = "s3-images-access"
  role = aws_iam_role.ec2.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3ImagesReadWrite"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GeneratePresignedUrl"
        ]
        Resource = [
          var.s3_images_bucket,
          "${var.s3_images_bucket}/*"
        ]
      }
    ]
  })
}

# ── SQS Policy: send and receive ─────────────────────────────
resource "aws_iam_role_policy" "sqs" {
  name = "sqs-jobs-access"
  role = aws_iam_role.ec2.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SQSJobQueue"
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl"
        ]
        Resource = [var.sqs_queue_arn]
      }
    ]
  })
}

# ── SNS Policy: publish notifications ────────────────────────
resource "aws_iam_role_policy" "sns" {
  name = "sns-publish-access"
  role = aws_iam_role.ec2.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "SNSPublish"
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = [var.sns_topic_arn]
      }
    ]
  })
}

# ── CloudWatch Policy: push logs and metrics ─────────────────
resource "aws_iam_role_policy" "cloudwatch" {
  name = "cloudwatch-access"
  role = aws_iam_role.ec2.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "logs:DescribeLogGroups"
        ]
        Resource = [
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/dfguard/*",
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/dfguard/*:*"
        ]
      },
      {
        Sid    = "CloudWatchMetrics"
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricData",
          "cloudwatch:ListMetrics"
        ]
        Resource = ["*"]
      }
    ]
  })
}

# ── Secrets Manager Policy: read app secrets ─────────────────
resource "aws_iam_role_policy" "secrets_manager" {
  name = "secrets-manager-read"
  role = aws_iam_role.ec2.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerRead"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:${var.project_name}/*"
        ]
      }
    ]
  })
}
