import { Bell, User, LogOut, Search } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const initials = (user?.fullName || user?.username || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <header
      className="px-6 py-3.5 flex items-center justify-between gap-4 flex-shrink-0"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: greeting */}
      <div>
        <h2 className="text-base font-semibold text-white leading-tight">
          {greeting}, {user?.fullName?.split(' ').slice(-1)[0] || user?.username}! 👋
        </h2>
        <p className="text-xs" style={{ color: 'rgba(240,240,255,0.45)' }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Right: Search + Notifications + User */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'rgba(240,240,255,0.35)' }} />
          <input
            id="header-search"
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl outline-none w-52 transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f0ff',
            }}
            onFocus={e => {
              e.currentTarget.style.width = '220px'
              e.currentTarget.style.borderColor = '#6366f1'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="header-notifications"
            onClick={() => { setShowNotifications(p => !p); setShowUserMenu(false) }}
            className="btn btn-ghost relative w-10 h-10 rounded-xl"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: '#f43f5e' }}
            />
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl z-50 overflow-hidden animate-fade-in-up"
              style={{
                background: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
              }}
            >
              <div className="p-4 flex items-center justify-between"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="font-semibold text-white text-sm">Thông báo</p>
                <span className="badge badge-primary">3 mới</span>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { icon: '⚠️', text: 'Ngân sách "Ăn uống" đã dùng 85%', time: '5 phút trước' },
                  { icon: '💰', text: 'Thu nhập tháng 5 đã được ghi nhận', time: '1 giờ trước' },
                  { icon: '🎯', text: 'Mục tiêu "Mua laptop" đạt 100%!', time: '2 giờ trước' },
                ].map((n, i) => (
                  <div key={i} className="px-4 py-3 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer">
                    <span className="text-lg flex-shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white leading-snug">{n.text}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,255,0.4)' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center">
                <button className="text-xs font-semibold" style={{ color: '#818cf8' }}>
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            id="header-user-menu"
            onClick={() => { setShowUserMenu(p => !p); setShowNotifications(false) }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {initials}
            </div>
            <span className="text-sm font-medium text-white hidden md:block">
              {user?.username}
            </span>
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-2xl z-50 overflow-hidden animate-fade-in-up"
              style={{
                background: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
              }}
            >
              <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-sm font-semibold text-white">{user?.fullName || user?.username}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,255,0.45)' }}>{user?.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/7"
                        style={{ color: 'rgba(240,240,255,0.75)' }}>
                  <User className="w-4 h-4" />
                  Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => { logout(); window.location.href = '/login' }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-rose-500/10"
                  style={{ color: '#fb7185' }}
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
