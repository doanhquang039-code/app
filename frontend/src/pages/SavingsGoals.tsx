import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react'
import SavingsGoalModal from '../components/savings/SavingsGoalModal'
import { useSavingsGoalsViewModel } from '../viewmodels/useSavingsGoalsViewModel'

export default function SavingsGoals() {
  const viewModel = useSavingsGoalsViewModel()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Má»¥c tiÃªu tiáº¿t kiá»‡m</h1>
          <p className="text-gray-600 mt-1">Theo dÃµi tiáº¿n Ä‘á»™ tiáº¿t kiá»‡m</p>
        </div>
        <button
          onClick={viewModel.openCreateModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Táº¡o má»¥c tiÃªu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tá»•ng má»¥c tiÃªu</p>
              <p className="text-2xl font-bold text-gray-900">{viewModel.goals?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">ÄÃ£ hoÃ n thÃ nh</p>
              <p className="text-2xl font-bold text-success-600">
                {viewModel.summary.completedGoals}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">ÄÃ£ tiáº¿t kiá»‡m</p>
              <p className="text-xl font-bold text-warning-600">
                {viewModel.formatCurrency(viewModel.summary.totalSaved)}
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
              <p className="text-sm text-gray-600">Má»¥c tiÃªu</p>
              <p className="text-xl font-bold text-danger-600">
                {viewModel.formatCurrency(viewModel.summary.totalTarget)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {viewModel.isLoading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Äang táº£i...</p>
          </div>
        </div>
      ) : viewModel.goals?.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">ChÆ°a cÃ³ má»¥c tiÃªu nÃ o</p>
            <button onClick={viewModel.openCreateModal} className="btn btn-primary">
              Táº¡o má»¥c tiÃªu Ä‘áº§u tiÃªn
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewModel.goals?.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100
            const remaining = goal.targetAmount - goal.currentAmount
            const daysRemaining = viewModel.getDaysRemaining(goal.deadline)

            return (
              <div key={goal.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{goal.icon || 'ðŸŽ¯'}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${viewModel.getStatusColor(
                          goal.status,
                        )}`}
                      >
                        {goal.status === 'COMPLETED'
                          ? 'HoÃ n thÃ nh'
                          : goal.status === 'IN_PROGRESS'
                            ? 'Äang tiáº¿n hÃ nh'
                            : 'Táº¡m dá»«ng'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewModel.openEditModal(goal)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => viewModel.deleteGoal(goal.id)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Tiáº¿n Ä‘á»™</span>
                      <span className="font-semibold text-gray-900">{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Hiá»‡n táº¡i</p>
                      <p className="font-semibold text-gray-900">
                        {viewModel.formatCurrency(goal.currentAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Má»¥c tiÃªu</p>
                      <p className="font-semibold text-gray-900">
                        {viewModel.formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">CÃ²n thiáº¿u</span>
                      <span className="font-semibold text-danger-600">
                        {viewModel.formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {daysRemaining > 0
                        ? `CÃ²n ${daysRemaining} ngÃ y`
                        : daysRemaining === 0
                          ? 'HÃ´m nay'
                          : `QuÃ¡ háº¡n ${Math.abs(daysRemaining)} ngÃ y`}
                    </span>
                  </div>

                  {goal.status !== 'COMPLETED' && (
                    <button
                      onClick={() => viewModel.contributeToGoal(goal.id)}
                      className="btn btn-primary w-full mt-2"
                    >
                      ThÃªm tiá»n tiáº¿t kiá»‡m
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewModel.showModal && (
        <SavingsGoalModal
          goal={viewModel.editingGoal}
          onClose={viewModel.closeModal}
          onSuccess={viewModel.handleMutationSuccess}
        />
      )}
    </div>
  )
}
