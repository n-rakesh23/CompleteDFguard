output "frontend_bucket_name"    { value = aws_s3_bucket.frontend.bucket }
output "frontend_bucket_arn"     { value = aws_s3_bucket.frontend.arn }
output "frontend_bucket_domain"  { value = aws_s3_bucket.frontend.bucket_regional_domain_name }
output "frontend_website_url"    { value = aws_s3_bucket_website_configuration.frontend.website_endpoint }

output "images_bucket_name"      { value = aws_s3_bucket.images.bucket }
output "images_bucket_arn"       { value = aws_s3_bucket.images.arn }
output "images_bucket_domain"    { value = aws_s3_bucket.images.bucket_regional_domain_name }
