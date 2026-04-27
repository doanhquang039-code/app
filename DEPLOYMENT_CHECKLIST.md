# 🚀 Deployment Checklist

Checklist đầy đủ để deploy ứng dụng Expense Tracker lên production.

---

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [x] Tất cả TypeScript errors đã được fix
- [x] ESLint warnings đã được xử lý
- [x] Code đã được format đúng chuẩn
- [x] Không có console.log trong production code
- [x] Tất cả TODO comments đã được xử lý

### 2. Testing
- [ ] Unit tests pass (nếu có)
- [ ] Integration tests pass (nếu có)
- [ ] E2E tests pass (nếu có)
- [ ] Manual testing hoàn tất
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing

### 3. Security
- [ ] Environment variables được cấu hình đúng
- [ ] Không có sensitive data trong code
- [ ] JWT secret được generate mạnh
- [ ] CORS được cấu hình đúng
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Rate limiting được enable

### 4. Performance
- [ ] Bundle size được optimize
- [ ] Images được optimize
- [ ] Lazy loading được implement
- [ ] Code splitting được setup
- [ ] Database indexes được tạo
- [ ] API response time < 100ms

---

## 🗄️ Database Deployment

### 1. Backup Database hiện tại (nếu có)
```bash
# SQL Server backup
sqlcmd -S your_server -U sa -P password -Q "BACKUP DATABASE ExpenseTrackerDB TO DISK='backup.bak'"
```

### 2. Tạo Production Database
```bash
# Tạo database
sqlcmd -S production_server -U sa -P password -Q "CREATE DATABASE ExpenseTrackerDB"
```

### 3. Run Migrations (theo thứ tự)
```bash
# Migration 1: New Features
sqlcmd -S production_server -U sa -P password -d ExpenseTrackerDB -i migration_new_features.sql

# Migration 2: Recurring & Savings
sqlcmd -S production_server -U sa -P password -d ExpenseTrackerDB -i migration_recurring_and_savings.sql

# Migration 3: Budgets & Users
sqlcmd -S production_server -U sa -P password -d ExpenseTrackerDB -i migration_budgets_and_users.sql

# Migration 4: Debts & Investments
sqlcmd -S production_server -U sa -P password -d ExpenseTrackerDB -i migration_debts_investments_networth.sql

# Migration 5: Advanced Features
sqlcmd -S production_server -U sa -P password -d ExpenseTrackerDB -i migration_advanced_features.sql

# Migration 6: AI & Subscriptions
sqlcmd -S production_server -U sa -P password -d ExpenseTrackerDB -i migration_ai_subscriptions.sql
```

### 4. Seed Initial Data (Optional)
```bash
# Seed achievements, categories, etc.
sqlcmd -S production_server -U sa -P password -d ExpenseTrackerDB -i seed_data.sql
```

### 5. Verify Database
```bash
# Check tables
sqlcmd -S production_server -U sa -P password -d ExpenseTrackerDB -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES"

# Should return 37 tables
```

---

## 🔧 Backend Deployment

### 1. Environment Variables
Create `backend/.env.production`:

```env
# Database
DB_HOST=your_production_db_host
DB_PORT=1433
DB_USERNAME=your_db_user
DB_PASSWORD=your_strong_password
DB_DATABASE=ExpenseTrackerDB

# JWT
JWT_SECRET=your-super-secret-production-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Build Backend
```bash
cd backend
npm install --production
npm run build
```

### 3. Deploy Options

#### Option A: Traditional Server (VPS, EC2)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/main.js --name expense-tracker-api

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

#### Option B: Docker
```bash
# Build Docker image
docker build -t expense-tracker-backend .

# Run container
docker run -d \
  --name expense-tracker-api \
  -p 3000:3000 \
  --env-file .env.production \
  expense-tracker-backend

# Or use docker-compose
docker-compose up -d
```

#### Option C: Cloud Platform (Heroku, Railway, Render)
```bash
# Follow platform-specific deployment guide
# Usually involves:
# 1. Connect Git repository
# 2. Set environment variables
# 3. Deploy
```

### 4. Setup Nginx Reverse Proxy (Optional)
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

### 5. Setup SSL Certificate
```bash
# Using Certbot (Let's Encrypt)
sudo certbot --nginx -d api.yourdomain.com
```

### 6. Verify Backend
```bash
# Health check
curl https://api.yourdomain.com/api/health

# Swagger docs
curl https://api.yourdomain.com/api/docs
```

---

## 🎨 Frontend Deployment

### 1. Environment Variables
Create `frontend/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com
```

### 2. Build Frontend
```bash
cd frontend
npm install
npm run build
```

This creates a `dist/` folder with optimized production files.

### 3. Deploy Options

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod

# Or connect GitHub repo on Vercel dashboard
```

**Vercel Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Environment Variables: Add `VITE_API_URL`

#### Option B: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod --dir=dist

