# DFGuard — Neural Deepfake Protection

A full-stack MERN + AWS application that protects facial images from AI scraping
using adversarial noise injection.

---

## 🗂️ Project Structure

```
dfguard/
├── frontend/          React + Vite + Tailwind + AWS Amplify
├── backend/           Node.js + Express + MongoDB + AWS SDK
├── ml-worker/         Python adversarial noise engine (Colab/Kaggle)
├── infrastructure/    Terraform — AWS infrastructure as code
└── docker-compose.yml Local development environment
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
```bash
node >= 20, npm >= 10, docker, docker-compose, terraform >= 1.5
```

### 2. Clone and install
```bash
git clone <your-repo>
cd dfguard

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 3. Environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in your Cognito, Razorpay, and AWS values

# Frontend
cp frontend/.env.example frontend/.env
# Fill in Cognito IDs and API URL
```

### 4. Start with Docker (easiest)
```bash
docker-compose up -d
# Frontend → http://localhost:5173
# Backend  → http://localhost:8000
```

### 5. Start without Docker
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## ☁️ AWS Deployment

### 1. Deploy Infrastructure
```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

terraform init
terraform plan
terraform apply
```

### 2. Copy nameservers to Hostinger
After `terraform apply`, copy the 4 nameservers from the output
`route53_nameservers` into Hostinger → Domains → DNS → Custom Nameservers.
Wait 30 min – 2 hours for propagation.

### 3. SSH into EC2 and deploy backend
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/dfguard
git clone <your-repo> .
cd backend && npm install
cp .env.example .env
# Fill in .env with values from terraform output
pm2 start src/app.js --name dfguard-api
pm2 save
```

### 4. Set up SSL with Certbot
```bash
# On EC2 (after DNS has propagated)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. Deploy frontend
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://dfguard-frontend-prod --delete
```

### 6. Start ML Worker
Open `ml-worker/worker.py` in Google Colab or Kaggle:
- Enable GPU runtime
- Add AWS credentials to Secrets
- Run all cells

---

## 🔑 Environment Variables Reference

### Backend `.env`
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `REDIS_URL` | Redis URL (ElastiCache or local) |
| `COGNITO_USER_POOL_ID` | From Terraform output |
| `S3_BUCKET` | Images bucket name from Terraform |
| `SQS_QUEUE_URL` | Jobs queue URL from Terraform |
| `RAZORPAY_KEY_ID` | Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard |

### Frontend `.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | `https://yourdomain.com` |
| `VITE_COGNITO_USER_POOL_ID` | From Terraform output |
| `VITE_COGNITO_CLIENT_ID` | From Terraform output |

---

## 🛑 Cleanup (Stop AWS Billing)

```bash
cd infrastructure
terraform destroy
```
Also delete the MongoDB Atlas cluster to stop that billing.

---

## 💰 Cost Estimate

| Usage | Cost |
|---|---|
| A few hours | ~₹0 (free tier) |
| 1-3 days | ~₹5 |
| 1 month | ~₹500 |

Route 53 hosted zone = $0.50/month (~₹42) — delete after use.
