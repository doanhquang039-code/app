import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import api from '../lib/api'
import { toast } from 'sonner'
import {
  User,
  Lock,
  Bell,
  Palette,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile')

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
  })

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    savingsGoalReminders: true,
    billReminders: true,
    anomalyAlerts: true,
    weeklyReports: true,
  })

  // Preferences
  const [preferences, setPreferences] = useState({
    currency: 'VND',
    language: 'vi',
    theme: 'light',
    dateFormat: 'DD/MM/YYYY',
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/users/profile', data)
      return response.data
    },
    onSuccess: (data: any) => {
      toast.success('Đã cập nhật thông tin cá nhân')
      updateUser(data)
    },
    onError: () => {
      toast.error('Không thể cập nhật thông tin')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/users/change-password', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Đã thay đổi mật khẩu')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể thay đổi mật khẩu')
    },
  })

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/users/notification-settings', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Đã cập nhật cài đặt thông báo')
    },
    onError: () => {
      toast.error('Không thể cập nhật cài đặt')
    },
  })

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/users/preferences', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Đã cập nhật tùy chọn')
    },
    onError: () => {
      toast.error('Không thể cập nhật tùy chọn')
    },
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(profileForm)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
  }

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateNotificationsMutation.mutate(notificationSettings)
  }

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePreferencesMutation.mutate(preferences)
  }

  const handleExportData = async () => {
    try {
      const response = await api.get('/users/export-data', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `expense-tracker-data-${new Date().toISOString()}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Đã xuất dữ liệu thành công')
    } catch (error) {
      toast.error('Không thể xuất dữ liệu')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      return
    }
    try {
      await api.delete('/users/account')
      toast.success('Đã xóa tài khoản')
      // Logout and redirect
      window.location.href = '/login'
    } catch (error) {
      toast.error('Không thể xóa tài khoản')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-1">Quản lý tài khoản và tùy chỉnh ứng dụng</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Bảo mật
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Thông báo
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Tùy chọn
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đầy đủ
              </label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="input"
                placeholder="Nhập tên đầy đủ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                className="input"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="input"
                placeholder="Nhập email"
              />
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="btn-primary w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-2xl">
          {/* Change Password */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thay đổi mật khẩu</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input pr-10"
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input pr-10"
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input pr-10"
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="btn-primary w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </button>
            </form>
          </div>

          {/* Data Management */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý dữ liệu</h3>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="btn-secondary w-full justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất dữ liệu
              </button>

              <button
                onClick={handleDeleteAccount}
                className="btn-secondary w-full justify-center bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt thông báo</h3>
          <form onSubmit={handleNotificationsSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Thông báo qua email</p>
                  <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Cảnh báo ngân sách</p>
                  <p className="text-sm text-gray-600">Thông báo khi vượt ngân sách</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.budgetAlerts}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, budgetAlerts: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Nhắc nhở mục tiêu tiết kiệm</p>
                  <p className="text-sm text-gray-600">Nhắc nhở về tiến độ tiết kiệm</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.savingsGoalReminders}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, savingsGoalReminders: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Nhắc nhở hóa đơn</p>
                  <p className="text-sm text-gray-600">Nhắc nhở thanh toán hóa đơn</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.billReminders}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, billReminders: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Cảnh báo chi tiêu bất thường</p>
                  <p className="text-sm text-gray-600">Thông báo khi phát hiện chi tiêu bất thường</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.anomalyAlerts}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, anomalyAlerts: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Báo cáo hàng tuần</p>
                  <p className="text-sm text-gray-600">Nhận báo cáo tổng hợp hàng tuần</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyReports}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, weeklyReports: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={updateNotificationsMutation.isPending}
              className="btn-primary w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu cài đặt
            </button>
          </form>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="card max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tùy chọn hiển thị</h3>
          <form onSubmit={handlePreferencesSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị tiền tệ
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                className="input"
              >
                <option value="VND">VND (₫)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngôn ngữ
              </label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="input"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giao diện
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                className="input"
              >
                <option value="light">Sáng</option>
                <option value="dark">Tối</option>
                <option value="auto">Tự động</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Định dạng ngày
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                className="input"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={updatePreferencesMutation.isPending}
              className="btn-primary w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu tùy chọn
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
