variable "project_name"        { type = string }
variable "environment"         { type = string }
variable "vpc_id"              { type = string }
variable "public_subnet_id"    { type = string }
variable "ec2_sg_id"           { type = string }
variable "key_name"            { type = string }
variable "instance_type"       { type = string  default = "t2.micro" }
variable "ec2_instance_profile"{ type = string }
