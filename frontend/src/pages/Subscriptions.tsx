import {
  Plus,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  Play,
  Pause,
  X,
  Edit,
} from 'lucide-react'
import SubscriptionModal from '../components/subscriptions/SubscriptionModal'
import { useSubscriptionsViewModel } from '../viewmodels/useSubscriptionsViewModel'

export default function Subscriptions() {
  const viewModel = useSubscriptionsViewModel()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ÄÄƒng kÃ½</h1>
          <p className="text-gray-600 mt-1">Quáº£n lÃ½ dá»‹ch vá»¥ Ä‘á»‹nh ká»³</p>
        </div>
        <button
          onClick={viewModel.openCreateModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          ThÃªm Ä‘Äƒng kÃ½
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tá»•ng Ä‘Äƒng kÃ½</p>
              <p className="text-2xl font-bold text-gray-900">{viewModel.stats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Äang hoáº¡t Ä‘á»™ng</p>
              <p className="text-2xl font-bold text-success-600">{viewModel.stats?.active || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chi phÃ­/thÃ¡ng</p>
              <p className="text-xl font-bold text-warning-600">
                {viewModel.formatCurrency(viewModel.stats?.monthlyCost || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chi phÃ­/nÄƒm</p>
              <p className="text-xl font-bold text-danger-600">
                {viewModel.formatCurrency(viewModel.stats?.yearlyCost || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {viewModel.upcoming && viewModel.upcoming.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sáº¯p gia háº¡n (30 ngÃ y tá»›i)
          </h3>
          <div className="space-y-3">
            {viewModel.upcoming.map((subscription) => {
              const days = viewModel.getDaysUntilRenewal(subscription.nextBillingDate)
              return (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-3 bg-warning-50 rounded-lg border border-warning-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{subscription.icon || 'ðŸ“±'}</span>
                    <div>
                      <p className="font-medium text-gray-900">{subscription.name}</p>
                      <p className="text-sm text-gray-600">
                        {days === 0 ? 'HÃ´m nay' : days === 1 ? 'NgÃ y mai' : `${days} ngÃ y ná»¯a`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {viewModel.formatCurrency(subscription.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {viewModel.getBillingCycleText(subscription.billingCycle)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {viewModel.isLoading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Äang táº£i...</p>
          </div>
        </div>
      ) : viewModel.subscriptions?.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ChÆ°a cÃ³ Ä‘Äƒng kÃ½ nÃ o</p>
            <button onClick={viewModel.openCreateModal} className="btn btn-primary">
              ThÃªm Ä‘Äƒng kÃ½ Ä‘áº§u tiÃªn
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewModel.subscriptions?.map((subscription) => {
            const daysUntilRenewal = viewModel.getDaysUntilRenewal(subscription.nextBillingDate)

            return (
              <div key={subscription.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{subscription.icon || 'ðŸ“±'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{subscription.name}</h3>
                      <p className="text-sm text-gray-600">{subscription.provider}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${viewModel.getStatusColor(
                      subscription.status,
                    )}`}
                  >
                    {subscription.status === 'ACTIVE'
                      ? 'Hoáº¡t Ä‘á»™ng'
                      : subscription.status === 'PAUSED'
                        ? 'Táº¡m dá»«ng'
                        : 'ÄÃ£ há»§y'}
                  </span>
                </div>

                {subscription.description && (
                  <p className="text-sm text-gray-600 mb-4">{subscription.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">GiÃ¡</span>
                    <span className="font-semibold text-gray-900">
                      {viewModel.formatCurrency(subscription.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Chu ká»³</span>
                    <span className="text-sm text-gray-900">
                      {viewModel.getBillingCycleText(subscription.billingCycle)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gia háº¡n tiáº¿p theo</span>
                    <span className="text-sm text-gray-900">
                      {new Date(subscription.nextBillingDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {daysUntilRenewal === 0
                          ? 'Gia háº¡n hÃ´m nay'
                          : daysUntilRenewal > 0
                            ? `CÃ²n ${daysUntilRenewal} ngÃ y`
                            : `QuÃ¡ háº¡n ${Math.abs(daysUntilRenewal)} ngÃ y`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => viewModel.openEditModal(subscription)}
                      className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Sá»­a
                    </button>

                    {subscription.status === 'ACTIVE' ? (
                      <button
                        onClick={() => viewModel.pauseSubscription(subscription.id)}
                        className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        Táº¡m dá»«ng
                      </button>
                    ) : subscription.status === 'PAUSED' ? (
                      <button
                        onClick={() => viewModel.resumeSubscription(subscription.id)}
                        className="btn btn-success flex-1 flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Tiáº¿p tá»¥c
                      </button>
                    ) : null}

                    {subscription.status !== 'CANCELLED' && (
                      <button
                        onClick={() => viewModel.cancelSubscription(subscription.id)}
                        className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewModel.showModal && (
        <SubscriptionModal
          subscription={viewModel.editingSubscription}
          onClose={viewModel.closeModal}
          onSuccess={viewModel.handleMutationSuccess}
        />
      )}
    </div>
  )
}
