import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'
import { SavingsGoalModel } from '../models/savingsGoal'
import { savingsGoalService } from '../services/savingsGoalService'

export function useSavingsGoalsViewModel() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoalModel | null>(null)

  const { data: goals, isLoading } = useQuery('savings-goals', savingsGoalService.listGoals)

  const deleteMutation = useMutation(savingsGoalService.deleteGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries('savings-goals')
      toast.success('ÄÃ£ xÃ³a má»¥c tiÃªu')
    },
  })

  const contributeMutation = useMutation(
    ({ id, amount }: { id: number; amount: number }) => savingsGoalService.contribute(id, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('savings-goals')
        toast.success('ÄÃ£ thÃªm tiá»n tiáº¿t kiá»‡m')
      },
    },
  )

  const summary = useMemo(() => {
    return {
      completedGoals: goals?.filter((goal) => goal.status === 'COMPLETED').length || 0,
      totalSaved: goals?.reduce((sum, goal) => sum + goal.currentAmount, 0) || 0,
      totalTarget: goals?.reduce((sum, goal) => sum + goal.targetAmount, 0) || 0,
    }
  }, [goals])

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
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  const openCreateModal = () => {
    setEditingGoal(null)
    setShowModal(true)
  }

  const openEditModal = (goal: SavingsGoalModel) => {
    setEditingGoal(goal)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingGoal(null)
  }

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries('savings-goals')
    closeModal()
  }

  const deleteGoal = (id: number) => {
    if (window.confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a má»¥c tiÃªu nÃ y?')) {
      deleteMutation.mutate(id)
    }
  }

  const contributeToGoal = (goalId: number) => {
    const amount = prompt('Nháº­p sá»‘ tiá»n muá»‘n thÃªm:')
    if (amount && !isNaN(Number(amount))) {
      contributeMutation.mutate({ id: goalId, amount: Number(amount) })
    }
  }

  return {
    editingGoal,
    goals,
    isLoading,
    showModal,
    summary,
    closeModal,
    contributeToGoal,
    deleteGoal,
    formatCurrency,
    getDaysRemaining,
    getStatusColor,
    handleMutationSuccess,
    openCreateModal,
    openEditModal,
  }
}
