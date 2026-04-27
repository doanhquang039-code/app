import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💰 Expense Tracker</h1>
          <p className="text-primary-100">Quản lý chi tiêu thông minh</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