# Or drag & drop dist/ folder on Netlify dashboard
```

**Netlify Configuration:**
- Build Command: `npm run build`
- Publish Directory: `dist`
- Environment Variables: Add `VITE_API_URL`

Create `frontend/netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option C: AWS S3 + CloudFront
```bash
# Install AWS CLI
aws configure

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Option D: Traditional Server (Nginx)
```bash
# Copy dist files to server
scp -r dist/* user@server:/var/www/expense-tracker

# Nginx config
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/expense-tracker;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4. Setup SSL Certificate
```bash
# Using Certbot
sudo certbot --nginx -d yourdomain.com
```

### 5. Verify Frontend
```bash
# Check if site is live
curl https://yourdomain.com

# Check if API connection works
# Login and check Network tab in DevTools
```

---

## 🔍 Post-Deployment Verification

### 1. Backend Health Checks
- [ ] API is accessible
- [ ] Swagger docs load
- [ ] Database connection works
- [ ] JWT authentication works
- [ ] All endpoints respond correctly

### 2. Frontend Health Checks
- [ ] Site loads correctly
- [ ] Login/Register works
- [ ] All 10 pages load
- [ ] API calls work
- [ ] Charts render correctly
- [ ] Modals open/close
- [ ] Forms submit correctly

### 3. Integration Tests
- [ ] Create transaction
- [ ] Create budget
- [ ] Create savings goal
- [ ] Create subscription
- [ ] View analytics
- [ ] Use AI insights
- [ ] Add friend
- [ ] Join challenge
- [ ] Check achievements
- [ ] Update settings

### 4. Performance Tests
- [ ] Page load time < 2s
- [ ] API response time < 100ms
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] No network errors

---

## 📊 Monitoring Setup

### 1. Backend Monitoring

#### PM2 Monitoring
```bash
# View logs
pm2 logs expense-tracker-api

# Monitor resources
pm2 monit

# View status
pm2 status
```

#### Application Monitoring (Optional)
- **Sentry** - Error tracking
- **New Relic** - Performance monitoring
- **DataDog** - Infrastructure monitoring

### 2. Frontend Monitoring

#### Analytics (Optional)
- **Google Analytics** - User behavior
- **Mixpanel** - Event tracking
- **Hotjar** - Heatmaps

#### Error Tracking (Optional)
- **Sentry** - Frontend errors
- **LogRocket** - Session replay

### 3. Database Monitoring
```sql
-- Check database size
SELECT 
    DB_NAME(database_id) AS DatabaseName,
    (SUM(size) * 8 / 1024) AS SizeMB
FROM sys.master_files
WHERE DB_NAME(database_id) = 'ExpenseTrackerDB'
GROUP BY database_id;

-- Check table sizes
SELECT 
    t.NAME AS TableName,
    p.rows AS RowCounts,
    SUM(a.total_pages) * 8 AS TotalSpaceKB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
GROUP BY t.Name, p.Rows
ORDER BY TotalSpaceKB DESC;
```

---

## 🔄 Backup Strategy

### 1. Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
sqlcmd -S server -U sa -P password -Q "BACKUP DATABASE ExpenseTrackerDB TO DISK='/backups/db_$DATE.bak'"

# Keep only last 7 days
find /backups -name "db_*.bak" -mtime +7 -delete
```

### 2. File Backup
```bash
# Backup uploaded files
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Sync to S3
aws s3 sync uploads/ s3://your-backup-bucket/uploads/
```

### 3. Automated Backup (Cron)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

---

## 🚨 Rollback Plan

### If Deployment Fails:

#### 1. Backend Rollback
```bash
# PM2
pm2 stop expense-tracker-api
pm2 delete expense-tracker-api
# Deploy previous version
pm2 start previous-version/dist/main.js --name expense-tracker-api

# Docker
docker stop expense-tracker-api
docker rm expense-tracker-api
docker run -d --name expense-tracker-api previous-image:tag
```

#### 2. Frontend Rollback
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# S3
aws s3 sync previous-dist/ s3://your-bucket-name --delete
```

#### 3. Database Rollback
```bash
# Restore from backup
sqlcmd -S server -U sa -P password -Q "RESTORE DATABASE ExpenseTrackerDB FROM DISK='/backups/db_backup.bak' WITH REPLACE"
```

---

## 📝 Deployment Checklist Summary

### Pre-Deployment:
- [ ] Code quality checks passed
- [ ] All tests passed
- [ ] Security audit completed
- [ ] Performance optimized

### Database:
- [ ] Backup created
- [ ] Production database created
- [ ] All migrations run successfully
- [ ] Seed data loaded (if needed)
- [ ] Database verified

### Backend:
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Deployed to server
- [ ] SSL certificate installed
- [ ] Health checks passed

### Frontend:
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Deployed to hosting
- [ ] SSL certificate installed
- [ ] Site accessible

### Post-Deployment:
- [ ] All features tested
- [ ] Performance verified
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Documentation updated

---

## 🎉 Deployment Complete!

Congratulations! Your Expense Tracker application is now live in production! 🚀

### Next Steps:
1. Monitor application for first 24 hours
2. Collect user feedback
3. Plan next iteration
4. Setup automated testing
5. Implement CI/CD pipeline

---

**Deployment Date:** [Date]  
**Deployed By:** [Name]  
**Version:** 1.0.0  
**Status:** ✅ LIVE

**URLs:**
- Frontend: https://yourdomain.com
- Backend API: https://api.yourdomain.com
- API Docs: https://api.yourdomain.com/api/docs
