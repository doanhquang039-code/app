import { X } from 'lucide-react'
import { SavingsGoalModel } from '../../models/savingsGoal'
import {
  SAVINGS_GOAL_ICON_OPTIONS,
  useSavingsGoalModalViewModel,
} from '../../viewmodels/useSavingsGoalModalViewModel'

interface SavingsGoalModalProps {
  goal?: SavingsGoalModel | null
  onClose: () => void
  onSuccess: () => void
}

export default function SavingsGoalModal({ goal, onClose, onSuccess }: SavingsGoalModalProps) {
  const viewModel = useSavingsGoalModalViewModel({ goal, onSuccess })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {goal ? 'Sá»­a má»¥c tiÃªu' : 'Táº¡o má»¥c tiÃªu'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={viewModel.handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Biá»ƒu tÆ°á»£ng</label>
            <div className="grid grid-cols-5 gap-2">
              {SAVINGS_GOAL_ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => viewModel.setValue('icon', icon)}
                  className={`text-3xl p-3 rounded-lg border-2 transition-all ${
                    viewModel.selectedIcon === icon
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">TÃªn má»¥c tiÃªu</label>
            <input
              {...viewModel.register('name', { required: 'Vui lÃ²ng nháº­p tÃªn' })}
              type="text"
              className="input"
              placeholder="VÃ­ dá»¥: Mua nhÃ , Du lá»‹ch Nháº­t Báº£n..."
            />
            {viewModel.errors.name && (
              <p className="text-sm text-danger-600 mt-1">{viewModel.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">MÃ´ táº£ (tÃ¹y chá»n)</label>
            <textarea
              {...viewModel.register('description')}
              className="input"
              rows={2}
              placeholder="ThÃªm mÃ´ táº£..."
            />
          </div>

          <div>
            <label className="label">Sá»‘ tiá»n má»¥c tiÃªu</label>
            <input
              {...viewModel.register('targetAmount', {
                required: 'Vui lÃ²ng nháº­p sá»‘ tiá»n',
                min: { value: 0, message: 'Sá»‘ tiá»n pháº£i lá»›n hÆ¡n 0' },
              })}
              type="number"
              step="1000"
              className="input"
              placeholder="0"
            />
            {viewModel.errors.targetAmount && (
              <p className="text-sm text-danger-600 mt-1">
                {viewModel.errors.targetAmount.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">Sá»‘ tiá»n hiá»‡n táº¡i</label>
            <input
              {...viewModel.register('currentAmount', {
                min: { value: 0, message: 'Sá»‘ tiá»n pháº£i lá»›n hÆ¡n 0' },
              })}
              type="number"
              step="1000"
              className="input"
              placeholder="0"
            />
            {viewModel.errors.currentAmount && (
              <p className="text-sm text-danger-600 mt-1">
                {viewModel.errors.currentAmount.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">Háº¡n hoÃ n thÃ nh</label>
            <input
              {...viewModel.register('deadline', { required: 'Vui lÃ²ng chá»n ngÃ y' })}
              type="date"
              className="input"
            />
            {viewModel.errors.deadline && (
              <p className="text-sm text-danger-600 mt-1">{viewModel.errors.deadline.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Há»§y
            </button>
            <button
              type="submit"
              disabled={viewModel.isSaving}
              className="btn btn-primary flex-1"
            >
              {viewModel.isSaving ? 'Äang lÆ°u...' : goal ? 'Cáº­p nháº­t' : 'Táº¡o'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
