import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SubscriptionModel } from '../models/subscription'
import { subscriptionService } from '../services/subscriptionService'

export function useSubscriptionsViewModel() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionModel | null>(null)

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionService.listSubscriptions,
  })
  const { data: stats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: subscriptionService.getStats,
  })
  const { data: upcoming } = useQuery({
    queryKey: ['upcoming-subscriptions'],
    queryFn: subscriptionService.listUpcoming,
  })

  const invalidateSubscriptions = () => {
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    queryClient.invalidateQueries({ queryKey: ['subscription-stats'] })
    queryClient.invalidateQueries({ queryKey: ['upcoming-subscriptions'] })
  }

  const pauseMutation = useMutation({
    mutationFn: subscriptionService.pauseSubscription,
    onSuccess: () => {
      invalidateSubscriptions()
      toast.success('Đã tạm dừng đăng ký')
    },
  })

  const resumeMutation = useMutation({
    mutationFn: subscriptionService.resumeSubscription,
    onSuccess: () => {
      invalidateSubscriptions()
      toast.success('Đã tiếp tục đăng ký')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: subscriptionService.cancelSubscription,
    onSuccess: () => {
      invalidateSubscriptions()
      toast.success('Đã hủy đăng ký')
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getBillingCycleText = (cycle: string) => {
    const map: Record<string, string> = {
      DAILY: 'HÃ ng ngÃ y',
      WEEKLY: 'HÃ ng tuáº§n',
      MONTHLY: 'HÃ ng thÃ¡ng',
      QUARTERLY: 'HÃ ng quÃ½',
      YEARLY: 'HÃ ng nÄƒm',
    }
    return map[cycle] || cycle
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success-100 text-success-800'
      case 'PAUSED':
        return 'bg-warning-100 text-warning-800'
      case 'CANCELLED':
        return 'bg-danger-100 text-danger-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysUntilRenewal = (date: string) => {
    return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  const openCreateModal = () => {
    setEditingSubscription(null)
    setShowModal(true)
  }

  const openEditModal = (subscription: SubscriptionModel) => {
    setEditingSubscription(subscription)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingSubscription(null)
  }

  const handleMutationSuccess = () => {
    invalidateSubscriptions()
    closeModal()
  }

  const cancelSubscription = (id: number) => {
    if (window.confirm('Báº¡n cÃ³ cháº¯c muá»‘n há»§y Ä‘Äƒng kÃ½ nÃ y?')) {
      cancelMutation.mutate(id)
    }
  }

  return {
    editingSubscription,
    isLoading,
    showModal,
    stats,
    subscriptions,
    upcoming,
    cancelSubscription,
    closeModal,
    formatCurrency,
    getBillingCycleText,
    getDaysUntilRenewal,
    getStatusColor,
    handleMutationSuccess,
    openCreateModal,
    openEditModal,
    pauseSubscription: pauseMutation.mutate,
    resumeSubscription: resumeMutation.mutate,
  }
}
