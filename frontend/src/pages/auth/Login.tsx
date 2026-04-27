import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { LogIn } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

interface LoginForm {
  username: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/login', data)
      const { user, access_token } = response.data

      login(user, access_token)
      toast.success('Đăng nhập thành công!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
        <p className="text-gray-600 mt-2">Chào mừng bạn quay trở lại!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Tên đăng nhập</label>
          <input
            {...register('username', { required: 'Vui lòng nhập tên đăng nhập' })}
            type="text"
            className="input"
            placeholder="username"
          />
          {errors.username && (
            <p className="text-sm text-danger-600 mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="label">Mật khẩu</label>
          <input
            {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
            type="password"
            className="input"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-sm text-danger-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  )
}
