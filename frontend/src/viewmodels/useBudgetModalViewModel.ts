import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { BudgetFormModel, BudgetModel } from '../models/budget'
import { budgetService } from '../services/budgetService'

interface UseBudgetModalViewModelProps {
  budget?: BudgetModel | null
  onSuccess: () => void
}

export function useBudgetModalViewModel({
  budget,
  onSuccess,
}: UseBudgetModalViewModelProps) {
  const form = useForm<BudgetFormModel>({
    defaultValues: budget
      ? {
          name: budget.name,
          amount: budget.amount,
          categoryId: budget.categoryId,
          startDate: new Date(budget.startDate).toISOString().split('T')[0],
          endDate: new Date(budget.endDate).toISOString().split('T')[0],
          period: budget.period,
        }
      : {
          period: 'MONTHLY',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split('T')[0],
        },
  })

  const mutation = useMutation({
    mutationFn: (data: BudgetFormModel) => {
      if (budget) {
        return budgetService.updateBudget(budget.id, data)
      }
      return budgetService.createBudget(data)
    },
    onSuccess: () => {
      toast.success(budget ? 'Đã cập nhật ngân sách' : 'Đã tạo ngân sách')
      onSuccess()
    },
    onError: () => {
      toast.error('Có lỗi xảy ra')
    },
  })

  return {
    errors: form.formState.errors,
    handleSubmit: form.handleSubmit((data) => mutation.mutate(data)),
    isSaving: mutation.isPending,
    register: form.register,
  }
}
