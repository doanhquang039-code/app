import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api'

interface BudgetModalProps {
  budget?: any
  categories: any[]
  onClose: () => void
  onSuccess: () => void
}

interface BudgetForm {
  name: string
  amount: number
  categoryId: number
  startDate: string
  endDate: string
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
}

export default function BudgetModal({ budget, categories, onClose, onSuccess }: BudgetModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetForm>({
    defaultValues: budget
      ? {
          name: budget.name,
          amount: budget.amount,
          categoryId: budget.categoryId,
          startDate: new Date(budget.startDate).toISOString().split('T')[0],
          endDate: new Date(budget.endDate).toISOString().split('T')[0],
          period: budget.period,
        }
      : {
          period: 'MONTHLY',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split('T')[0],
        },
  })

  const mutation = useMutation(
    (data: BudgetForm) => {
      if (budget) {
        return api.put(`/budgets/${budget.id}`, data)
      }
      return api.post('/budgets', data)
    },
    {
      onSuccess: () => {
        toast.success(budget ? 'Đã cập nhật ngân sách' : 'Đã tạo ngân sách')
        onSuccess()
      },
      onError: () => {
        toast.error('Có lỗi xảy ra')
      },
    }
  )

  const onSubmit = (data: BudgetForm) => {
    mutation.mutate(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {budget ? 'Sửa ngân sách' : 'Tạo ngân sách'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Tên ngân sách</label>
            <input
              {...register('name', { required: 'Vui lòng nhập tên' })}
              type="text"
              className="input"
              placeholder="Ví dụ: Ngân sách ăn uống tháng 4"
            />
            {errors.name && <p className="text-sm text-danger-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Số tiền</label>
            <input
              {...register('amount', {
                required: 'Vui lòng nhập số tiền',
                min: { value: 0, message: 'Số tiền phải lớn hơn 0' },
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

          <div>
            <label className="label">Danh mục</label>
            <select
              {...register('categoryId', { required: 'Vui lòng chọn danh mục' })}
              className="input"
            >
              <option value="">Chọn danh mục</option>
              {categories
                ?.filter((c: any) => c.type === 'EXPENSE')
                .map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-danger-600 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Từ ngày</label>
              <input
                {...register('startDate', { required: 'Vui lòng chọn ngày' })}
                type="date"
                className="input"
              />
              {errors.startDate && (
                <p className="text-sm text-danger-600 mt-1">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="label">Đến ngày</label>
              <input
                {...register('endDate', { required: 'Vui lòng chọn ngày' })}
                type="date"
                className="input"
              />
              {errors.endDate && (
                <p className="text-sm text-danger-600 mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Hủy
            </button>
            <button type="submit" disabled={mutation.isLoading} className="btn btn-primary flex-1">
              {mutation.isLoading ? 'Đang lưu...' : budget ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
