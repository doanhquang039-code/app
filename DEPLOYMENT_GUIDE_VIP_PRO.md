# 🚀 Deployment Guide - VIP PRO Edition

## Hướng Dẫn Deploy Full Stack App

---

## 📋 Pre-Deployment Checklist

### ✅ Build Status
- [x] Backend built successfully
- [x] Frontend built successfully
- [x] Mobile built successfully
- [x] All tests passing
- [x] Documentation complete

### ✅ Environment Setup
- [ ] Production database ready
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Domain name configured
- [ ] Monitoring tools setup

---

## 🎯 Deployment Options

### Option 1: Cloud Platforms (Recommended)
- **Backend:** Railway, Render, Heroku
- **Frontend:** Vercel, Netlify
- **Database:** Azure SQL, AWS RDS

### Option 2: VPS/Dedicated Server
- **Server:** DigitalOcean, Linode, AWS EC2
- **Web Server:** Nginx + PM2
- **Database:** Self-hosted SQL Server

### Option 3: Containerized (Docker)
- **Orchestration:** Docker Compose, Kubernetes
- **Registry:** Docker Hub, AWS ECR
- **Hosting:** Any cloud provider

---

## 🔧 Backend Deployment

### Method 1: Railway (Easiest)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set DB_HOST=your_db_host
railway variables set DB_PASSWORD=your_password
railway variables set JWT_SECRET=your_secret

# Deploy
railway up
```

**Pros:** Easy, automatic HTTPS, free tier  
**Cons:** Limited free resources

---

### Method 2: Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   ```
   Name: expense-tracker-api
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```
5. Add environment variables
6. Click "Create Web Service"

**Pros:** Easy, free tier, auto-deploy  
**Cons:** Cold starts on free tier

---

### Method 3: VPS with PM2

```bash
# SSH to your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone your repo
git clone your-repo-url
cd backend

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start dist/main.js --name expense-tracker-api

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
# Run the command it outputs

# Configure Nginx
sudo nano /etc/nginx/sites-available/api.yourdomain.com
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/

# Test Nginx
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

**Pros:** Full control, no cold starts  
**Cons:** More setup, maintenance required

---

### Method 4: Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**Deploy:**
```bash
# Build image
docker build -t expense-tracker-api .

# Run container
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_secret \
  --name expense-tracker-api \
  expense-tracker-api

# Or use Docker Compose
docker-compose up -d
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=${DB_HOST}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped

  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=${DB_PASSWORD}
    ports:
      - "1433:1433"
    volumes:
      - db-data:/var/opt/mssql
    restart: unless-stopped

volumes:
  db-data:
```

**Pros:** Consistent environment, easy scaling  
**Cons:** Docker knowledge required

---

## 🎨 Frontend Deployment

### Method 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

**Or via GitHub:**
1. Go to https://vercel.com
2. Click "Import Project"
3. Connect GitHub repo
4. Select `frontend` folder
5. Configure:
   ```
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   ```
6. Add environment variables:
   ```
   VITE_API_URL=https://api.yourdomain.com
   VITE_WS_URL=wss://api.yourdomain.com
   ```
7. Click "Deploy"

**Pros:** Fastest, auto-deploy, free SSL  
**Cons:** None for static sites

---

### Method 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

**Or via GitHub:**
1. Go to https://netlify.com
2. Click "Add new site" → "Import from Git"
3. Connect GitHub repo
4. Configure:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
5. Add environment variables
6. Click "Deploy"

**Pros:** Easy, free SSL, CDN  
**Cons:** None for static sites

---

### Method 3: AWS S3 + CloudFront

```bash
# Build
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://your-bucket-name

# Configure bucket for static hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html

# Upload files
aws s3 sync dist/ s3://your-bucket-name

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name your-bucket-name.s3.amazonaws.com

# Invalidate cache on updates
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

**Pros:** Scalable, fast CDN  
**Cons:** More complex setup

---

### Method 4: Nginx Static

```bash
# Build
cd frontend
npm run build

