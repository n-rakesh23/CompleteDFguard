# ============================================================
# CDN Module — Route 53 DNS
# Creates:
#   1. Route 53 Hosted Zone  — DNS management for your domain
#   2. A Records             — root, www, api → EC2 Elastic IP
#   3. ACM Certificate       — free SSL (used by Nginx/Certbot)
#
# AFTER APPLY:
#   Copy the 4 nameservers from output "route53_nameservers"
#   → Paste them into Hostinger DNS → Custom Nameservers
#   Wait 30 min - 2 hrs for propagation
#   Then run Certbot on EC2 to get SSL cert
# ============================================================

# ── ROUTE 53 HOSTED ZONE ─────────────────────────────────────
resource "aws_route53_zone" "main" {
  name    = var.domain_name
  comment = "DFGuard ${var.environment} hosted zone"

  tags = { Name = "${var.project_name}-zone-${var.environment}" }
}

# ── A RECORD: root domain → EC2 ──────────────────────────────
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [var.ec2_public_ip]
}

# ── A RECORD: www → EC2 ──────────────────────────────────────
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [var.ec2_public_ip]
}

# ── A RECORD: api subdomain → EC2 ────────────────────────────
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [var.ec2_public_ip]
}

# ── ACM CERTIFICATE (free SSL) ───────────────────────────────
# NOTE: We use Let's Encrypt via Certbot on EC2 for SSL.
# ACM is only needed if using CloudFront/ALB.
# This block is here for reference — uncomment if you add CloudFront later.
#
# resource "aws_acm_certificate" "main" {
#   domain_name               = var.domain_name
#   subject_alternative_names = ["*.${var.domain_name}"]
#   validation_method         = "DNS"
#
#   lifecycle {
#     create_before_destroy = true
#   }
# }
#
# resource "aws_route53_record" "cert_validation" {
#   for_each = {
#     for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
#       name   = dvo.resource_record_name
#       record = dvo.resource_record_value
#       type   = dvo.resource_record_type
#     }
#   }
#   zone_id         = aws_route53_zone.main.zone_id
#   name            = each.value.name
#   records         = [each.value.record]
#   type            = each.value.type
#   ttl             = 60
# }
#
# resource "aws_acm_certificate_validation" "main" {
#   certificate_arn         = aws_acm_certificate.main.arn
#   validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
# }
