import { X } from 'lucide-react'
import { CategoryModel, TransactionModel } from '../../models/transaction'
import { useTransactionModalViewModel } from '../../viewmodels/useTransactionModalViewModel'

interface TransactionModalProps {
  transaction?: TransactionModel | null
  categories: CategoryModel[]
  onClose: () => void
  onSuccess: () => void
}


export default function TransactionModal({
  transaction,
  categories,
  onClose,
  onSuccess,
}: TransactionModalProps) {
  const viewModel = useTransactionModalViewModel({ transaction, onSuccess })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {transaction ? 'Sửa giao dịch' : 'Thêm giao dịch'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={viewModel.handleSubmit} className="p-6 space-y-4">
          {/* Type */}
          <div>
            <label className="label">Loại giao dịch</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative">
                <input
                  {...viewModel.register('type')}
                  type="radio"
                  value="INCOME"
                  className="peer sr-only"
                />
                <div className="cursor-pointer border-2 border-gray-200 rounded-lg p-4 text-center transition-all peer-checked:border-success-600 peer-checked:bg-success-50">
                  <p className="font-medium text-gray-900">Thu nhập</p>
                </div>
              </label>
              <label className="relative">
                <input
                  {...viewModel.register('type')}
                  type="radio"
                  value="EXPENSE"
                  className="peer sr-only"
                />
                <div className="cursor-pointer border-2 border-gray-200 rounded-lg p-4 text-center transition-all peer-checked:border-danger-600 peer-checked:bg-danger-50">
                  <p className="font-medium text-gray-900">Chi tiêu</p>
                </div>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="label">Số tiền</label>
            <input
              {...viewModel.register('amount', {
                required: 'Vui lòng nhập số tiền',
                min: { value: 0, message: 'Số tiền phải lớn hơn 0' },
              })}
              type="number"
              step="1000"
              className="input"
              placeholder="0"
            />
            {viewModel.errors.amount && (
              <p className="text-sm text-danger-600 mt-1">{viewModel.errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label">Mô tả</label>
            <input
              {...viewModel.register('description', { required: 'Vui lòng nhập mô tả' })}
              type="text"
              className="input"
              placeholder="Ví dụ: Mua sắm, Lương tháng 4..."
            />
            {viewModel.errors.description && (
              <p className="text-sm text-danger-600 mt-1">{viewModel.errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="label">Danh mục</label>
            <select
              {...viewModel.register('categoryId', { required: 'Vui lòng chọn danh mục' })}
              className="input"
            >
              <option value="">Chọn danh mục</option>
              {categories
                ?.filter((category) => category.type === viewModel.transactionType)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            {viewModel.errors.categoryId && (
              <p className="text-sm text-danger-600 mt-1">{viewModel.errors.categoryId.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="label">Ngày</label>
            <input
              {...viewModel.register('date', { required: 'Vui lòng chọn ngày' })}
              type="date"
              className="input"
            />
            {viewModel.errors.date && (
              <p className="text-sm text-danger-600 mt-1">{viewModel.errors.date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Ghi chú (tùy chọn)</label>
            <textarea
              {...viewModel.register('notes')}
              className="input"
              rows={3}
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
              disabled={viewModel.isSaving}
              className="btn btn-primary flex-1"
            >
              {viewModel.isSaving ? 'Đang lưu...' : transaction ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
