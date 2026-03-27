# DFGuard Deployment Documentation

## Project Overview
DFGuard is a full-stack web application that protects facial images from AI scraping using adversarial noise injection.

**Live URL:** https://iamrakesh.site

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, AWS Amplify |
| Backend | Node.js 20, Express, Mongoose |
| Database | MongoDB Atlas (M0 Free Tier) |
| Cache | AWS ElastiCache Redis (cache.t3.micro) |
| ML Worker | Python, PyTorch, FaceNet (Google Colab/Kaggle) |
| Server | AWS EC2 (t3.micro, Ubuntu 22.04 LTS) |
| Reverse Proxy | Nginx |
| Process Manager | PM2 |
| SSL | Let's Encrypt (Certbot) |
| Auth | AWS Cognito |
| Storage | AWS S3 |
| Queue | AWS SQS |
| Notifications | AWS SNS |
| Payments | Razorpay (pending verification) |
| CI/CD | GitHub Actions |
| DNS | AWS Route 53 |
| Domain | iamrakesh.site (Hostinger) |

---

## AWS Resources Created

| Resource | Name | Details |
|---|---|---|
| IAM User | `dfguard-cicd` | Access keys for GitHub Actions + ML Worker |
| EC2 Instance | `dfguard-backend` | t3.micro, Ubuntu 22.04, ap-south-1 |
| S3 Bucket (Images) | `dfguard-images-prod` | Private, server-side encryption |
| S3 Bucket (Frontend) | `dfguard-frontend-prod` | Public, static website hosting |
| SQS Queue | `dfguard-jobs` | Standard queue, visibility timeout 300s |
| SQS DLQ | `dfguard-jobs-dlq` | Dead letter queue, 3 max receives |
| SNS Topic | `dfguard-notifications` | Email alerts for developer |
| Cognito User Pool | `dfguard-users` | Email sign-in, no MFA |
| Cognito App Client | `dfguard-app` | Public client, no client secret |
| ElastiCache Redis | `dfguard-redis` | cache.t3.micro, Redis 7.1, cluster mode disabled |
| Route 53 | `iamrakesh.site` | A records for @, www, api |

---

## EC2 Server Details

| Item | Value |
|---|---|
| Public IP | 35.154.91.113 |
| Region | ap-south-1 (Mumbai) |
| OS | Ubuntu 24.04 LTS |
| Instance Type | t3.micro |
| SSH User | ubuntu |
| SSH Key | dfguard-key.pem |

