#!/bin/bash
# ==============================================================================
# Setup & Deploy FastAPI + PostgreSQL Backend on AWS EC2 (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================

set -e

echo "🔄 Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "🐍 Installing Python 3, venv, Nginx, and PostgreSQL server..."
sudo apt install -y python3 python3-pip python3-venv git nginx curl libpq-dev postgresql postgresql-contrib

echo "🗄️ Setting up PostgreSQL database on EC2..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'RSML';"
sudo -u postgres psql -c "CREATE DATABASE \"CGPA portal\";" 2>/dev/null || true

echo "📁 Setting up project directory..."
# Clone or pull latest
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "⚙️ Setting up systemd service..."
sudo cp aws/fastapi.service /etc/systemd/system/cgpa-fastapi.service
sudo systemctl daemon-reload
sudo systemctl enable cgpa-fastapi
sudo systemctl restart cgpa-fastapi

echo "🌐 Setting up Nginx..."
sudo cp aws/nginx.conf /etc/nginx/sites-available/cgpa-api
sudo ln -sf /etc/nginx/sites-available/cgpa-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Backend deployed and running on port 8000 (proxied via Nginx on port 80)!"
echo "👉 Check status with: sudo systemctl status cgpa-fastapi"
