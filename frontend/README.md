# Expense Tracker Frontend

Modern React + TypeScript frontend cho ứng dụng quản lý chi tiêu.

## 🚀 Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router** - Routing
- **Zustand** - State Management
- **React Query** - Data Fetching
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **Recharts** - Charts & Graphs
- **React Hook Form** - Form Management
- **Zod** - Validation
- **Lucide React** - Icons
- **Sonner** - Toast Notifications

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   └── layout/         # Layout components (Sidebar, Header)
├── layouts/            # Page layouts
│   ├── MainLayout.tsx  # Main app layout
│   └── AuthLayout.tsx  # Auth pages layout
├── pages/              # Page components
│   ├── auth/          # Login, Register
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Budgets.tsx
│   ├── SavingsGoals.tsx
│   ├── Analytics.tsx
│   ├── Subscriptions.tsx
│   ├── AIInsights.tsx
│   ├── Social.tsx
│   ├── Gamification.tsx
│   └── Settings.tsx
├── stores/             # Zustand stores
│   └── authStore.ts
├── lib/                # Utilities
│   └── api.ts         # Axios instance
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## 🎨 Features

### ✅ Đã hoàn thành:
- 🔐 Authentication (Login/Register)
- 📊 Dashboard với charts
- 🎨 Modern UI với Tailwind CSS
- 📱 Responsive design
- 🔄 State management với Zustand
- 🌐 API integration với Axios
- 🎯 Protected routes
- 🍞 Toast notifications

### 🚧 Đang phát triển:
- 💰 Transaction management
- 📈 Budget tracking
- 🎯 Savings goals
- 📊 Advanced analytics
- 💳 Subscription management
- 🤖 AI insights
- 👥 Social features
- 🏆 Gamification

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

### API Proxy

Vite proxy configuration in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

## 🎯 Usage

### Authentication

```typescript
import { useAuthStore } from './stores/authStore'

const { user, token, login, logout } = useAuthStore()

// Login
login(userData, accessToken)

// Logout
logout()
```

### API Calls

```typescript
import api from './lib/api'

// GET request
const response = await api.get('/transactions')

// POST request
const response = await api.post('/transactions', data)
```

### React Query

```typescript
import { useQuery } from 'react-query'

const { data, isLoading, error } = useQuery('key', async () => {
  const response = await api.get('/endpoint')
  return response.data
})
```

## 🎨 Styling

### Tailwind Classes

```tsx
// Button
<button className="btn btn-primary">Click me</button>

// Card
<div className="card">Content</div>

// Input
<input className="input" />
```

### Custom Colors

```javascript
primary: {
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
}
```

## 📱 Responsive Design

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Build

```bash
npm run build
```

Output: `dist/` folder

### Deploy to Vercel

```bash
vercel --prod
```

### Deploy to Netlify

```bash
netlify deploy --prod --dir=dist
```

## 🔗 Backend Integration

Backend API: `http://localhost:3000`

Endpoints:
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `GET /dashboard/stats` - Dashboard stats
- `GET /transactions` - Get transactions
- And more...

## 📚 Documentation

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

---

**Created:** April 27, 2026  
**Version:** 1.0.0
