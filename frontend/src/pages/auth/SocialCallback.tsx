import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export default function SocialCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { login } = useAuthStore()

  useEffect(() => {
    const payload = params.get('payload')
    if (!payload) {
      toast.error('Không nhận được dữ liệu đăng nhập')
      navigate('/login', { replace: true })
      return
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '=',
      )
      const decoded = JSON.parse(atob(paddedPayload))
      login(decoded.user, decoded.access_token)
      toast.success('Đăng nhập thành công!')
      navigate('/', { replace: true })
    } catch {
      toast.error('Dữ liệu đăng nhập không hợp lệ')
      navigate('/login', { replace: true })
    }
  }, [login, navigate, params])

  return (
    <div className="card text-center">
      <div className="flex justify-center mb-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Đang hoàn tất đăng nhập</h2>
      <p className="text-gray-600 mt-2">Vui lòng chờ trong giây lát...</p>
    </div>
  )
}
