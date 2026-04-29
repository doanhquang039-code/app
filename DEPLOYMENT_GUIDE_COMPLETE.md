# 🚀 Complete Deployment Guide - Expense Tracker

**Version:** 2.0.0  
**Date:** April 29, 2026  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Mobile Deployment](#mobile-deployment)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] All tests passing
- [x] No TypeScript errors
- [x] Code reviewed
- [x] Documentation updated
- [x] Environment variables configured
- [x] Security audit completed

### Infrastructure
- [ ] Production server ready
- [ ] Database server configured
- [ ] Domain name registered
- [ ] SSL certificate obtained
- [ ] CDN configured (optional)
- [ ] Backup system in place

### Third-Party Services
- [ ] Plaid account (for bank integration)
- [ ] Email service (SMTP)
- [ ] Cloud storage (optional)
- [ ] Monitoring service (optional)

---

## 🌍 Environment Setup

### Production Server Requirements

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 50 GB SSD
- OS: Ubuntu 20.04+ / Windows Server 2019+

**Recommended:**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 100 GB SSD
- OS: Ubuntu 22.04 LTS

### Software Installation

#### Ubuntu/Linux

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install SQL Server (if not using external database)
# Follow: https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-ubuntu
```

#### Windows Server

```powershell
# Install Node.js from https://nodejs.org/

# Install PM2
npm install -g pm2
npm install -g pm2-windows-service
pm2-service-install

# Install IIS (optional)
Install-WindowsFeature -name Web-Server -IncludeManagementTools

# Install SQL Server from Microsoft website
```

---

## 🗄️ Database Deployment

### Step 1: Create Production Database

```sql
-- Connect to SQL Server
sqlcmd -S your-production-server -U sa -P YourStrongPassword

-- Create database
CREATE DATABASE ExpenseTrackerDB;
GO

-- Create application user
CREATE LOGIN expense_tracker_user WITH PASSWORD = 'YourStrongPassword123!';
GO

USE ExpenseTrackerDB;
GO

CREATE USER expense_tracker_user FOR LOGIN expense_tracker_user;
GO

-- Grant permissions
ALTER ROLE db_owner ADD MEMBER expense_tracker_user;
GO
```

### Step 2: Run Migrations

```bash
# Upload migration file to server
scp migration_advanced_features.sql user@server:/tmp/

# Connect to server
ssh user@server

# Run migration
sqlcmd -S localhost -U expense_tracker_user -P YourStrongPassword123! -d ExpenseTrackerDB -i /tmp/migration_advanced_features.sql
```

### Step 3: Verify Database

```sql
-- Check tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Should return 37 tables
```

### Step 4: Configure Backup

```sql
-- Create backup job (SQL Server Agent)
USE msdb;
GO

EXEC sp_add_job
    @job_name = N'ExpenseTracker_Daily_Backup',
    @enabled = 1;
GO

EXEC sp_add_jobstep
    @job_name = N'ExpenseTracker_Daily_Backup',
    @step_name = N'Backup Database',
    @subsystem = N'TSQL',
    @command = N'BACKUP DATABASE ExpenseTrackerDB TO DISK = ''C:\Backups\ExpenseTrackerDB_$(ESCAPE_SQUOTE(DATE)).bak'' WITH COMPRESSION;',
    @retry_attempts = 3,
    @retry_interval = 5;
GO

EXEC sp_add_schedule
    @schedule_name = N'Daily at 2 AM',
    @freq_type = 4,
    @freq_interval = 1,
    @active_start_time = 020000;
GO

EXEC sp_attach_schedule
    @job_name = N'ExpenseTracker_Daily_Backup',
    @schedule_name = N'Daily at 2 AM';
GO

EXEC sp_add_jobserver
    @job_name = N'ExpenseTracker_Daily_Backup';
GO
```

---

## 🔧 Backend Deployment

### Step 1: Prepare Application

```bash
# On your local machine
cd app/backend

# Install dependencies
npm install --production

# Build application
npm run build

# Create deployment package
tar -czf backend-deploy.tar.gz dist/ node_modules/ package.json package-lock.json
```

### Step 2: Upload to Server

```bash
# Upload package
scp backend-deploy.tar.gz user@server:/var/www/expense-tracker/

# Connect to server
ssh user@server

# Extract package
cd /var/www/expense-tracker
tar -xzf backend-deploy.tar.gz
```

### Step 3: Configure Environment

```bash
# Create .env file
nano /var/www/expense-tracker/.env
```

```env
# Production Environment Variables

# Database
DB_HOST=your-db-server.com
DB_PORT=1433
DB_USERNAME=expense_tracker_user
DB_PASSWORD=YourStrongPassword123!
DB_DATABASE=ExpenseTrackerDB

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Email
MAIL_USER=noreply@yourdomain.com
MAIL_PASS=your-email-app-password

# Plaid
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=production

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/expense-tracker/uploads

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/expense-tracker/app.log
```

### Step 4: Start with PM2

```bash
# Start application
cd /var/www/expense-tracker
pm2 start dist/main.js --name expense-tracker-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor
pm2 logs expense-tracker-api
pm2 monit
```

### Step 5: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/expense-tracker-api
```

```nginx
upstream expense_tracker_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/expense-tracker-api-access.log;
    error_log /var/log/nginx/expense-tracker-api-error.log;

    # Proxy settings
    location / {
        proxy_pass http://expense_tracker_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File upload size
    client_max_body_size 10M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/expense-tracker-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🌐 Frontend Deployment

### Step 1: Build Frontend

```bash
# On your local machine
cd app/frontend

# Update API URL in .env.production
echo "VITE_API_URL=https://api.yourdomain.com" > .env.production

# Install dependencies
npm install

# Build for production
npm run build

# Create deployment package
tar -czf frontend-deploy.tar.gz dist/
```

### Step 2: Upload to Server

```bash
# Upload package
scp frontend-deploy.tar.gz user@server:/var/www/

# Connect to server
ssh user@server

# Extract package
cd /var/www
mkdir -p expense-tracker-frontend
cd expense-tracker-frontend
tar -xzf ../frontend-deploy.tar.gz
```

### Step 3: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/expense-tracker-frontend
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root directory
    root /var/www/expense-tracker-frontend/dist;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/expense-tracker-frontend-access.log;
    error_log /var/log/nginx/expense-tracker-frontend-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional - if not using separate subdomain)
    location /api {
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
sudo ln -s /etc/nginx/sites-available/expense-tracker-frontend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Alternative: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd app/frontend
vercel --prod

# Configure environment variables in Vercel dashboard
# VITE_API_URL=https://api.yourdomain.com
```

---

## 📱 Mobile Deployment

### Android Deployment

#### Step 1: Prepare for Release

```bash
cd app/mobile

# Update version in pubspec.yaml
nano pubspec.yaml
# version: 2.0.0+1

# Update API URL
nano lib/config/api_config.dart
# const String API_URL = 'https://api.yourdomain.com';
```

#### Step 2: Generate Signing Key

```bash
# Generate keystore
keytool -genkey -v -keystore ~/expense-tracker-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias expense-tracker

# Create key.properties
nano android/key.properties
```

```properties
storePassword=YourStorePassword
keyPassword=YourKeyPassword
keyAlias=expense-tracker
storeFile=/home/user/expense-tracker-key.jks
```

#### Step 3: Configure Gradle

```bash
nano android/app/build.gradle
```

```gradle
// Add before android block
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

#### Step 4: Build Release

```bash
# Build APK
flutter build apk --release

# Build App Bundle (for Play Store)
flutter build appbundle --release

# Output files:
# build/app/outputs/flutter-apk/app-release.apk
# build/app/outputs/bundle/release/app-release.aab
```

#### Step 5: Upload to Google Play Store

1. Go to https://play.google.com/console
2. Create new application
3. Upload app-release.aab
4. Fill in store listing details
5. Set up pricing and distribution
6. Submit for review

### iOS Deployment

#### Step 1: Configure Xcode

```bash
cd app/mobile

# Open in Xcode
open ios/Runner.xcworkspace

# In Xcode:
# 1. Select Runner target
# 2. Update Bundle Identifier
# 3. Update Version and Build number
# 4. Configure Signing & Capabilities
# 5. Select your Team
```

#### Step 2: Build for Release

```bash
# Build iOS
flutter build ios --release

# Archive in Xcode:
# Product > Archive
# Distribute App > App Store Connect
# Upload
```

#### Step 3: Upload to App Store

1. Go to https://appstoreconnect.apple.com
2. Create new app
3. Upload build from Xcode
4. Fill in app information
5. Submit for review

---

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate for API
sudo certbot --nginx -d api.yourdomain.com

# Obtain certificate for frontend
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

### Using Commercial SSL

```bash
# Generate CSR
openssl req -new -newkey rsa:2048 -nodes -keyout yourdomain.com.key -out yourdomain.com.csr

# Submit CSR to SSL provider
# Download certificate files

# Install certificate
sudo cp yourdomain.com.crt /etc/ssl/certs/
sudo cp yourdomain.com.key /etc/ssl/private/
sudo cp ca-bundle.crt /etc/ssl/certs/

# Update Nginx configuration with certificate paths
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs expense-tracker-api

# View logs with filter
pm2 logs expense-tracker-api --lines 100 --err

# Flush logs
pm2 flush
```

### Application Logging

```bash
# Create log directory
sudo mkdir -p /var/log/expense-tracker
sudo chown -R $USER:$USER /var/log/expense-tracker

# Configure log rotation
sudo nano /etc/logrotate.d/expense-tracker
```

```
/var/log/expense-tracker/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Database Monitoring

```sql
-- Create monitoring view
CREATE VIEW vw_DatabaseStats AS
SELECT 
    (SELECT COUNT(*) FROM Users) as TotalUsers,
    (SELECT COUNT(*) FROM Transactions) as TotalTransactions,
    (SELECT COUNT(*) FROM BankAccounts) as TotalBankAccounts,
    (SELECT SUM(balance) FROM Wallets) as TotalBalance,
    (SELECT COUNT(*) FROM DeviceSessions WHERE isActive = 1) as ActiveSessions;
GO

-- Query stats
SELECT * FROM vw_DatabaseStats;
```

### Setup Monitoring Dashboard (Optional)

```bash
# Install Grafana
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# Access at http://server-ip:3000
# Default login: admin/admin
```

---

## 💾 Backup & Recovery

### Database Backup

```bash
# Create backup script
nano /home/user/scripts/backup-database.sh
```

```bash
#!/bin/bash

# Configuration
DB_SERVER="localhost"
DB_USER="expense_tracker_user"
DB_PASS="YourStrongPassword123!"
DB_NAME="ExpenseTrackerDB"
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ExpenseTrackerDB_$DATE.bak"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
sqlcmd -S $DB_SERVER -U $DB_USER -P $DB_PASS -Q "BACKUP DATABASE $DB_NAME TO DISK='$BACKUP_FILE' WITH COMPRESSION;"

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.bak" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

```bash
# Make executable
chmod +x /home/user/scripts/backup-database.sh

# Add to crontab
crontab -e

# Add line (daily at 2 AM)
0 2 * * * /home/user/scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

### Application Backup

```bash
# Create backup script
nano /home/user/scripts/backup-application.sh
```

```bash
#!/bin/bash

# Configuration
APP_DIR="/var/www/expense-tracker"
BACKUP_DIR="/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/expense-tracker_$DATE.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_FILE $APP_DIR

# Delete backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

### Recovery Procedure

```bash
# Database recovery
sqlcmd -S localhost -U sa -P password -Q "RESTORE DATABASE ExpenseTrackerDB FROM DISK='/backups/database/ExpenseTrackerDB_20260429.bak' WITH REPLACE;"

# Application recovery
cd /var/www
tar -xzf /backups/application/expense-tracker_20260429.tar.gz

# Restart services
pm2 restart expense-tracker-api
sudo systemctl reload nginx
```

---

## 🔧 Troubleshooting

### Backend Issues

#### Application won't start

```bash
# Check logs
pm2 logs expense-tracker-api --lines 50

# Check if port is in use
sudo netstat -tulpn | grep :3000

# Check environment variables
pm2 env 0

# Restart application
pm2 restart expense-tracker-api
```

#### Database connection errors

```bash
# Test database connection
sqlcmd -S your-db-server -U expense_tracker_user -P password -d ExpenseTrackerDB -Q "SELECT 1"

# Check firewall
sudo ufw status
sudo ufw allow 1433/tcp

# Check SQL Server status
sudo systemctl status mssql-server
```

### Frontend Issues

#### 404 errors on refresh

```nginx
# Ensure this is in Nginx config
location / {
    try_files $uri $uri/ /index.html;
}
```

#### API connection errors

```bash
# Check CORS settings in backend
# Check API URL in frontend .env
# Check Nginx proxy configuration
# Check SSL certificates
```

### Mobile Issues

#### Build failures

```bash
# Clean build
flutter clean
flutter pub get
flutter build apk --release

# Check for errors
flutter doctor -v
```

#### API connection errors

```dart
// Check API URL in config
// Check SSL certificate validation
// Check network permissions in AndroidManifest.xml
```

---

## 📞 Support

For deployment support:
- Check logs: `pm2 logs expense-tracker-api`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check database logs: SQL Server error logs
- Review this guide
- Contact support team

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible via HTTPS
- [ ] API endpoints responding correctly
- [ ] Database connections working
- [ ] Authentication working
- [ ] File uploads working
- [ ] Email notifications working
- [ ] Bank integration working (if configured)
- [ ] Mobile apps published
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] SSL certificates valid
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Documentation updated

---

**Deployment Guide Version:** 2.0.0  
**Last Updated:** April 29, 2026  
**Status:** ✅ Complete

**Congratulations on your deployment! 🎉**
