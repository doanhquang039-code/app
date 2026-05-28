import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
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
          icon: 'ðŸ“±',
          startDate: new Date().toISOString().split('T')[0],
          reminderDaysBefore: 3,
        },
  })

  const mutation = useMutation(
    (data: SubscriptionFormModel) => {
      if (subscription) {
        return subscriptionService.updateSubscription(subscription.id, data)
      }
      return subscriptionService.createSubscription(data)
    },
    {
      onSuccess: () => {
        toast.success(subscription ? 'ÄÃ£ cáº­p nháº­t Ä‘Äƒng kÃ½' : 'ÄÃ£ thÃªm Ä‘Äƒng kÃ½')
        onSuccess()
      },
      onError: () => {
        toast.error('CÃ³ lá»—i xáº£y ra')
      },
    },
  )

  return {
    errors: form.formState.errors,
    handleSubmit: form.handleSubmit((data) => mutation.mutate(data)),
    isSaving: mutation.isLoading,
    register: form.register,
    selectedIcon: form.watch('icon'),
    setValue: form.setValue,
  }
}
