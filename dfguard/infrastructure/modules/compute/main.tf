# ============================================================
# Compute Module — EC2 Instance
# Creates:
#   1. EC2 t2.micro (free tier) with Ubuntu 22.04
#   2. Elastic IP — static IP survives reboots
#   3. User data script — bootstraps Node.js, Nginx, PM2
# ============================================================

# Latest Ubuntu 22.04 LTS AMI (Canonical)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

# ── EC2 INSTANCE ─────────────────────────────────────────────
resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [var.ec2_sg_id]
  iam_instance_profile   = var.ec2_instance_profile

  # Auto-assign public IP (will be replaced by Elastic IP)
  associate_public_ip_address = true

  # Root volume — 8GB is free tier limit
  root_block_device {
    volume_type           = "gp2"
    volume_size           = 8
    encrypted             = true
    delete_on_termination = true

    tags = { Name = "${var.project_name}-root-volume" }
  }

  # Bootstrap script — runs on first boot
  # Installs everything needed to run the app
  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -e
    exec > /var/log/bootstrap.log 2>&1

    echo "=== DFGuard Bootstrap Started at $(date) ==="

    # Update system packages
    apt-get update -y
    apt-get upgrade -y

    # Install Node.js 20 LTS
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo "Node.js $(node --version) installed"

    # Install Nginx
    apt-get install -y nginx
    systemctl enable nginx
    echo "Nginx installed"

    # Install PM2 (process manager — keeps Node.js running)
    npm install -g pm2
    pm2 startup systemd -u ubuntu --hp /home/ubuntu
    echo "PM2 installed"

    # Install Certbot for Let's Encrypt SSL
    apt-get install -y certbot python3-certbot-nginx
    echo "Certbot installed"

    # Install Git
    apt-get install -y git
    echo "Git installed"

    # Install AWS CloudWatch Agent
    wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
    dpkg -i amazon-cloudwatch-agent.deb
    echo "CloudWatch Agent installed"

    # Create app directory with correct permissions
    mkdir -p /home/ubuntu/dfguard
    chown ubuntu:ubuntu /home/ubuntu/dfguard

    # Create logs directory
    mkdir -p /home/ubuntu/logs
    chown ubuntu:ubuntu /home/ubuntu/logs

    # Write Nginx placeholder config
    cat > /etc/nginx/sites-available/dfguard << 'NGINX'
    server {
        listen 80 default_server;
        server_name _;
        location / {
            return 200 'DFGuard server ready. Deploy your app.';
            add_header Content-Type text/plain;
        }
        location /health {
            proxy_pass http://localhost:8000;
        }
    }
    NGINX

    ln -sf /etc/nginx/sites-available/dfguard /etc/nginx/sites-enabled/dfguard
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx

    echo "=== Bootstrap Complete at $(date) ==="
    touch /tmp/bootstrap.done
  EOF
  )

  tags = {
    Name        = "${var.project_name}-app-${var.environment}"
    Environment = var.environment
  }

  lifecycle {
    # Don't recreate if AMI is updated — would wipe the server
    ignore_changes = [ami, user_data]
  }
}

# ── ELASTIC IP ───────────────────────────────────────────────
# Static public IP — stays the same even after instance stop/start
# This is what you point your domain's A record to
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = { Name = "${var.project_name}-eip-${var.environment}" }

  depends_on = [aws_instance.app]
}

# ── CLOUDWATCH LOG GROUP ─────────────────────────────────────
# App logs stream here from PM2
resource "aws_cloudwatch_log_group" "app" {
  name              = "/dfguard/app-${var.environment}"
  retention_in_days = 7  # Keep logs 7 days — enough for short-term use

  tags = { Name = "${var.project_name}-logs" }
}

resource "aws_cloudwatch_log_group" "nginx" {
  name              = "/dfguard/nginx-${var.environment}"
  retention_in_days = 7

  tags = { Name = "${var.project_name}-nginx-logs" }
}
