import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SubscriptionFormModel, SubscriptionModel } from '../models/subscription'
import { subscriptionService } from '../services/subscriptionService'

interface UseSubscriptionModalViewModelProps {
  subscription?: SubscriptionModel | null
  onSuccess: () => void
}

export const SUBSCRIPTION_ICON_OPTIONS = [
  'ðŸ“±',
  'ðŸŽ¬',
  'ðŸŽµ',
  'â˜ï¸',
  'ðŸŽ®',
  'ðŸ“º',
  'ðŸ’ª',
  'ðŸ“š',
  'ðŸ•',
  'ðŸš—',
]

export function useSubscriptionModalViewModel({
  subscription,
  onSuccess,
}: UseSubscriptionModalViewModelProps) {
  const form = useForm<SubscriptionFormModel>({
    defaultValues: subscription
      ? {
          name: subscription.name,
          description: subscription.description,
          amount: subscription.amount,
          billingCycle: subscription.billingCycle,
          provider: subscription.provider,
          website: subscription.website,
          icon: subscription.icon,
          startDate: new Date(subscription.startDate).toISOString().split('T')[0],
          reminderDaysBefore: subscription.reminderDaysBefore,
        }
      : {
          billingCycle: 'MONTHLY',
          icon: '📱',
          startDate: new Date().toISOString().split('T')[0],
          reminderDaysBefore: 3,
        },
  })

  const mutation = useMutation({
    mutationFn: (data: SubscriptionFormModel) => {
      if (subscription) {
        return subscriptionService.updateSubscription(subscription.id, data)
      }
      return subscriptionService.createSubscription(data)
    },
    onSuccess: () => {
      toast.success(subscription ? 'Đã cập nhật đăng ký' : 'Đã thêm đăng ký')
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
