output "route53_zone_id" {
  description = "Hosted Zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_nameservers" {
  description = "Paste these 4 nameservers into Hostinger → Custom Nameservers"
  value       = aws_route53_zone.main.name_servers
}

output "domain_root_record" { value = aws_route53_record.root.fqdn }
output "domain_www_record"  { value = aws_route53_record.www.fqdn }
output "domain_api_record"  { value = aws_route53_record.api.fqdn }
