import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api'

interface SubscriptionModalProps {
  subscription?: any
  onClose: () => void
  onSuccess: () => void
}

interface SubscriptionForm {
  name: string
  description?: string
  amount: number
  billingCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  provider?: string
  website?: string
  icon?: string
  startDate: string
  reminderDaysBefore: number
}

const ICON_OPTIONS = ['📱', '🎬', '🎵', '☁️', '🎮', '📺', '💪', '📚', '🍕', '🚗']

export default function SubscriptionModal({ subscription, onClose, onSuccess }: SubscriptionModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionForm>({
    defaultValues: subscription
      ? {
          name: subscription.name,
          description: subscription.description,
          amount: subscription.amount,
          billingCycle: subscription.billingCycle,
          provider: subscription.provider,
          website: subscription.website,
          icon: subscription.icon,
          startDate: new Date(subscription.startDate).toISOString().split('T')[0],
          reminderDaysBefore: subscription.reminderDaysBefore,
        }
      : {
          billingCycle: 'MONTHLY',
          icon: '📱',
          startDate: new Date().toISOString().split('T')[0],
          reminderDaysBefore: 3,
        },
  })

  const selectedIcon = watch('icon')

  const mutation = useMutation(
    (data: SubscriptionForm) => {
      if (subscription) {
        return api.put(`/subscriptions/${subscription.id}`, data)
      }
      return api.post('/subscriptions', data)
    },
    {
      onSuccess: () => {
        toast.success(subscription ? 'Đã cập nhật đăng ký' : 'Đã thêm đăng ký')
        onSuccess()
      },
      onError: () => {
        toast.error('Có lỗi xảy ra')
      },
    }
  )

  const onSubmit = (data: SubscriptionForm) => {
    mutation.mutate(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {subscription ? 'Sửa đăng ký' : 'Thêm đăng ký'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Icon */}
          <div>
            <label className="label">Biểu tượng</label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue('icon', icon)}
                  className={`text-3xl p-3 rounded-lg border-2 transition-all ${
                    selectedIcon === icon
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="label">Tên dịch vụ</label>
            <input
              {...register('name', { required: 'Vui lòng nhập tên' })}
              type="text"
              className="input"
              placeholder="Netflix, Spotify, Gym..."
            />
            {errors.name && <p className="text-sm text-danger-600 mt-1">{errors.name.message}</p>}
          </div>

          {/* Provider */}
          <div>
            <label className="label">Nhà cung cấp (tùy chọn)</label>
            <input
              {...register('provider')}
              type="text"
              className="input"
              placeholder="Netflix Inc."
            />
          </div>

          {/* Amount */}
          <div>
            <label className="label">Giá</label>
            <input
              {...register('amount', {
                required: 'Vui lòng nhập giá',
                min: { value: 0, message: 'Giá phải lớn hơn 0' },
              })}
              type="number"
              step="1000"
              className="input"
              placeholder="0"
            />
            {errors.amount && (
              <p className="text-sm text-danger-600 mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="label">Chu kỳ thanh toán</label>
            <select {...register('billingCycle')} className="input">
              <option value="DAILY">Hàng ngày</option>
              <option value="WEEKLY">Hàng tuần</option>
              <option value="MONTHLY">Hàng tháng</option>
              <option value="QUARTERLY">Hàng quý</option>
              <option value="YEARLY">Hàng năm</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="label">Ngày bắt đầu</label>
            <input
              {...register('startDate', { required: 'Vui lòng chọn ngày' })}
              type="date"
              className="input"
            />
            {errors.startDate && (
              <p className="text-sm text-danger-600 mt-1">{errors.startDate.message}</p>
            )}
          </div>

          {/* Reminder Days */}
          <div>
            <label className="label">Nhắc nhở trước (ngày)</label>
            <input
              {...register('reminderDaysBefore', {
                min: { value: 0, message: 'Phải lớn hơn 0' },
              })}
              type="number"
              className="input"
              placeholder="3"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Ghi chú (tùy chọn)</label>
            <textarea
              {...register('description')}
              className="input"
              rows={2}
              placeholder="Thêm ghi chú..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="btn btn-primary flex-1"
            >
              {mutation.isLoading ? 'Đang lưu...' : subscription ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
