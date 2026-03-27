# ============================================================
# Queue Module — AWS SQS
# Creates:
#   1. Dead Letter Queue (DLQ) — catches jobs that fail 3x
#   2. Main ML Jobs Queue      — receives image protection jobs
# ============================================================

# ── 1. DEAD LETTER QUEUE ─────────────────────────────────────
# Jobs land here after 3 failed processing attempts
# Monitor this queue for errors
resource "aws_sqs_queue" "dlq" {
  name = "${var.project_name}-jobs-dlq-${var.environment}"

  # Keep failed messages for 14 days so you can inspect them
  message_retention_seconds = 1209600

  tags = { Name = "${var.project_name}-dlq-${var.environment}" }
}

# DLQ policy — allow the main queue to send messages here
resource "aws_sqs_queue_policy" "dlq" {
  queue_url = aws_sqs_queue.dlq.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowMainQueueToDLQ"
        Effect = "Allow"
        Principal = { Service = "sqs.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.dlq.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sqs_queue.jobs.arn
          }
        }
      }
    ]
  })
}

# ── 2. MAIN ML JOBS QUEUE ────────────────────────────────────
resource "aws_sqs_queue" "jobs" {
  name = "${var.project_name}-jobs-${var.environment}"

  # 5 minutes — time allowed for Colab/Kaggle to process one image
  # If not deleted within this time, message becomes visible again
  visibility_timeout_seconds = 300

  # Keep unprocessed jobs for 24 hours
  message_retention_seconds = 86400

  # Long polling — ML worker waits up to 20s for a message
  # Reduces empty API calls and saves cost
  receive_wait_time_seconds = 20

  # Delay delivery by 0 seconds (process immediately)
  delay_seconds = 0

  # Max message size 256KB — enough for job metadata (not the image itself)
  max_message_size = 262144

  # After 3 failed attempts → send to DLQ
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })

  tags = { Name = "${var.project_name}-jobs-queue-${var.environment}" }
}

# Queue policy — allow EC2 and the ML worker to send/receive
resource "aws_sqs_queue_policy" "jobs" {
  queue_url = aws_sqs_queue.jobs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowEC2Access"
        Effect = "Allow"
        Principal = { AWS = "*" }
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.jobs.arn
        Condition = {
          StringEquals = {
            "aws:PrincipalAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })
}

data "aws_caller_identity" "current" {}
