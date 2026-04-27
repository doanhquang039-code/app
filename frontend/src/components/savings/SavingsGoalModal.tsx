import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api'

interface SavingsGoalModalProps {
  goal?: any
  onClose: () => void
  onSuccess: () => void
}

interface GoalForm {
  name: string
  description?: string
  targetAmount: number
  currentAmount?: number
  deadline: string
  icon?: string
}

const ICON_OPTIONS = ['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💰', '🏖️', '📱', '💻']

export default function SavingsGoalModal({ goal, onClose, onSuccess }: SavingsGoalModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoalForm>({
    defaultValues: goal
      ? {
          name: goal.name,
          description: goal.description,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: new Date(goal.deadline).toISOString().split('T')[0],
          icon: goal.icon,
        }
      : {
          currentAmount: 0,
          icon: '🎯',
          deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
  })

  const selectedIcon = watch('icon')

  const mutation = useMutation(
    (data: GoalForm) => {
      if (goal) {
        return api.put(`/savings-goals/${goal.id}`, data)
      }
      return api.post('/savings-goals', data)
    },
    {
      onSuccess: () => {
        toast.success(goal ? 'Đã cập nhật mục tiêu' : 'Đã tạo mục tiêu')
        onSuccess()
      },
      onError: () => {
        toast.error('Có lỗi xảy ra')
      },
    }
  )

  const onSubmit = (data: GoalForm) => {
    mutation.mutate(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {goal ? 'Sửa mục tiêu' : 'Tạo mục tiêu'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Icon Selection */}
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
            <label className="label">Tên mục tiêu</label>
            <input
              {...register('name', { required: 'Vui lòng nhập tên' })}
              type="text"
              className="input"
              placeholder="Ví dụ: Mua nhà, Du lịch Nhật Bản..."
            />
            {errors.name && <p className="text-sm text-danger-600 mt-1">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">Mô tả (tùy chọn)</label>
            <textarea
              {...register('description')}
              className="input"
              rows={2}
              placeholder="Thêm mô tả..."
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="label">Số tiền mục tiêu</label>
            <input
              {...register('targetAmount', {
                required: 'Vui lòng nhập số tiền',
                min: { value: 0, message: 'Số tiền phải lớn hơn 0' },
              })}
              type="number"
              step="1000"
              className="input"
              placeholder="0"
            />
            {errors.targetAmount && (
              <p className="text-sm text-danger-600 mt-1">{errors.targetAmount.message}</p>
            )}
          </div>

          {/* Current Amount */}
          <div>
            <label className="label">Số tiền hiện tại</label>
            <input
              {...register('currentAmount', {
                min: { value: 0, message: 'Số tiền phải lớn hơn 0' },
              })}
              type="number"
              step="1000"
              className="input"
              placeholder="0"
            />
            {errors.currentAmount && (
              <p className="text-sm text-danger-600 mt-1">{errors.currentAmount.message}</p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="label">Hạn hoàn thành</label>
            <input
              {...register('deadline', { required: 'Vui lòng chọn ngày' })}
              type="date"
              className="input"
            />
            {errors.deadline && (
              <p className="text-sm text-danger-600 mt-1">{errors.deadline.message}</p>
            )}
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
              {mutation.isLoading ? 'Đang lưu...' : goal ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