### Software Installed on EC2
- Node.js 20
- npm 10
- PM2 6
- Nginx 1.24
- Git 2.43
- Certbot (Let's Encrypt)

### Directory Structure on EC2
```
/home/ubuntu/
└── CompleteDFguard/
    └── dfguard/
        ├── backend/        ← Node.js API (running on port 8000)
        │   └── .env        ← Environment variables
        └── frontend/
            └── dist/       ← Built React app (served by Nginx)
```

---

## CI/CD Pipeline

### GitHub Repository
`https://github.com/n-rakesh23/CompleteDFguard`

### Workflows Created

| File | Trigger | CI | CD |
|---|---|---|---|
| `.github/workflows/frontend.yml` | Push to `dfguard/frontend/**` | npm install + build | Deploy to S3 |
| `.github/workflows/backend.yml` | Push to `dfguard/backend/**` | npm install + test | SSH deploy to EC2 + PM2 restart |
| `.github/workflows/ml-worker.yml` | Push to `dfguard/ml-worker/**` | flake8 lint + pytest | None |

### GitHub Secrets Configured
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `VITE_API_URL`
- `VITE_AWS_REGION`
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`
- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `MONGODB_URI`
- `REDIS_URL`

---

## Environment Variables

### Backend (.env on EC2)
```
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://iamrakesh.site
MONGODB_URI=mongodb+srv://dfguard_user:****@dfguard-cluster.i2og8vp.mongodb.net/dfguard
REDIS_URL=redis://dfguard-redis.n5a5ts.ng.0001.aps1.cache.amazonaws.com:6379
AWS_ACCESS_KEY_ID=****
AWS_SECRET_ACCESS_KEY=****
AWS_REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_owKQuunAP
COGNITO_CLIENT_ID=4ro52k2vdppjk59qnl2q2dfamu
S3_BUCKET=dfguard-images-prod
SQS_QUEUE_URL=https://sqs.ap-south-1.amazonaws.com/201561150106/dfguard-jobs
SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:201561150106:dfguard-notifications
RAZORPAY_KEY_ID=(pending)
RAZORPAY_KEY_SECRET=(pending)
```

### Frontend (.env)
```
VITE_API_URL=https://iamrakesh.site/api
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=ap-south-1_owKQuunAP
VITE_COGNITO_CLIENT_ID=4ro52k2vdppjk59qnl2q2dfamu
```

---

## DNS Configuration (Route 53)

| Record | Type | Value |
|---|---|---|
| `iamrakesh.site` | A | 35.154.91.113 |
| `www.iamrakesh.site` | A | 35.154.91.113 |
| `api.iamrakesh.site` | A | 35.154.91.113 |

---

## Nginx Configuration
- Config file: `/etc/nginx/sites-available/dfguard`
- Frontend served from: `/home/ubuntu/CompleteDFguard/dfguard/frontend/dist`
- API proxied from `/api/` to `http://127.0.0.1:8000/`
- SSL configured via Certbot (auto-renews)

---

## PM2 Configuration
- Process name: `dfguard-backend`
- Entry point: `src/app.js`
- Auto-start on reboot: enabled via systemd

---

## Steps Performed (In Order)

### Phase 1: CI/CD Setup
1. Read and analyzed entire project codebase
2. Created `.github/workflows/frontend.yml`
3. Created `.github/workflows/backend.yml`
4. Created `.github/workflows/ml-worker.yml`
5. Committed and pushed workflows to GitHub

### Phase 2: AWS Resources
6. Created IAM User `dfguard-cicd` with required policies
7. Created S3 bucket `dfguard-images-prod` (private)
8. Created S3 bucket `dfguard-frontend-prod` (public)
9. Created SQS Dead Letter Queue `dfguard-jobs-dlq`
10. Created SQS Main Queue `dfguard-jobs` with DLQ attached
11. Created SNS Topic `dfguard-notifications` with email subscription
12. Created Cognito User Pool `dfguard-users` with app client `dfguard-app`
13. Created EC2 instance `dfguard-backend` (t3.micro, Ubuntu)
14. Created key pair `dfguard-key.pem`
15. Created ElastiCache Redis `dfguard-redis` (cache.t3.micro, cluster mode disabled)

### Phase 3: External Services
16. Created MongoDB Atlas account and free M0 cluster
17. Created database user `dfguard_user`
18. Whitelisted EC2 IP `35.154.91.113` in MongoDB Atlas

### Phase 4: DNS Setup
19. Added Route 53 A records for iamrakesh.site, www, api

### Phase 5: GitHub Secrets
20. Added all 13 secrets to GitHub repository

### Phase 6: EC2 Server Setup
21. Fixed SSH key permissions on Windows
22. Connected to EC2 via SSH
23. Installed Node.js 20, PM2, Nginx, Git
24. Cloned GitHub repository
25. Fixed nested git submodule issue (removed nested .git)
26. Pushed all source code to GitHub as regular directory
27. Installed backend dependencies
28. Created backend `.env` file
29. Started backend with PM2
30. Configured PM2 startup on reboot
31. Configured Nginx as reverse proxy
32. Fixed file permissions for Nginx
33. Built React frontend locally
34. Copied `dist/` folder to EC2 via SCP
35. Installed SSL certificate via Certbot

### Phase 7: Verification
36. Verified app is live at `https://iamrakesh.site`

---

## Pending Tasks

| Task | Status | Notes |
|---|---|---|
| Razorpay integration | Pending | Waiting for website verification |
| Rotate AWS access keys | Required | Keys were exposed in chat |
| Change MongoDB password | Required | Password was exposed in chat |
| ML Worker setup | Pending | Run on Google Colab when needed |
| Frontend S3 deployment via CI/CD | Pending | Currently deployed manually |

---

## Useful Commands

### SSH into EC2
```bash
ssh -i "D:\Cloud_Devops\Aws\keysAndcredentilas\dfguard-key.pem" ubuntu@35.154.91.113
```

### Backend Management
```bash
pm2 status                          # Check status
pm2 logs dfguard-backend            # View logs
pm2 restart dfguard-backend         # Restart
pm2 stop dfguard-backend            # Stop
```

### Nginx Management
```bash
sudo systemctl status nginx         # Check status
sudo systemctl restart nginx        # Restart
sudo nginx -t                       # Test config
```

### Deploy Frontend Manually
```bash
# On local PC
cd dfguard/frontend
npm run build
scp -i "dfguard-key.pem" -r dist ubuntu@35.154.91.113:/home/ubuntu/CompleteDFguard/dfguard/frontend/
```

### Update Backend on EC2
```bash
cd ~/CompleteDFguard
git pull origin main
cd dfguard/backend
npm install --omit=dev
pm2 restart dfguard-backend
```

---

## Cost Estimate

| Service | Cost |
|---|---|
| EC2 t3.micro | Free tier (12 months) |
| ElastiCache t3.micro | Free tier (12 months) |
| MongoDB Atlas M0 | Free forever |
| S3 | Free tier (5GB) |
| SQS | Free tier (1M requests) |
| SNS | Free tier (1000 emails) |
| Route 53 | ~$0.50/month per hosted zone |
| Domain (iamrakesh.site) | Already purchased |

**Estimated monthly cost: ~$0.50**
