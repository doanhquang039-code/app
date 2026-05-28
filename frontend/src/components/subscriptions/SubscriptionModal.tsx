import { X } from 'lucide-react'
import { SubscriptionModel } from '../../models/subscription'
import {
  SUBSCRIPTION_ICON_OPTIONS,
  useSubscriptionModalViewModel,
} from '../../viewmodels/useSubscriptionModalViewModel'

interface SubscriptionModalProps {
  subscription?: SubscriptionModel | null
  onClose: () => void
  onSuccess: () => void
}

export default function SubscriptionModal({
  subscription,
  onClose,
  onSuccess,
}: SubscriptionModalProps) {
  const viewModel = useSubscriptionModalViewModel({ subscription, onSuccess })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {subscription ? 'Sá»­a Ä‘Äƒng kÃ½' : 'ThÃªm Ä‘Äƒng kÃ½'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={viewModel.handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Biá»ƒu tÆ°á»£ng</label>
            <div className="grid grid-cols-5 gap-2">
              {SUBSCRIPTION_ICON_OPTIONS.map((icon) => (
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
            <label className="label">TÃªn dá»‹ch vá»¥</label>
            <input
              {...viewModel.register('name', { required: 'Vui lÃ²ng nháº­p tÃªn' })}
              type="text"
              className="input"
              placeholder="Netflix, Spotify, Gym..."
            />
            {viewModel.errors.name && (
              <p className="text-sm text-danger-600 mt-1">{viewModel.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">NhÃ  cung cáº¥p (tÃ¹y chá»n)</label>
            <input
              {...viewModel.register('provider')}
              type="text"
              className="input"
              placeholder="Netflix Inc."
            />
          </div>

          <div>
            <label className="label">GiÃ¡</label>
            <input
              {...viewModel.register('amount', {
                required: 'Vui lÃ²ng nháº­p giÃ¡',
                min: { value: 0, message: 'GiÃ¡ pháº£i lá»›n hÆ¡n 0' },
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
            <label className="label">Chu ká»³ thanh toÃ¡n</label>
            <select {...viewModel.register('billingCycle')} className="input">
              <option value="DAILY">HÃ ng ngÃ y</option>
              <option value="WEEKLY">HÃ ng tuáº§n</option>
              <option value="MONTHLY">HÃ ng thÃ¡ng</option>
              <option value="QUARTERLY">HÃ ng quÃ½</option>
              <option value="YEARLY">HÃ ng nÄƒm</option>
            </select>
          </div>

          <div>
            <label className="label">NgÃ y báº¯t Ä‘áº§u</label>
            <input
              {...viewModel.register('startDate', { required: 'Vui lÃ²ng chá»n ngÃ y' })}
              type="date"
              className="input"
            />
            {viewModel.errors.startDate && (
              <p className="text-sm text-danger-600 mt-1">{viewModel.errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="label">Nháº¯c nhá»Ÿ trÆ°á»›c (ngÃ y)</label>
            <input
              {...viewModel.register('reminderDaysBefore', {
                min: { value: 0, message: 'Pháº£i lá»›n hÆ¡n 0' },
              })}
              type="number"
              className="input"
              placeholder="3"
            />
          </div>

          <div>
            <label className="label">Ghi chÃº (tÃ¹y chá»n)</label>
            <textarea
              {...viewModel.register('description')}
              className="input"
              rows={2}
              placeholder="ThÃªm ghi chÃº..."
            />
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
              {viewModel.isSaving ? 'Äang lÆ°u...' : subscription ? 'Cáº­p nháº­t' : 'ThÃªm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
