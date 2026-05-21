import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Wallet, Target,
  BarChart3, CreditCard, Brain, Users, Trophy, Settings,
  TrendingUp, WalletCards,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard',   href: '/',              icon: LayoutDashboard },
  { name: 'Giao dịch',   href: '/transactions',  icon: ArrowLeftRight  },
  { name: 'Ngân sách',   href: '/budgets',       icon: Wallet          },
  { name: 'Mục tiêu',    href: '/savings-goals', icon: Target          },
  { name: 'Phân tích',   href: '/analytics',     icon: BarChart3       },
  { name: 'Cash Flow',   href: '/cash-flow',     icon: WalletCards     },
  { name: 'Đăng ký',     href: '/subscriptions', icon: CreditCard      },
  { name: 'AI Insights', href: '/ai-insights',   icon: Brain           },
  { name: 'Xã hội',      href: '/social',        icon: Users           },
  { name: 'Thành tích',  href: '/gamification',  icon: Trophy          },
  { name: 'Cài đặt',     href: '/settings',      icon: Settings        },
]

export default function Sidebar() {
  return (
    <div
      className="w-64 flex flex-col flex-shrink-0"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Expense</h1>
            <p className="text-xs font-semibold" style={{ color: '#818cf8' }}>Tracker Pro</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs text-center" style={{ color: 'rgba(240,240,255,0.3)' }}>
          v2.0.0 — Expense Tracker Pro
        </p>
      </div>
    </div>
  )
}
