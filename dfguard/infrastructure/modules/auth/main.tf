# ============================================================
# Auth Module — AWS Cognito
# Creates:
#   1. Cognito User Pool     — user directory with email auth
#   2. App Client (frontend) — no secret, SRP auth
#   3. User Pool Domain      — for hosted UI (optional)
# ============================================================

# ── 1. COGNITO USER POOL ─────────────────────────────────────
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-users-${var.environment}"

  # Use email as the username
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Case insensitive usernames
  username_configuration {
    case_sensitive = false
  }

  # Password requirements
  password_policy {
    minimum_length                   = 8
    require_uppercase                = true
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  # Email verification
  verification_message_template {
    default_email_option  = "CONFIRM_WITH_CODE"
    email_subject         = "DFGuard — Your verification code"
    email_message         = "Your DFGuard verification code is: {####}. Valid for 10 minutes."
  }

  # Account recovery via email
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # MFA — optional (users can enable it themselves)
  mfa_configuration = "OFF"

  # User attribute schema
  schema {
    name                     = "email"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = false
    string_attribute_constraints {
      min_length = 5
      max_length = 255
    }
  }

  schema {
    name                     = "name"
    attribute_data_type      = "String"
    required                 = false
    mutable                  = true
    string_attribute_constraints {
      min_length = 1
      max_length = 100
    }
  }

  # Email configuration — uses Cognito default sender (free)
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Advanced security — set to AUDIT to log suspicious activity
  user_pool_add_ons {
    advanced_security_mode = "AUDIT"
  }

  # Auto cleanup unconfirmed accounts after 7 days
  admin_create_user_config {
    allow_admin_create_user_only = false
    invite_message_template {
      email_subject = "DFGuard — Your temporary credentials"
      email_message = "Your DFGuard username is {username} and temporary password is {####}."
      sms_message   = "Your DFGuard username is {username} and temporary password is {####}."
    }
  }

  tags = { Name = "${var.project_name}-user-pool-${var.environment}" }
}

# ── 2. APP CLIENT (Frontend — no secret) ─────────────────────
resource "aws_cognito_user_pool_client" "frontend" {
  name         = "${var.project_name}-frontend-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id

  # NEVER generate a client secret for browser apps
  generate_secret = false

  # Supported auth flows
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",       # Secure Remote Password — never sends plaintext password
    "ALLOW_REFRESH_TOKEN_AUTH",  # Allows silent token refresh
    "ALLOW_USER_PASSWORD_AUTH"   # Fallback for testing
  ]

  # Token validity
  access_token_validity  = 1    # 1 hour
  id_token_validity      = 1    # 1 hour
  refresh_token_validity = 30   # 30 days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Prevent user enumeration via "User does not exist" errors
  prevent_user_existence_errors = "ENABLED"

  # Read/write attributes
  read_attributes  = ["email", "name", "email_verified"]
  write_attributes = ["email", "name"]

  # OAuth2 callback URLs
  callback_urls = [
    "${var.frontend_url}/dashboard",
    "http://localhost:5173/dashboard"
  ]
  logout_urls = [
    var.frontend_url,
    "http://localhost:5173"
  ]

  # OAuth flows and scopes
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  supported_identity_providers = ["COGNITO"]
}

# ── 3. USER POOL DOMAIN (for hosted UI / OAuth) ───────────────
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${var.environment}-auth"
  user_pool_id = aws_cognito_user_pool.main.id
}

# ── 4. RESOURCE SERVER (for custom scopes if needed later) ────
# Uncomment when you need machine-to-machine auth
# resource "aws_cognito_resource_server" "api" {
#   identifier   = "https://api.${var.domain_name}"
#   name         = "DFGuard API"
#   user_pool_id = aws_cognito_user_pool.main.id
#   scope {
#     scope_name        = "read"
#     scope_description = "Read access"
#   }
# }
