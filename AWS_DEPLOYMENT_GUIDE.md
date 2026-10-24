# ☁️ Complete AWS Deployment Guide: React + FastAPI + PostgreSQL

This guide walks you step-by-step through deploying your **Academic CGPA Portal** to **AWS**:
* **Frontend:** Hosted on **AWS S3** and distributed globally with **AWS CloudFront (CDN)**.
* **Backend:** Hosted on **AWS EC2 (Ubuntu Linux)** running **FastAPI REST API** with **Nginx** and **Systemd** (or Docker).
* **Database:** **PostgreSQL** (via AWS RDS PostgreSQL Free Tier, or Cloud PostgreSQL on Neon/Supabase, or PostgreSQL on EC2).

---

## 🏛️ System Architecture

```text
[ Students / Browser ]
         │
         ├─── (Static Assets & React App) ───► [ AWS CloudFront CDN ]
         │                                            │
         │                                            ▼
         │                                   [ AWS S3 Bucket ]
         │
         └─── (REST API Calls & JWT) ────────► [ AWS EC2 Instance ]
                                                      │
                                                      ▼
                                                [ Nginx (Port 80/443) ]
                                                      │
                                                      ▼
                                           [ FastAPI Uvicorn (Port 8000) ]
                                                      │
                                                      ▼
                                           [ PostgreSQL Database (SQLAlchemy) ]
```

---

## 📋 Prerequisites
1. An active [AWS Account](https://aws.amazon.com).
2. [AWS CLI](https://aws.amazon.com/cli/) installed and configured (`aws configure`).
3. A PostgreSQL database (e.g., AWS RDS PostgreSQL Free Tier, or free [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com) cluster).

---

## 🚀 Part 1: Deploy Backend to AWS EC2

### Step 1: Launch an EC2 Instance
1. Go to **AWS Console** → **EC2** → **Launch Instance**.
2. **Name:** `cgpa-backend-server`
3. **OS Image:** **Ubuntu 24.04 LTS** (or 22.04 LTS) - *Free tier eligible*.
4. **Instance Type:** `t2.micro` or `t3.micro` (Free tier eligible).
5. **Key Pair:** Create a new key pair (e.g., `cgpa-key.pem`) and download it.
6. **Network & Security Group Settings:**
   * Allow **SSH** (Port `22`) from your IP.
   * Allow **HTTP** (Port `80`) from Anywhere (`0.0.0.0/0`).
   * Allow **HTTPS** (Port `443`) from Anywhere (`0.0.0.0/0`).
   * Allow **Custom TCP** (Port `8000`) if you want direct access to FastAPI Swagger docs.
7. Click **Launch Instance**.

---

### Step 2: Connect to your EC2 Instance
Open your terminal (PowerShell or Bash) where `cgpa-key.pem` is saved:
```bash
chmod 400 cgpa-key.pem   # (Linux/Mac only)
ssh -i "cgpa-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

### Step 3: Clone Code and Setup Environment
Inside the EC2 terminal:
```bash
# Clone your repository
git clone https://github.com/rsmsurya-sys/CGPA-GPA-portal.git
cd CGPA-GPA-portal

# Make deployment script executable and run it
chmod +x aws/deploy-backend-ec2.sh
./aws/deploy-backend-ec2.sh
```

---

### Step 4: Configure PostgreSQL & Environment Variables
Edit the backend `.env` file on EC2:
```bash
nano backend/.env
```
Update with your PostgreSQL connection string (AWS RDS, Neon.tech, or local PostgreSQL):
```env
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
DATABASE_URL=postgresql+asyncpg://<username>:<password>@<db-host>:5432/cgpa_portal_db
JWT_SECRET=your_super_strong_production_secret_key_123
CORS_ORIGINS=*
```

Restart the service:
```bash
sudo systemctl restart cgpa-fastapi
```

Test your API in your browser:
* `http://<YOUR_EC2_PUBLIC_IP>/health`
* `http://<YOUR_EC2_PUBLIC_IP>/docs` *(Interactive Swagger UI & REST API Testing)*

---

## 🎨 Part 2: Deploy Frontend to AWS S3 & CloudFront

### Step 1: Update Frontend API Target
In your local repository root, update `.env` to point to your new EC2 Public IP:
```env
VITE_API_URL=http://<YOUR_EC2_PUBLIC_IP>
```

Build the production bundle:
```bash
npm run build
```
This produces optimized production files inside the `dist/` directory.

---

### Step 2: Create AWS S3 Bucket
1. Open **AWS Console** → **S3** → **Create bucket**.
2. **Bucket Name:** `cgpa-portal-frontend-bucket` (must be globally unique).
3. **Region:** Choose closest region (e.g. `ap-south-1` Mumbai).
4. Uncheck **Block all public access** (acknowledge warning).
5. Click **Create bucket**.
6. Open bucket → **Properties** tab → Scroll to **Static website hosting** → **Edit**:
   * Enable Static Website Hosting.
   * Index document: `index.html`
   * Error document: `index.html` (Required for React Single Page Application routing).
7. Under **Permissions** tab → **Bucket Policy** → **Edit**, paste:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```
*(Replace `YOUR_BUCKET_NAME` with your actual bucket name)*.

---

### Step 3: Create AWS CloudFront Distribution
1. Go to **AWS Console** → **CloudFront** → **Create Distribution**.
2. **Origin Domain:** Select your S3 bucket website endpoint.
3. **Viewer Protocol Policy:** Select **Redirect HTTP to HTTPS**.
4. **Allowed HTTP Methods:** `GET, HEAD, OPTIONS`.
5. Under **Error Pages** tab:
   * Create custom error response:
     * HTTP Error Code: `403` & `404`
     * Customize error response: **Yes**
     * Response Page Path: `/index.html`
     * HTTP Response Code: `200: OK`
6. Click **Create Distribution**.
7. Copy your CloudFront Domain Name: `https://d1234567abcdef.cloudfront.net`.

---

### Step 4: Upload Static Files to S3
From your local terminal, run:
```bash
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```
Or use the automated deployment script:
```bash
chmod +x aws/deploy-frontend-s3.sh
./aws/deploy-frontend-s3.sh
```

---

## 🔒 Optional: Free SSL / HTTPS on EC2 using Let's Encrypt
If you point a custom domain (e.g., `api.yourdomain.com`) to your EC2 instance:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```
Certbot will automatically configure HTTPS, issue an SSL certificate, and set up automatic renewal.
