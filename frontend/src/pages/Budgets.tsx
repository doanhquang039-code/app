import { Plus, TrendingUp, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react'
import BudgetModal from '../components/budgets/BudgetModal'
import { useBudgetsViewModel } from '../viewmodels/useBudgetsViewModel'

export default function Budgets() {
  const viewModel = useBudgetsViewModel()

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertCircle className="w-5 h-5 text-danger-600" />
    if (percentage >= 80) return <TrendingUp className="w-5 h-5 text-warning-600" />
    return <CheckCircle className="w-5 h-5 text-success-600" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NgÃ¢n sÃ¡ch</h1>
          <p className="text-gray-600 mt-1">Láº­p káº¿ hoáº¡ch chi tiÃªu</p>
        </div>
        <button
          onClick={viewModel.openCreateModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Táº¡o ngÃ¢n sÃ¡ch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Tá»•ng ngÃ¢n sÃ¡ch</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {viewModel.formatCurrency(viewModel.summary.totalBudget)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">ÄÃ£ chi tiÃªu</p>
          <p className="text-2xl font-bold text-danger-600 mt-1">
            {viewModel.formatCurrency(viewModel.summary.totalSpent)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">CÃ²n láº¡i</p>
          <p className="text-2xl font-bold text-success-600 mt-1">
            {viewModel.formatCurrency(viewModel.summary.remaining)}
          </p>
        </div>
      </div>

      {viewModel.isLoading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Äang táº£i...</p>
          </div>
        </div>
      ) : viewModel.budgets?.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <p className="text-gray-500">ChÆ°a cÃ³ ngÃ¢n sÃ¡ch nÃ o</p>
            <button onClick={viewModel.openCreateModal} className="btn btn-primary mt-4">
              Táº¡o ngÃ¢n sÃ¡ch Ä‘áº§u tiÃªn
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {viewModel.budgets?.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100
            const remaining = budget.amount - budget.spent

            return (
              <div key={budget.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(percentage)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                      <p className="text-sm text-gray-500">{budget.category?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewModel.openEditModal(budget)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => viewModel.deleteBudget(budget.id)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ÄÃ£ chi</span>
                    <span className="font-semibold text-gray-900">
                      {viewModel.formatCurrency(budget.spent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">NgÃ¢n sÃ¡ch</span>
                    <span className="font-semibold text-gray-900">
                      {viewModel.formatCurrency(budget.amount)}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Tiáº¿n Ä‘á»™</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${viewModel.getProgressColor(
                          percentage,
                        )}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CÃ²n láº¡i</span>
                      <span
                        className={`font-semibold ${
                          remaining >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}
                      >
                        {viewModel.formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(budget.startDate).toLocaleDateString('vi-VN')} -{' '}
                    {new Date(budget.endDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewModel.showModal && (
        <BudgetModal
          budget={viewModel.editingBudget}
          categories={viewModel.categories ?? []}
          onClose={viewModel.closeModal}
          onSuccess={viewModel.handleMutationSuccess}
        />
      )}
    </div>
  )
}
