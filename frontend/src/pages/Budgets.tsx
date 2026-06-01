import { Plus, TrendingUp, AlertCircle, CheckCircle, Edit, Trash2, Wallet } from 'lucide-react'
import BudgetModal from '../components/budgets/BudgetModal'
import { useBudgetsViewModel } from '../viewmodels/useBudgetsViewModel'

export default function Budgets() {
  const viewModel = useBudgetsViewModel()

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertCircle className="w-5 h-5 text-rose-400" />
    if (percentage >= 80) return <TrendingUp className="w-5 h-5 text-amber-400" />
    return <CheckCircle className="w-5 h-5 text-emerald-400" />
  }

  const getProgressGradient = (percentage: number) => {
    if (percentage >= 100) return 'linear-gradient(90deg, #f43f5e, #fb7185)'
    if (percentage >= 80) return 'linear-gradient(90deg, #f59e0b, #fbbf24)'
    return 'linear-gradient(90deg, #10b981, #06b6d4)'
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-7 h-7 text-indigo-400" />
            Ngân sách
          </h1>
          <p className="text-muted mt-1">Lập kế hoạch chi tiêu thông minh</p>
        </div>
        <button
          onClick={viewModel.openCreateModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo ngân sách
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="stat-card stat-card-primary">
          <p className="text-muted text-sm font-medium mb-2">Tổng ngân sách</p>
          <p className="text-2xl font-bold text-indigo-400">
            {viewModel.formatCurrency(viewModel.summary.totalBudget)}
          </p>
        </div>
        <div className="stat-card stat-card-danger">
          <p className="text-muted text-sm font-medium mb-2">Đã chi tiêu</p>
          <p className="text-2xl font-bold text-rose-400">
            {viewModel.formatCurrency(viewModel.summary.totalSpent)}
          </p>
        </div>
        <div className="stat-card stat-card-success">
          <p className="text-muted text-sm font-medium mb-2">Còn lại</p>
          <p className="text-2xl font-bold text-emerald-400">
            {viewModel.formatCurrency(viewModel.summary.remaining)}
          </p>
        </div>
      </div>

      {/* Budget List */}
      {viewModel.isLoading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto" />
            <p className="text-muted mt-4 text-sm">Đang tải...</p>
          </div>
        </div>
      ) : viewModel.budgets?.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <Wallet className="w-14 h-14 mx-auto mb-3" style={{ color: 'rgba(240,240,255,0.2)' }} />
            <p className="text-muted mb-4">Chưa có ngân sách nào</p>
            <button onClick={viewModel.openCreateModal} className="btn btn-primary">
              Tạo ngân sách đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {viewModel.budgets?.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100
            const remaining = budget.amount - budget.spent

            return (
              <div key={budget.id} className="card">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(percentage)}
                    <div>
                      <h3 className="font-semibold text-white">{budget.name}</h3>
                      {budget.category?.name && (
                        <span className="badge badge-primary mt-1">{budget.category.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => viewModel.openEditModal(budget)}
                      className="btn btn-ghost p-2"
                      title="Sửa"
                    >
                      <Edit className="w-4 h-4 text-indigo-400" />
                    </button>
                    <button
                      onClick={() => viewModel.deleteBudget(budget.id)}
                      className="btn btn-ghost p-2"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Đã chi</span>
                    <span className="font-semibold text-white">
                      {viewModel.formatCurrency(budget.spent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Ngân sách</span>
                    <span className="font-semibold text-white">
                      {viewModel.formatCurrency(budget.amount)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted">Tiến độ</span>
                      <span className={`font-bold ${percentage >= 100 ? 'text-rose-400' : percentage >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          background: getProgressGradient(percentage),
                        }}
                      />
                    </div>
                  </div>

                  {/* Remaining */}
                  <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Còn lại</span>
                      <span className={`font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {viewModel.formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted">
                    {new Date(budget.startDate).toLocaleDateString('vi-VN')} →{' '}
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
