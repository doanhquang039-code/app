# 🚀 Quick Start Guide

Get your Expense Tracker up and running in 5 minutes!

---

## ⚡ Super Quick Start (Local Development)

### 1. Install Dependencies (2 minutes)

```bash
cd app/backend
npm install --legacy-peer-deps
```

### 2. Configure Environment (1 minute)

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Minimum required:
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=your_password
DB_DATABASE=ExpenseTrackerDB
JWT_SECRET=your_secret_key
```

### 3. Start Server (1 minute)

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 4. Access Application (30 seconds)

```
REST API:    http://localhost:3000
GraphQL:     http://localhost:3000/graphql
Swagger:     http://localhost:3000/api/docs
```

**Done! 🎉 Your app is running!**

---

## 🌟 Full Setup (With Cloud Services)

### Step 1: Setup Cloud Accounts (10 minutes)

#### AWS Account
1. Go to https://aws.amazon.com
2. Create account (free tier available)
3. Create IAM user with S3, Lambda, SQS permissions
4. Get access key and secret key

#### Firebase Account
1. Go to https://console.firebase.google.com
2. Create new project
3. Enable Firestore, Authentication, Cloud Messaging
4. Download service account JSON
5. Get credentials

#### Cloudinary Account
1. Go to https://cloudinary.com
2. Sign up (free tier: 25GB/month)
3. Get cloud name, API key, API secret

#### SendGrid Account
1. Go to https://sendgrid.com
2. Sign up (free tier: 100 emails/day)
3. Create API key
4. Verify sender email

#### Twilio Account
1. Go to https://twilio.com
2. Sign up (free trial: $15 credit)
3. Get phone number
4. Get account SID and auth token

#### Stripe Account
1. Go to https://stripe.com
2. Sign up
3. Get API keys (test mode)
4. Create products & prices

---

### Step 2: Configure Cloud Environment (5 minutes)

```bash
# Copy cloud environment file
cp .env.cloud.example .env.cloud

# Edit .env.cloud with your credentials
```

**Required Cloud Credentials:**

```env
# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=expense-tracker-bucket

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxxx
```

---

### Step 3: Install Optional Services (10 minutes)

#### Redis (for caching)

**Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Windows:**
```bash
# Download from: https://redis.io/download
# Or use WSL: sudo apt install redis-server
```

**Mac:**
```bash
brew install redis
redis-server
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

---

#### Elasticsearch (for search)

**Docker:**
```bash
docker run -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.12.0
```

**Download:**
```bash
# Download from: https://www.elastic.co/downloads/elasticsearch
# Extract and run: bin/elasticsearch
```

---

### Step 4: Start All Services (2 minutes)

```bash
# Start Redis (if installed)
redis-server

# Start Elasticsearch (if installed)
elasticsearch

# Start Backend
cd app/backend
npm run start:dev

# Start Frontend (new terminal)
cd app/frontend
npm start

# Start Mobile (new terminal)
cd app/mobile
flutter run
```

---

## 🧪 Test Your Setup

### 1. Test REST API

```bash
# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Test GraphQL API

Open http://localhost:3000/graphql and run:

```graphql
query {
  transactions(userId: 1, limit: 5) {
    edges {
      node {
        id
        amount
        type
        note
      }
    }
  }
}
```

### 3. Test Cloud Services

```bash
# Test S3 upload
curl -X POST http://localhost:3000/cloud/s3/upload-receipt \
  -F "file=@receipt.jpg" \
  -F "userId=1"

# Test SendGrid email
curl -X POST http://localhost:3000/cloud/sendgrid/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello from Expense Tracker!</h1>"
  }'

# Test Twilio SMS
curl -X POST http://localhost:3000/cloud/twilio/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Test SMS from Expense Tracker"
  }'
```

---

## 🐳 Docker Quick Start

### Using Docker Compose (Easiest)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Using Docker (Manual)

```bash
# Build image
docker build -t expense-tracker .

# Run container
docker run -d -p 3000:3000 \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_password \
  expense-tracker

# View logs
docker logs -f <container_id>
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill process
taskkill /PID <pid> /F        # Windows
kill -9 <pid>                 # Mac/Linux
```

#### 2. Database Connection Failed
```bash
# Check SQL Server is running
# Check credentials in .env
# Check firewall allows port 1433
```

#### 3. Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Start Redis if not running
redis-server
```

#### 4. Elasticsearch Connection Failed
```bash
# Check Elasticsearch is running
curl http://localhost:9200

# Start Elasticsearch if not running
elasticsearch
```

#### 5. Cloud Service Errors
```bash
# Check credentials in .env.cloud
# Check API keys are valid
# Check service quotas/limits
```

---

## 📱 Mobile App Setup

### Android

```bash
cd app/mobile

# Install dependencies
flutter pub get

# Run on Android device/emulator
flutter run -d android

# Build APK
flutter build apk --release

# Install APK
adb install build/app/outputs/flutter-apk/app-release.apk
```

### iOS

```bash
cd app/mobile

# Install dependencies
flutter pub get
cd ios
pod install
cd ..

# Run on iOS device/simulator
flutter run -d ios

# Build iOS
flutter build ios --release
```

---

## 🌐 Frontend Setup

```bash
cd app/frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Serve production build
npm install -g serve
serve -s build
```

---

## 🚀 Production Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create expense-tracker

# Add database
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set AWS_ACCESS_KEY_ID=your_key
# ... set all other variables

# Deploy
git push heroku main

# Open app
heroku open
```

### Deploy to AWS

```bash
# Install AWS CLI
# Configure AWS credentials
aws configure

# Deploy to Elastic Beanstalk
eb init
eb create expense-tracker-env
eb deploy

# Deploy to Lambda (serverless)
npm install -g serverless
serverless deploy
```

### Deploy to Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd app/frontend
vercel --prod
```

---

## 📊 Monitoring

### Check Application Health

```bash
# Health check endpoint
curl http://localhost:3000/health

# Cloud services health
curl http://localhost:3000/cloud/health
```

### View Logs

```bash
# Application logs
tail -f logs/app.log

# Docker logs
docker logs -f <container_name>

# PM2 logs
pm2 logs
```

---

## 🎉 Next Steps

1. ✅ Application is running
2. ✅ Cloud services configured
3. ⏭️ Create your first user
4. ⏭️ Add transactions
5. ⏭️ Set up budgets
6. ⏭️ Explore AI insights
7. ⏭️ Try mobile app
8. ⏭️ Deploy to production

---

## 📚 Additional Resources

- [Complete Documentation](./README.md)
- [API Reference](./API_REFERENCE.md)
- [Cloud Services Guide](./CLOUD_SERVICES.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

## 💬 Get Help

- **Email:** support@expensetracker.com
- **Discord:** https://discord.gg/expensetracker
- **GitHub Issues:** https://github.com/your-repo/issues

---

## 🎊 Congratulations!

You're all set! Start tracking your expenses with the most advanced expense tracker! 🚀

**Happy Tracking! 💰**

---

**Last Updated:** April 30, 2026