# Copy to server
scp -r dist/* user@server:/var/www/yourdomain.com/

# Nginx config
sudo nano /etc/nginx/sites-available/yourdomain.com
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/yourdomain.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Test and restart
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Pros:** Full control, fast  
**Cons:** Manual updates

---

## 📱 Mobile Deployment

### Web Hosting

```bash
cd mobile/build/web

# Firebase Hosting
firebase init hosting
firebase deploy

# Netlify
netlify deploy --prod --dir=.

# GitHub Pages
git subtree push --prefix mobile/build/web origin gh-pages
```

### Android APK

```bash
cd mobile
flutter build apk --release

# Output: build/app/outputs/flutter-apk/app-release.apk
# Upload to Google Play Store
```

### iOS App

```bash
cd mobile
flutter build ios --release

# Open Xcode and archive
# Upload to App Store Connect
```

---

## 🗄️ Database Setup

### Azure SQL Database

1. Create Azure SQL Database
2. Configure firewall rules
3. Get connection string
4. Run migrations:

```bash
cd backend
npm run migration:run
```

### AWS RDS

1. Create RDS SQL Server instance
2. Configure security groups
3. Get endpoint
4. Run migrations

### Self-Hosted

```bash
# Install SQL Server on Linux
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo add-apt-repository "$(wget -qO- https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2019.list)"
sudo apt-get update
sudo apt-get install -y mssql-server

# Configure
sudo /opt/mssql/bin/mssql-conf setup

# Run migrations
cd backend
npm run migration:run
```

---

## 🔒 Security Checklist

### Backend:
- [ ] Environment variables secured
- [ ] JWT secret strong and unique
- [ ] Database password strong
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] SQL injection protection
- [ ] XSS prevention

### Frontend:
- [ ] API URL uses HTTPS
- [ ] No sensitive data in code
- [ ] CSP headers configured
- [ ] HTTPS enforced

### Database:
- [ ] Strong password
- [ ] Firewall configured
- [ ] Backups enabled
- [ ] Encryption at rest
- [ ] SSL connections

---

## 📊 Monitoring Setup

### Backend Monitoring

**PM2 Monitoring:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Application Insights (Azure):**
```bash
npm install applicationinsights
```

```typescript
// main.ts
import * as appInsights from 'applicationinsights';
appInsights.setup('YOUR_INSTRUMENTATION_KEY').start();
```

---

### Frontend Monitoring

**Google Analytics:**
```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Sentry:**
```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

---

## 🔄 CI/CD Setup

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm run build
      - run: cd backend && npm test
      # Deploy to your platform

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      # Deploy to Vercel/Netlify
```

---

## 🎯 Post-Deployment

### 1. Verify Deployment
```bash
# Check backend
curl https://api.yourdomain.com/health

# Check frontend
curl https://yourdomain.com

# Test API
curl https://api.yourdomain.com/api/docs
```

### 2. Monitor Logs
```bash
# PM2 logs
pm2 logs expense-tracker-api

# Docker logs
docker logs expense-tracker-api

# Check errors
pm2 logs --err
```

### 3. Performance Testing
```bash
# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 https://api.yourdomain.com
```

### 4. Setup Backups
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
sqlcmd -S localhost -U sa -P password \
  -Q "BACKUP DATABASE ExpenseTrackerDB TO DISK='/backup/db_$DATE.bak'"
```

---

## 🎉 Success!

Your VIP PRO app is now deployed! 🚀

**URLs:**
- Backend API: https://api.yourdomain.com
- Frontend App: https://yourdomain.com
- API Docs: https://api.yourdomain.com/api/docs

**Next Steps:**
1. Monitor performance
2. Collect user feedback
3. Plan updates
4. Scale as needed

---

**Happy Deploying!** 🎊
