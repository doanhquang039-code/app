import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  BarChart3,
  CreditCard,
  Brain,
  Users,
  Trophy,
  Settings,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Giao dịch', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Ngân sách', href: '/budgets', icon: Wallet },
  { name: 'Mục tiêu', href: '/savings-goals', icon: Target },
  { name: 'Phân tích', href: '/analytics', icon: BarChart3 },
  { name: 'Đăng ký', href: '/subscriptions', icon: CreditCard },
  { name: 'AI Insights', href: '/ai-insights', icon: Brain },
  { name: 'Xã hội', href: '/social', icon: Users },
  { name: 'Thành tích', href: '/gamification', icon: Trophy },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">💰 Expense Tracker</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Version 1.0.0
        </div>
      </div>
    </div>
  )
}
