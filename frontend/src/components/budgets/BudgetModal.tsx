import { X } from 'lucide-react'
import { BudgetModel } from '../../models/budget'
import { CategoryModel } from '../../models/transaction'
import { useBudgetModalViewModel } from '../../viewmodels/useBudgetModalViewModel'

interface BudgetModalProps {
  budget?: BudgetModel | null
  categories: CategoryModel[]
  onClose: () => void
  onSuccess: () => void
}

export default function BudgetModal({ budget, categories, onClose, onSuccess }: BudgetModalProps) {
  const viewModel = useBudgetModalViewModel({ budget, onSuccess })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {budget ? 'Sá»­a ngÃ¢n sÃ¡ch' : 'Táº¡o ngÃ¢n sÃ¡ch'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={viewModel.handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">TÃªn ngÃ¢n sÃ¡ch</label>
            <input
              {...viewModel.register('name', { required: 'Vui lÃ²ng nháº­p tÃªn' })}
              type="text"
              className="input"
              placeholder="VÃ­ dá»¥: NgÃ¢n sÃ¡ch Äƒn uá»‘ng thÃ¡ng 4"
            />
            {viewModel.errors.name && (
              <p className="text-sm text-danger-600 mt-1">{viewModel.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">Sá»‘ tiá»n</label>
            <input
              {...viewModel.register('amount', {
                required: 'Vui lÃ²ng nháº­p sá»‘ tiá»n',
                min: { value: 0, message: 'Sá»‘ tiá»n pháº£i lá»›n hÆ¡n 0' },
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

          <div>
            <label className="label">Danh má»¥c</label>
            <select
              {...viewModel.register('categoryId', { required: 'Vui lÃ²ng chá»n danh má»¥c' })}
              className="input"
            >
              <option value="">Chá»n danh má»¥c</option>
              {categories
                ?.filter((category) => category.type === 'EXPENSE')
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tá»« ngÃ y</label>
              <input
                {...viewModel.register('startDate', { required: 'Vui lÃ²ng chá»n ngÃ y' })}
                type="date"
                className="input"
              />
              {viewModel.errors.startDate && (
                <p className="text-sm text-danger-600 mt-1">
                  {viewModel.errors.startDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="label">Äáº¿n ngÃ y</label>
              <input
                {...viewModel.register('endDate', { required: 'Vui lÃ²ng chá»n ngÃ y' })}
                type="date"
                className="input"
              />
              {viewModel.errors.endDate && (
                <p className="text-sm text-danger-600 mt-1">
                  {viewModel.errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Há»§y
            </button>
            <button type="submit" disabled={viewModel.isSaving} className="btn btn-primary flex-1">
              {viewModel.isSaving ? 'Äang lÆ°u...' : budget ? 'Cáº­p nháº­t' : 'Táº¡o'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
