import { Bell, User, LogOut, Search, Sun, Moon, Check, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useState, useEffect, useRef } from 'react'

interface Notification {
  id: number
  icon: string
  text: string
  time: string
  read: boolean
  type: 'warning' | 'info' | 'success'
}

const INITIAL_NOTIFS: Notification[] = [
  { id: 1, icon: '⚠️', text: 'Ngân sách "Ăn uống" đã dùng 85%', time: '5 phút trước', read: false, type: 'warning' },
  { id: 2, icon: '💰', text: 'Thu nhập tháng 6 đã được ghi nhận: 15,000,000đ', time: '1 giờ trước', read: false, type: 'success' },
  { id: 3, icon: '🎯', text: 'Mục tiêu "Mua laptop" đạt 100%! Chúc mừng!', time: '2 giờ trước', read: false, type: 'success' },
  { id: 4, icon: '🔔', text: 'Đăng ký Netflix Premium sẽ gia hạn sau 3 ngày', time: '5 giờ trước', read: true, type: 'info' },
  { id: 5, icon: '📊', text: 'Báo cáo tháng 5 đã sẵn sàng. Xem ngay!', time: 'Hôm qua', read: true, type: 'info' },
]

const TYPE_BORDER: Record<string, string> = {
  warning: 'rgba(245,158,11,0.4)',
  info:    'rgba(56,189,248,0.4)',
  success: 'rgba(16,185,129,0.4)',
}

export default function Header() {
  const { user, logout } = useAuthStore()
  const [showUserMenu,       setShowUserMenu]       = useState(false)
  const [showNotifications,  setShowNotifications]  = useState(false)
  const [darkMode,           setDarkMode]           = useState(true)
  const [notifications,      setNotifications]      = useState<Notification[]>(INITIAL_NOTIFS)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef  = useRef<HTMLDivElement>(null)

  const initials = (user?.fullName || user?.username || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead    = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const removeNotif = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id))

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
          {greeting}, <span className="text-gradient">{user?.fullName?.split(' ').slice(-1)[0] || user?.username}</span>! 👋
        </h2>
        <p className="text-xs" style={{ color: 'rgba(240,240,255,0.45)' }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Right: Search + Theme + Notifications + User */}
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
              e.currentTarget.style.borderColor = '#6366f1'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          id="header-theme-toggle"
          onClick={() => setDarkMode(d => !d)}
          className="btn btn-ghost w-10 h-10 rounded-xl"
          aria-label="Chuyển theme"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode
            ? <Sun className="w-4.5 h-4.5" style={{ width: '18px', height: '18px', color: '#fbbf24' }} />
            : <Moon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px', color: '#818cf8' }} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="header-notifications"
            onClick={() => { setShowNotifications(p => !p); setShowUserMenu(false) }}
            className="btn btn-ghost relative w-10 h-10 rounded-xl"
            aria-label="Thông báo"
          >
            <Bell style={{ width: '18px', height: '18px' }} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full text-xs font-bold text-white flex items-center justify-center px-0.5"
                style={{ background: '#f43f5e', fontSize: '9px' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-96 rounded-2xl z-50 overflow-hidden animate-fade-in-up"
              style={{
                background: '#13131f',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
              }}
            >
              {/* Notif Header */}
              <div className="px-5 py-4 flex items-center justify-between"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">Thông báo</p>
                  {unreadCount > 0 && (
                    <span className="badge badge-danger">{unreadCount} mới</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>

              {/* Notif List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="w-10 h-10 mx-auto mb-2" style={{ color: 'rgba(240,240,255,0.2)' }} />
                    <p className="text-sm text-muted">Không có thông báo nào</p>
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3.5 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer group ${!n.read ? '' : 'opacity-60'}`}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onClick={() => markRead(n.id)}
                  >
                    {/* Left indicator */}
                    {!n.read && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
                        style={{ background: TYPE_BORDER[n.type] }}
                      />
                    )}
                    <span className="text-xl flex-shrink-0 leading-none mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? 'text-white font-medium' : 'text-muted'}`}>
                        {n.text}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(240,240,255,0.35)' }}>{n.time}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeNotif(n.id) }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10 flex-shrink-0 self-start"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 flex items-center justify-between"
                   style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <button className="text-xs text-muted hover:text-white transition-colors">
                  Xóa tất cả
                </button>
                <a href="/settings" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Cài đặt thông báo →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
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
              className="absolute right-0 mt-2 w-56 rounded-2xl z-50 overflow-hidden animate-fade-in-up"
              style={{
                background: '#13131f',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
              }}
            >
              <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.fullName || user?.username}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(240,240,255,0.45)' }}>{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/7"
                        style={{ color: 'rgba(240,240,255,0.75)' }}>
                  <User className="w-4 h-4" />
                  Hồ sơ cá nhân
                </button>
                <a
                  href="/settings"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/7"
                  style={{ color: 'rgba(240,240,255,0.75)' }}
                >
                  <Bell className="w-4 h-4" />
                  Cài đặt
                </a>
                <button
                  onClick={() => { logout(); window.location.href = '/login' }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-rose-500/10 mt-1"
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
