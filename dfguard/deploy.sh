#!/bin/bash
# ============================================================
# deploy.sh — Deploy DFGuard to EC2
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Prerequisites:
#   - EC2 instance running (terraform apply done)
#   - SSH key downloaded
#   - .env file ready for backend
# ============================================================

set -e  # Exit on any error

# ── Config — edit these ──────────────────────────────────────
EC2_IP="YOUR_EC2_IP"
KEY_FILE="dfguard-key.pem"
DOMAIN="yourdomain.com"
REPO_URL="https://github.com/yourusername/dfguard.git"

echo "🚀 DFGuard Deployment Starting..."
echo "   Server: $EC2_IP"
echo "   Domain: $DOMAIN"
echo ""

# ── Step 1: Build frontend locally ──────────────────────────
echo "⚛️  Building React frontend..."
cd frontend
npm ci
npm run build
cd ..
echo "✅ Frontend built → frontend/dist/"

# ── Step 2: Upload files to EC2 ─────────────────────────────
echo ""
echo "📤 Uploading files to EC2..."

# Upload backend
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.env' \
  -e "ssh -i $KEY_FILE" \
  backend/ ubuntu@$EC2_IP:/home/ubuntu/dfguard/backend/

# Upload frontend build
rsync -avz --progress \
  -e "ssh -i $KEY_FILE" \
  frontend/dist/ ubuntu@$EC2_IP:/home/ubuntu/dfguard/frontend/dist/

# Upload nginx config
scp -i $KEY_FILE nginx.conf ubuntu@$EC2_IP:/home/ubuntu/nginx.conf

echo "✅ Files uploaded"

# ── Step 3: Setup on EC2 ─────────────────────────────────────
echo ""
echo "⚙️  Setting up server..."

ssh -i $KEY_FILE ubuntu@$EC2_IP << 'REMOTE'
  set -e

  # Install backend dependencies
  cd /home/ubuntu/dfguard/backend
  npm ci --only=production
  echo "✅ Backend dependencies installed"

  # Copy nginx config
  sudo cp /home/ubuntu/nginx.conf /etc/nginx/sites-available/dfguard
  sudo ln -sf /etc/nginx/sites-available/dfguard /etc/nginx/sites-enabled/dfguard
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl reload nginx
  echo "✅ Nginx configured"

  # Start / restart backend with PM2
  cd /home/ubuntu/dfguard/backend

  if pm2 list | grep -q "dfguard-api"; then
    pm2 restart dfguard-api
    echo "✅ Backend restarted"
  else
    pm2 start src/app.js --name dfguard-api \
      --log /home/ubuntu/logs/api.log \
      --error /home/ubuntu/logs/api-error.log
    pm2 save
    echo "✅ Backend started"
  fi

  pm2 status
REMOTE

# ── Step 4: SSL with Certbot ─────────────────────────────────
echo ""
echo "🔒 Setting up SSL..."
echo "   Run this manually on EC2 AFTER DNS has propagated:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""

# ── Done ─────────────────────────────────────────────────────
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app: https://$DOMAIN"
echo "❤️  Health:  https://$DOMAIN/health"
echo ""
echo "📋 Useful commands on EC2:"
echo "   pm2 logs dfguard-api      # view logs"
echo "   pm2 restart dfguard-api   # restart"
echo "   pm2 monit                 # live monitor"
