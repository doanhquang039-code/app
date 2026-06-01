import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Wallet, Target,
  BarChart3, CreditCard, Brain, Users, Trophy, Settings,
  TrendingUp, WalletCards, Landmark, ScanLine, Leaf,
  ChevronRight, Shield,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const navigation = [
  {
    group: 'Tổng quan',
    items: [
      { name: 'Dashboard',     href: '/',               icon: LayoutDashboard, badge: null },
      { name: 'Giao dịch',     href: '/transactions',   icon: ArrowLeftRight,  badge: null },
    ],
  },
  {
    group: 'Tài chính',
    items: [
      { name: 'Ngân sách',     href: '/budgets',          icon: Wallet,        badge: null },
      { name: 'Mục tiêu',      href: '/savings-goals',    icon: Target,        badge: null },
      { name: 'Cash Flow',     href: '/cash-flow',        icon: WalletCards,   badge: null },
      { name: 'Đăng ký',       href: '/subscriptions',    icon: CreditCard,    badge: 'NEW' },
      { name: 'Quét hóa đơn',  href: '/receipt-scanner',  icon: ScanLine,      badge: null },
    ],
  },
  {
    group: '🌿 Đầu tư & Tài sản',
    items: [
      { name: 'Danh mục ĐT',   href: '/investments',    icon: TrendingUp,      badge: null },
      { name: 'Tài sản ròng',  href: '/net-worth',      icon: Landmark,        badge: null },
    ],
  },
  {
    group: '🌿 Dịch vụ Xanh',
    items: [
      { name: 'Ngân hàng Xanh', href: '/green-banking',  icon: Landmark,       badge: 'HOT' },
      { name: 'Di chuyển Xanh', href: '/xanh-sm',        icon: Leaf,           badge: 'ECO' },
    ],
  },
  {
    group: 'Phân tích',
    items: [
      { name: 'Analytics',     href: '/analytics',      icon: BarChart3,       badge: null },
      { name: 'AI Insights',   href: '/ai-insights',    icon: Brain,           badge: 'AI' },
    ],
  },
  {
    group: 'Cộng đồng',
    items: [
      { name: 'Xã hội',        href: '/social',         icon: Users,           badge: null },
      { name: 'Thành tích',    href: '/gamification',   icon: Trophy,          badge: null },
    ],
  },
]

const GREEN_SCORE = 78

function GreenMiniBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${score}%`, background: 'linear-gradient(90deg, #059669, #34d399)' }}
        />
      </div>
      <span className="text-xs font-bold text-emerald-400">{score}</span>
    </div>
  )
}

export default function Sidebar() {
  const { user } = useAuthStore()
  const location = useLocation()

  const initials = (user?.fullName || user?.username || 'U')
    .split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div
      className="w-64 flex flex-col flex-shrink-0"
      style={{
        background: 'rgba(8,14,26,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ===== Logo ===== */}
      <div className="p-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white leading-tight">FinGreen</h1>
            <p className="text-xs font-semibold" style={{ color: '#34d399' }}>Smart Banking</p>
          </div>
        </div>

        {/* Green Score mini */}
        <div className="mt-3 p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
              <Leaf className="w-3 h-3" />Green Score
            </span>
            <span className="text-xs text-muted">Tháng này</span>
          </div>
          <GreenMiniBar score={GREEN_SCORE} />
        </div>
      </div>

      {/* ===== Navigation ===== */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {navigation.map((group) => (
          <div key={group.group}>
            <p
              className="px-2 mb-1.5 text-xs font-bold uppercase tracking-widest flex items-center gap-1"
              style={{ color: 'rgba(232,240,254,0.22)' }}
            >
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.href)
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === '/'}
                    className={`nav-item group ${isActive ? 'active' : ''}`}
                  >
                    <item.icon
                      style={{ width: '16px', height: '16px' }}
                      className="flex-shrink-0"
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.badge && (
                      <span
                        className="text-xs font-black px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{
                          background: item.badge === 'AI' ? 'rgba(139,92,246,0.25)' : 'rgba(16,185,129,0.2)',
                          color: item.badge === 'AI' ? '#c4b5fd' : '#34d399',
                          fontSize: '9px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-60" />}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ===== Security Notice ===== */}
      <div className="px-3 pb-2">
        <div
          className="p-2.5 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}
        >
          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-blue-300">Bảo mật 2FA</p>
            <p className="text-xs text-muted truncate">Phiên làm việc an toàn</p>
          </div>
        </div>
      </div>

      {/* ===== Settings Link ===== */}
      <div className="px-3 pb-2">
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings style={{ width: '16px', height: '16px' }} className="flex-shrink-0" />
          <span className="flex-1">Cài đặt</span>
        </NavLink>
      </div>

      {/* ===== User Footer ===== */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all hover:bg-white/5"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.fullName || user?.username || 'User'}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(232,240,254,0.35)' }}>
              {user?.email || 'Premium Account'}
            </p>
          </div>
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }}
          />
        </div>
      </div>
    </div>
  )
}
