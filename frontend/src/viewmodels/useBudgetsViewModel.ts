import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'
import { BudgetModel } from '../models/budget'
import { budgetService } from '../services/budgetService'

export function useBudgetsViewModel() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetModel | null>(null)

  const { data: budgets, isLoading } = useQuery('budgets', budgetService.listBudgets)
  const { data: categories } = useQuery('categories', budgetService.listCategories)

  const deleteMutation = useMutation(budgetService.deleteBudget, {
    onSuccess: () => {
      queryClient.invalidateQueries('budgets')
      toast.success('ÄÃ£ xÃ³a ngÃ¢n sÃ¡ch')
    },
  })

  const summary = useMemo(() => {
    const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0
    const totalSpent = budgets?.reduce((sum, budget) => sum + budget.spent, 0) || 0
    return {
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
    }
  }, [budgets])

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

  const openCreateModal = () => {
    setEditingBudget(null)
    setShowModal(true)
  }

  const openEditModal = (budget: BudgetModel) => {
    setEditingBudget(budget)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBudget(null)
  }

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries('budgets')
    closeModal()
  }

  const deleteBudget = (id: number) => {
    if (window.confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a ngÃ¢n sÃ¡ch nÃ y?')) {
      deleteMutation.mutate(id)
    }
  }

  return {
    budgets,
    categories,
    editingBudget,
    isLoading,
    showModal,
    summary,
    closeModal,
    deleteBudget,
    formatCurrency,
    getProgressColor,
    handleMutationSuccess,
    openCreateModal,
    openEditModal,
  }
}
