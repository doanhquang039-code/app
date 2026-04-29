# 🚀 Quick Start Guide - Expense Tracker

**Version:** 2.0.0  
**Last Updated:** April 29, 2026

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ SQL Server installed
- ✅ Git installed

### Step 1: Setup Database (1 minute)

```bash
# Create database
sqlcmd -S localhost -U sa -P YourPassword -Q "CREATE DATABASE ExpenseTrackerDB"

# Run migration
sqlcmd -S localhost -U sa -P YourPassword -d ExpenseTrackerDB -i migration_advanced_features.sql
```

### Step 2: Configure Backend (1 minute)

```bash
cd app/backend

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourPassword
DB_DATABASE=ExpenseTrackerDB
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
EOF

# Install dependencies (if not already done)
npm install
```

### Step 3: Start Backend (1 minute)

```bash
# Start backend server
npm run start:dev

# Backend will be available at: http://localhost:3000
# API Documentation: http://localhost:3000/api
```

### Step 4: Start Frontend (1 minute)

Open a new terminal:

```bash
cd app/frontend

# Install dependencies (if not already done)
npm install

# Start frontend
npm run dev

# Frontend will be available at: http://localhost:5173
```

### Step 5: Test Application (1 minute)

Open browser and go to: **http://localhost:5173**

Or test API endpoints:

```bash
# Windows PowerShell
cd app
.\test-features.ps1

# Linux/Mac
cd app
chmod +x test-advanced-features.sh
./test-advanced-features.sh
```

---

## 🎯 What You Get

### ✅ Backend (NestJS)
- 🔐 Authentication & Authorization
- 💳 Transaction Management
- 📊 Budget Tracking
- 🏦 Bank Integration (Plaid)
- 🤖 AI Analysis
- 🎤 Voice Commands
- 📸 Receipt OCR
- 🎮 Gamification
- 👥 Social Features
- 📈 Analytics & Reports

**API Documentation:** http://localhost:3000/api

### ✅ Frontend (React)
- 📱 Responsive Design
- 🎨 Modern UI with TailwindCSS
- 📊 Interactive Charts
- 🔄 Real-time Updates
- 🌙 Dark Mode Support
- 📱 Mobile-Friendly

**Access:** http://localhost:5173

### ✅ Database (SQL Server)
- 37 Tables
- 50+ Indexes
- 40+ Foreign Keys
- Complete Schema

---

## 📚 Key Features

### Core Features
1. **Authentication** - Register, Login, JWT tokens
2. **Transactions** - Create, edit, delete, search
3. **Budgets** - Set budgets, track spending, alerts
4. **Categories** - Organize transactions
5. **Wallets** - Multiple wallets, multi-currency
6. **Reports** - Income vs Expense, trends, analytics

### Advanced Features
7. **Bank Integration** - Auto-sync with Plaid
8. **Smart Scheduling** - Recurring transactions
9. **Voice Commands** - Natural language processing
10. **Receipt OCR** - Scan receipts automatically
11. **AI Analysis** - Pattern detection, predictions
12. **Gamification** - Points, achievements, leaderboards
13. **Social** - Friends, challenges, sharing

---

## 🔑 Default Credentials

### Test User
```
Email: test@example.com
Password: Test123456!
```

### Database
```
Server: localhost
Port: 1433
Username: sa
Password: YourPassword
Database: ExpenseTrackerDB
```

---

## 📖 API Endpoints

### Authentication
```
POST   /auth/register          - Register new user
POST   /auth/login             - Login
GET    /auth/profile           - Get profile
```

### Transactions
```
POST   /transactions           - Create transaction
GET    /transactions           - Get all transactions
GET    /transactions/:id       - Get by ID
PUT    /transactions/:id       - Update
DELETE /transactions/:id       - Delete
```

### Budgets
```
POST   /budgets                - Create budget
GET    /budgets                - Get all budgets
GET    /budgets/stats          - Get statistics
```

### Bank Integration
```
POST   /bank-integration/plaid/link-token        - Create link token
GET    /bank-integration/accounts                - Get accounts
POST   /bank-integration/plaid/sync/:accountId   - Sync transactions
```

