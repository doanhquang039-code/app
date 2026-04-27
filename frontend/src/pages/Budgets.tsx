import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, TrendingUp, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../lib/api'
import BudgetModal from '../components/budgets/BudgetModal'

export default function Budgets() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)

  const { data: budgets, isLoading } = useQuery('budgets', async () => {
    const response = await api.get('/budgets')
    return response.data
  })

  const { data: categories } = useQuery('categories', async () => {
    const response = await api.get('/categories')
    return response.data
  })

  const deleteMutation = useMutation(
    (id: number) => api.delete(`/budgets/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('budgets')
        toast.success('Đã xóa ngân sách')
      },
    }
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-danger-600'
    if (percentage >= 80) return 'bg-warning-600'
    return 'bg-success-600'
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertCircle className="w-5 h-5 text-danger-600" />
    if (percentage >= 80) return <TrendingUp className="w-5 h-5 text-warning-600" />
    return <CheckCircle className="w-5 h-5 text-success-600" />
  }

  const handleEdit = (budget: any) => {
    setEditingBudget(budget)
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa ngân sách này?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ngân sách</h1>
          <p className="text-gray-600 mt-1">Lập kế hoạch chi tiêu</p>
        </div>
        <button
          onClick={() => {
            setEditingBudget(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo ngân sách
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Tổng ngân sách</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(budgets?.reduce((sum: number, b: any) => sum + b.amount, 0) || 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Đã chi tiêu</p>
          <p className="text-2xl font-bold text-danger-600 mt-1">
            {formatCurrency(budgets?.reduce((sum: number, b: any) => sum + b.spent, 0) || 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Còn lại</p>
          <p className="text-2xl font-bold text-success-600 mt-1">
            {formatCurrency(
              budgets?.reduce((sum: number, b: any) => sum + (b.amount - b.spent), 0) || 0
            )}
          </p>
        </div>
      </div>

      {/* Budgets List */}
      {isLoading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải...</p>
          </div>
        </div>
      ) : budgets?.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có ngân sách nào</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary mt-4"
            >
              Tạo ngân sách đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets?.map((budget: any) => {
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
                      onClick={() => handleEdit(budget)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Đã chi</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(budget.spent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ngân sách</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(budget.amount)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(
                          percentage
                        )}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Còn lại</span>
                      <span
                        className={`font-semibold ${
                          remaining >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}
                      >
                        {formatCurrency(remaining)}
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

      {showModal && (
        <BudgetModal
          budget={editingBudget}
          categories={categories}
          onClose={() => {
            setShowModal(false)
            setEditingBudget(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries('budgets')
            setShowModal(false)
            setEditingBudget(null)
          }}
        />
      )}
    </div>
  )
}
