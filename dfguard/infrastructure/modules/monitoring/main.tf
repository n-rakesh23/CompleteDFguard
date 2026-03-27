# ============================================================
# Monitoring Module — CloudWatch + SNS
# Creates:
#   1. SNS Topic          — sends alerts to your email
#   2. CloudWatch Alarms  — EC2 CPU, SQS queue depth, errors
#   3. CloudWatch Dashboard — overview of all metrics
# ============================================================

# ── 1. SNS TOPIC ─────────────────────────────────────────────
resource "aws_sns_topic" "alerts" {
  name         = "${var.project_name}-alerts-${var.environment}"
  display_name = "DFGuard Alerts"

  tags = { Name = "${var.project_name}-sns-${var.environment}" }
}

# Subscribe your email to receive alerts
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email

  # NOTE: AWS will send a confirmation email to this address.
  # You must click "Confirm subscription" before alerts are delivered.
}

# ── 2. CLOUDWATCH ALARMS ─────────────────────────────────────

# Alarm: EC2 CPU usage > 80% for 5 minutes
resource "aws_cloudwatch_metric_alarm" "ec2_cpu_high" {
  alarm_name          = "${var.project_name}-ec2-cpu-high-${var.environment}"
  alarm_description   = "EC2 CPU utilization exceeded 80% for 5 minutes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300   # 5 minutes
  statistic           = "Average"
  threshold           = 80
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = var.ec2_instance_id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  tags = { Name = "${var.project_name}-cpu-alarm" }
}

# Alarm: EC2 status check failed (instance unhealthy)
resource "aws_cloudwatch_metric_alarm" "ec2_status_check" {
  alarm_name          = "${var.project_name}-ec2-status-check-${var.environment}"
  alarm_description   = "EC2 instance status check failed — instance may be down"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  treat_missing_data  = "breaching"

  dimensions = {
    InstanceId = var.ec2_instance_id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = { Name = "${var.project_name}-status-alarm" }
}

# Alarm: SQS queue depth > 50 (jobs backing up)
resource "aws_cloudwatch_metric_alarm" "sqs_queue_depth" {
  alarm_name          = "${var.project_name}-sqs-depth-high-${var.environment}"
  alarm_description   = "SQS queue has more than 50 unprocessed jobs — ML worker may be down"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Average"
  threshold           = 50
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = var.sqs_queue_name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = { Name = "${var.project_name}-sqs-alarm" }
}

# Alarm: DLQ has messages (jobs are failing permanently)
resource "aws_cloudwatch_metric_alarm" "sqs_dlq_messages" {
  alarm_name          = "${var.project_name}-dlq-not-empty-${var.environment}"
  alarm_description   = "Dead Letter Queue has messages — jobs are failing after 3 retries"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = "${var.project_name}-jobs-dlq-${var.environment}"
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = { Name = "${var.project_name}-dlq-alarm" }
}

# Alarm: EC2 disk usage > 85% (root volume nearly full)
resource "aws_cloudwatch_metric_alarm" "ec2_disk_high" {
  alarm_name          = "${var.project_name}-ec2-disk-high-${var.environment}"
  alarm_description   = "EC2 root disk usage exceeded 85% — clean up logs or resize volume"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "disk_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = var.ec2_instance_id
    path       = "/"
    fstype     = "ext4"
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = { Name = "${var.project_name}-disk-alarm" }
}

# ── 3. CLOUDWATCH DASHBOARD ──────────────────────────────────
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "EC2 CPU Utilization"
          view   = "timeSeries"
          period = 300
          metrics = [[
            "AWS/EC2", "CPUUtilization",
            "InstanceId", var.ec2_instance_id,
            { stat = "Average", color = "#4F46E5" }
          ]]
          yAxis = { left = { min = 0, max = 100 } }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "SQS Jobs Queue Depth"
          view   = "timeSeries"
          period = 300
          metrics = [[
            "AWS/SQS", "ApproximateNumberOfMessagesVisible",
            "QueueName", var.sqs_queue_name,
            { stat = "Maximum", color = "#D946EF" }
          ]]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "SQS Jobs Processed (Deleted)"
          view   = "timeSeries"
          period = 300
          metrics = [[
            "AWS/SQS", "NumberOfMessagesSent",
            "QueueName", var.sqs_queue_name,
            { stat = "Sum", label = "Sent", color = "#10b981" }
          ], [
            "AWS/SQS", "NumberOfMessagesDeleted",
            "QueueName", var.sqs_queue_name,
            { stat = "Sum", label = "Processed", color = "#3b82f6" }
          ]]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "EC2 Network In/Out"
          view   = "timeSeries"
          period = 300
          metrics = [[
            "AWS/EC2", "NetworkIn",
            "InstanceId", var.ec2_instance_id,
            { stat = "Sum", label = "In", color = "#06b6d4" }
          ], [
            "AWS/EC2", "NetworkOut",
            "InstanceId", var.ec2_instance_id,
            { stat = "Sum", label = "Out", color = "#f59e0b" }
          ]]
        }
      }
    ]
  })
}