### Voice Commands
```
POST   /voice-commands/process                   - Process command
GET    /voice-commands/history                   - Get history
```

### AI Analysis
```
POST   /ai-analysis/patterns/analyze             - Analyze patterns
GET    /ai-analysis/insights                     - Get insights
```

**Full API Documentation:** http://localhost:3000/api

---

## 🧪 Testing

### Test All Features

**Windows:**
```powershell
cd app
.\test-features.ps1
```

**Linux/Mac:**
```bash
cd app
chmod +x test-advanced-features.sh
./test-advanced-features.sh
```

### Test Individual Endpoints

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!"}'

# Get Transactions (replace TOKEN)
curl -X GET http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Troubleshooting

### Backend won't start

```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check logs
cd app/backend
npm run start:dev
```

### Database connection error

```bash
# Test database connection
sqlcmd -S localhost -U sa -P YourPassword -Q "SELECT 1"

# Check SQL Server status
# Windows: Services -> SQL Server
# Linux: sudo systemctl status mssql-server
```

### Frontend won't start

```bash
# Clear cache and reinstall
cd app/frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port already in use

```bash
# Backend (port 3000)
# Windows: netstat -ano | findstr :3000
# Linux: lsof -i :3000

# Frontend (port 5173)
# Windows: netstat -ano | findstr :5173
# Linux: lsof -i :5173

# Kill process
# Windows: taskkill /PID <PID> /F
# Linux: kill -9 <PID>
```

---

## 📁 Project Structure

```
app/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── entities/          # Database entities
│   │   ├── modules/           # Feature modules
│   │   ├── app.module.ts      # Main module
│   │   └── main.ts            # Entry point
│   ├── dist/                  # Build output
│   └── package.json
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page components
│   │   ├── stores/            # State management
│   │   └── App.tsx            # Root component
│   ├── dist/                  # Build output
│   └── package.json
│
├── mobile/                     # Flutter Mobile
│   ├── lib/
│   └── pubspec.yaml
│
├── migration_advanced_features.sql    # Database migration
├── test-features.ps1                  # Test script (Windows)
├── test-advanced-features.sh          # Test script (Linux/Mac)
├── README.md                          # Main documentation
├── QUICK_START.md                     # This file
└── DEPLOYMENT_GUIDE_COMPLETE.md       # Deployment guide
```

---

## 🎓 Next Steps

### Learn More
1. Read [README.md](./README.md) for complete documentation
2. Check [API Documentation](http://localhost:3000/api) for all endpoints
3. Review [DEPLOYMENT_GUIDE_COMPLETE.md](./DEPLOYMENT_GUIDE_COMPLETE.md) for production deployment

### Customize
1. Update branding and colors
2. Configure email settings
3. Setup Plaid for bank integration
4. Add custom categories
5. Configure notifications

### Deploy
1. Setup production database
2. Configure production server
3. Deploy backend
4. Deploy frontend
5. Build mobile apps

---

## 📞 Support

### Documentation
- **Main README:** [README.md](./README.md)
- **API Docs:** http://localhost:3000/api
- **Deployment Guide:** [DEPLOYMENT_GUIDE_COMPLETE.md](./DEPLOYMENT_GUIDE_COMPLETE.md)

### Common Issues
- Check logs: `npm run start:dev`
- Verify database connection
- Check environment variables
- Ensure ports are available

---

## ✅ Checklist

- [ ] Database created and migrated
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can register new user
- [ ] Can login
- [ ] Can create transaction
- [ ] Can view dashboard
- [ ] API documentation accessible

---

## 🎉 Success!

If you can access:
- ✅ Frontend: http://localhost:5173
- ✅ Backend API: http://localhost:3000
- ✅ API Docs: http://localhost:3000/api

**Congratulations! Your Expense Tracker is running! 🚀**

---

**Quick Start Guide Version:** 2.0.0  
**Last Updated:** April 29, 2026  
**Status:** ✅ Complete

**Happy Tracking! 💰**
