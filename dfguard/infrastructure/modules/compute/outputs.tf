output "ec2_instance_id"   { value = aws_instance.app.id }
output "ec2_public_ip"     { value = aws_eip.app.public_ip }
output "ec2_public_dns"    { value = aws_instance.app.public_dns }
output "ec2_private_ip"    { value = aws_instance.app.private_ip }
output "ami_id"            { value = data.aws_ami.ubuntu.id }
output "log_group_app"     { value = aws_cloudwatch_log_group.app.name }
output "log_group_nginx"   { value = aws_cloudwatch_log_group.nginx.name }
