import {
  Plus, Target, TrendingUp, Calendar,
  DollarSign, Edit, Trash2, CheckCircle,
} from 'lucide-react'
import SavingsGoalModal from '../components/savings/SavingsGoalModal'
import { useSavingsGoalsViewModel } from '../viewmodels/useSavingsGoalsViewModel'

export default function SavingsGoals() {
  const viewModel = useSavingsGoalsViewModel()

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED') return <span className="badge badge-success">Hoàn thành</span>
    if (status === 'IN_PROGRESS') return <span className="badge badge-primary">Đang tiến hành</span>
    return <span className="badge badge-warning">Tạm dừng</span>
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Target className="w-7 h-7 text-indigo-400" />
            Mục tiêu tiết kiệm
          </h1>
          <p className="text-muted mt-1">Theo dõi tiến độ tiết kiệm</p>
        </div>
        <button
          onClick={viewModel.openCreateModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo mục tiêu
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="stat-card stat-card-primary">
          <div className="flex items-center justify-between mb-3">
            <p className="text-muted text-sm font-medium">Tổng mục tiêu</p>
            <div className="icon-bubble icon-bubble-primary">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-indigo-400">{viewModel.goals?.length || 0}</p>
        </div>

        <div className="stat-card stat-card-success">
          <div className="flex items-center justify-between mb-3">
            <p className="text-muted text-sm font-medium">Đã hoàn thành</p>
            <div className="icon-bubble icon-bubble-success">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{viewModel.summary.completedGoals}</p>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="flex items-center justify-between mb-3">
            <p className="text-muted text-sm font-medium">Đã tiết kiệm</p>
            <div className="icon-bubble icon-bubble-warning">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-amber-400">
            {viewModel.formatCurrency(viewModel.summary.totalSaved)}
          </p>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="flex items-center justify-between mb-3">
            <p className="text-muted text-sm font-medium">Mục tiêu</p>
            <div className="icon-bubble icon-bubble-danger">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-rose-400">
            {viewModel.formatCurrency(viewModel.summary.totalTarget)}
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      {viewModel.isLoading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto" />
            <p className="text-muted mt-4 text-sm">Đang tải...</p>
          </div>
        </div>
      ) : viewModel.goals?.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <Target className="w-14 h-14 mx-auto mb-3" style={{ color: 'rgba(240,240,255,0.2)' }} />
            <p className="text-muted mb-4">Chưa có mục tiêu nào</p>
            <button onClick={viewModel.openCreateModal} className="btn btn-primary">
              Tạo mục tiêu đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {viewModel.goals?.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100
            const remaining = goal.targetAmount - goal.currentAmount
            const daysRemaining = viewModel.getDaysRemaining(goal.deadline)
            const isCompleted = goal.status === 'COMPLETED'

            return (
              <div key={goal.id} className="card">
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)' }}
                    >
                      {goal.icon || '🎯'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{goal.name}</h3>
                      {getStatusBadge(goal.status)}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => viewModel.openEditModal(goal)}
                      className="btn btn-ghost p-1.5"
                      title="Sửa"
                    >
                      <Edit className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                    <button
                      onClick={() => viewModel.deleteGoal(goal.id)}
                      className="btn btn-ghost p-1.5"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-muted mb-4 leading-relaxed">{goal.description}</p>
                )}

                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted">Tiến độ</span>
                      <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {Math.min(Math.round(percentage), 100)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          background: isCompleted
                            ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                            : 'var(--gradient-primary)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Amount Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-xs text-muted mb-1">Hiện tại</p>
                      <p className="font-bold text-emerald-400 text-sm">
                        {viewModel.formatCurrency(goal.currentAmount)}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-xs text-muted mb-1">Mục tiêu</p>
                      <p className="font-bold text-white text-sm">
                        {viewModel.formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Remaining & Deadline */}
                  <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted">Còn thiếu</span>
                      <span className="font-bold text-rose-400">
                        {viewModel.formatCurrency(remaining > 0 ? remaining : 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {daysRemaining > 0
                          ? `Còn ${daysRemaining} ngày`
                          : daysRemaining === 0
                            ? 'Hôm nay là deadline'
                            : `Quá hạn ${Math.abs(daysRemaining)} ngày`}
                      </span>
                    </div>
                  </div>

                  {/* Contribute Button */}
                  {goal.status !== 'COMPLETED' && (
                    <button
                      onClick={() => viewModel.contributeToGoal(goal.id)}
                      className="btn btn-primary w-full"
                    >
                      Thêm tiền tiết kiệm
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
