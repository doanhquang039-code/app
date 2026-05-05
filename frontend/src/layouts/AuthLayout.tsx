import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'

const features = [
  { icon: <BarChart3 className="w-5 h-5" />, title: 'Phân tích thông minh', desc: 'Báo cáo chi tiêu trực quan, dễ hiểu' },
  { icon: <Zap className="w-5 h-5" />,       title: 'AI Insights',           desc: 'Gợi ý tiết kiệm cá nhân hóa bằng AI' },
  { icon: <Shield className="w-5 h-5" />,    title: 'Bảo mật cao',           desc: 'Dữ liệu mã hóa, xác thực đa tầng' },
]

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) return <Navigate to="/" />

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: 'var(--color-bg)',
        backgroundImage:
          'radial-gradient(ellipse at 15% 50%, rgba(99,102,241,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(139,92,246,0.12) 0%, transparent 55%)',
      }}
    >
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
           style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold">Expense Tracker</p>
            <p className="text-xs" style={{ color: '#818cf8' }}>Pro Edition</p>
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Quản lý tài chính<br />
            <span className="text-gradient">thông minh hơn.</span>
          </h1>
          <p className="text-lg mb-10" style={{ color: 'rgba(240,240,255,0.55)' }}>
            Theo dõi chi tiêu, lập ngân sách và đạt mục tiêu tài chính với sự trợ giúp của AI.
          </p>

          <div className="space-y-5">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="icon-bubble icon-bubble-primary flex-shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <p className="font-semibold text-white text-sm">{f.title}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(240,240,255,0.5)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'rgba(240,240,255,0.3)' }}>
          © 2026 Expense Tracker Pro. All rights reserved.
        </p>
      </div>

      {/* Right panel - auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold text-white">Expense Tracker</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
