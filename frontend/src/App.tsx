import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from './stores/authStore'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import SocialCallback from './pages/auth/SocialCallback'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import SavingsGoals from './pages/SavingsGoals'
import Analytics from './pages/Analytics'
import Subscriptions from './pages/Subscriptions'
import AIInsights from './pages/AIInsights'
import Social from './pages/Social'
import Gamification from './pages/Gamification'
import Settings from './pages/Settings'
import CashFlow from './pages/CashFlow'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/social/callback" element={<SocialCallback />} />
          </Route>

          {/* Main Routes */}
          <Route
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/savings-goals" element={<SavingsGoals />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/cash-flow" element={<CashFlow />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/social" element={<Social />} />
            <Route path="/gamification" element={<Gamification />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
