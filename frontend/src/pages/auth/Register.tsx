import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import api from '../../lib/api'
import SocialLoginButtons from '../../components/auth/SocialLoginButtons'

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  fullName?: string
}

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>()

  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      })

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Đăng ký</h2>
        <p className="text-gray-600 mt-2">Tạo tài khoản mới</p>
      </div>

      <div className="mb-6">
        <SocialLoginButtons mode="register" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Tên đăng nhập</label>
          <input
            {...register('username', {
              required: 'Vui lòng nhập tên đăng nhập',
              minLength: { value: 3, message: 'Tối thiểu 3 ký tự' },
            })}
            type="text"
            className="input"
            placeholder="username"
          />
          {errors.username && (
            <p className="text-sm text-danger-600 mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="label">Email</label>
          <input
            {...register('email', {
              required: 'Vui lòng nhập email',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email không hợp lệ',
              },
            })}
            type="email"
            className="input"
            placeholder="email@example.com"
          />
          {errors.email && (
            <p className="text-sm text-danger-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label">Họ tên (tùy chọn)</label>
          <input
            {...register('fullName')}
            type="text"
            className="input"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label className="label">Mật khẩu</label>
          <input
            {...register('password', {
              required: 'Vui lòng nhập mật khẩu',
              minLength: { value: 6, message: 'Tối thiểu 6 ký tự' },
            })}
            type="password"
            className="input"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-sm text-danger-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="label">Xác nhận mật khẩu</label>
          <input
            {...register('confirmPassword', {
              required: 'Vui lòng xác nhận mật khẩu',
              validate: (value) => value === password || 'Mật khẩu không khớp',
            })}
            type="password"
            className="input"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-danger-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  )
}
