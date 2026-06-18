import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SavingsGoalFormModel, SavingsGoalModel } from '../models/savingsGoal'
import { savingsGoalService } from '../services/savingsGoalService'

interface UseSavingsGoalModalViewModelProps {
  goal?: SavingsGoalModel | null
  onSuccess: () => void
}

export const SAVINGS_GOAL_ICON_OPTIONS = [
  'ðŸŽ¯',
  'ðŸ ',
  'ðŸš—',
  'âœˆï¸',
  'ðŸ’',
  'ðŸŽ“',
  'ðŸ’°',
  'ðŸ–ï¸',
  'ðŸ“±',
  'ðŸ’»',
]

export function useSavingsGoalModalViewModel({
  goal,
  onSuccess,
}: UseSavingsGoalModalViewModelProps) {
  const form = useForm<SavingsGoalFormModel>({
    defaultValues: goal
      ? {
          name: goal.name,
          description: goal.description,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: new Date(goal.deadline).toISOString().split('T')[0],
          icon: goal.icon,
        }
      : {
          currentAmount: 0,
          icon: '🎯',
          deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
  })

  const mutation = useMutation({
    mutationFn: (data: SavingsGoalFormModel) => {
      if (goal) {
        return savingsGoalService.updateGoal(goal.id, data)
      }
      return savingsGoalService.createGoal(data)
    },
    onSuccess: () => {
      toast.success(goal ? 'Đã cập nhật mục tiêu' : 'Đã tạo mục tiêu')
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
    selectedIcon: form.watch('icon'),
    setValue: form.setValue,
  }
}
