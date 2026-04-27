import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Target, TrendingUp, Calendar, DollarSign, Edit, Trash2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import api from '../lib/api'
import SavingsGoalModal from '../components/savings/SavingsGoalModal'

export default function SavingsGoals() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)

  const { data: goals, isLoading } = useQuery('savings-goals', async () => {
    const response = await api.get('/savings-goals')
    return response.data
  })

  const deleteMutation = useMutation(
    (id: number) => api.delete(`/savings-goals/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('savings-goals')
        toast.success('Đã xóa mục tiêu')
      },
    }
  )

  const contributeMutation = useMutation(
    ({ id, amount }: { id: number; amount: number }) =>
      api.post(`/savings-goals/${id}/contribute`, { amount }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('savings-goals')
        toast.success('Đã thêm tiền tiết kiệm')
      },
    }
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success-100 text-success-800'
      case 'IN_PROGRESS':
        return 'bg-primary-100 text-primary-800'
      case 'PAUSED':
        return 'bg-warning-100 text-warning-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  const handleContribute = (goalId: number) => {
    const amount = prompt('Nhập số tiền muốn thêm:')
    if (amount && !isNaN(Number(amount))) {
      contributeMutation.mutate({ id: goalId, amount: Number(amount) })
    }
  }

  const totalSaved = goals?.reduce((sum: number, g: any) => sum + g.currentAmount, 0) || 0
  const totalTarget = goals?.reduce((sum: number, g: any) => sum + g.targetAmount, 0) || 0
  const completedGoals = goals?.filter((g: any) => g.status === 'COMPLETED').length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mục tiêu tiết kiệm</h1>
          <p className="text-gray-600 mt-1">Theo dõi tiến độ tiết kiệm</p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo mục tiêu
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng mục tiêu</p>
              <p className="text-2xl font-bold text-gray-900">{goals?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-success-600">{completedGoals}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã tiết kiệm</p>
              <p className="text-xl font-bold text-warning-600">{formatCurrency(totalSaved)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mục tiêu</p>
              <p className="text-xl font-bold text-danger-600">{formatCurrency(totalTarget)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      {isLoading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải...</p>
          </div>
        </div>
      ) : goals?.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Chưa có mục tiêu nào</p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              Tạo mục tiêu đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals?.map((goal: any) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100
            const remaining = goal.targetAmount - goal.currentAmount
            const daysRemaining = getDaysRemaining(goal.deadline)

            return (
              <div key={goal.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{goal.icon || '🎯'}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(goal.status)}`}>
                        {goal.status === 'COMPLETED' ? 'Hoàn thành' : goal.status === 'IN_PROGRESS' ? 'Đang tiến hành' : 'Tạm dừng'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingGoal(goal)
                        setShowModal(true)
                      }}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
                          deleteMutation.mutate(goal.id)
                        }
                      }}
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
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="font-semibold text-gray-900">{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Hiện tại</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Mục tiêu</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>

                  {/* Remaining */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Còn thiếu</span>
                      <span className="font-semibold text-danger-600">{formatCurrency(remaining)}</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {daysRemaining > 0 ? `Còn ${daysRemaining} ngày` : daysRemaining === 0 ? 'Hôm nay' : `Quá hạn ${Math.abs(daysRemaining)} ngày`}
                    </span>
                  </div>

                  {/* Action Button */}
                  {goal.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleContribute(goal.id)}
                      className="btn btn-primary w-full mt-2"
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

      {showModal && (
        <SavingsGoalModal
          goal={editingGoal}
          onClose={() => {
            setShowModal(false)
            setEditingGoal(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries('savings-goals')
            setShowModal(false)
            setEditingGoal(null)
          }}
        />
      )}
    </div>
  )
}
