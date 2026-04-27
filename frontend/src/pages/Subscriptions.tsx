import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, CreditCard, Calendar, DollarSign, TrendingUp, Play, Pause, X, Edit } from 'lucide-react'
import { toast } from 'sonner'
import api from '../lib/api'
import SubscriptionModal from '../components/subscriptions/SubscriptionModal'

export default function Subscriptions() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<any>(null)

  const { data: subscriptions, isLoading } = useQuery('subscriptions', async () => {
    const response = await api.get('/subscriptions')
    return response.data
  })

  const { data: stats } = useQuery('subscription-stats', async () => {
    const response = await api.get('/subscriptions/stats')
    return response.data
  })

  const { data: upcoming } = useQuery('upcoming-subscriptions', async () => {
    const response = await api.get('/subscriptions/upcoming?days=30')
    return response.data
  })

  const pauseMutation = useMutation(
    (id: number) => api.put(`/subscriptions/${id}/pause`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('subscriptions')
        toast.success('Đã tạm dừng đăng ký')
      },
    }
  )

  const resumeMutation = useMutation(
    (id: number) => api.put(`/subscriptions/${id}/resume`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('subscriptions')
        toast.success('Đã tiếp tục đăng ký')
      },
    }
  )

  const cancelMutation = useMutation(
    (id: number) => api.put(`/subscriptions/${id}/cancel`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('subscriptions')
        toast.success('Đã hủy đăng ký')
      },
    }
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getBillingCycleText = (cycle: string) => {
    const map: any = {
      DAILY: 'Hàng ngày',
      WEEKLY: 'Hàng tuần',
      MONTHLY: 'Hàng tháng',
      QUARTERLY: 'Hàng quý',
      YEARLY: 'Hàng năm',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đăng ký</h1>
          <p className="text-gray-600 mt-1">Quản lý dịch vụ định kỳ</p>
        </div>
        <button
          onClick={() => {
            setEditingSubscription(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm đăng ký
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng đăng ký</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-success-600">{stats?.active || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chi phí/tháng</p>
              <p className="text-xl font-bold text-warning-600">
                {formatCurrency(stats?.monthlyCost || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chi phí/năm</p>
              <p className="text-xl font-bold text-danger-600">
                {formatCurrency(stats?.yearlyCost || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Renewals */}
      {upcoming && upcoming.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sắp gia hạn (30 ngày tới)</h3>
          <div className="space-y-3">
            {upcoming.map((sub: any) => {
              const days = getDaysUntilRenewal(sub.nextBillingDate)
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-warning-50 rounded-lg border border-warning-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sub.icon || '📱'}</span>
                    <div>
                      <p className="font-medium text-gray-900">{sub.name}</p>
                      <p className="text-sm text-gray-600">
                        {days === 0 ? 'Hôm nay' : days === 1 ? 'Ngày mai' : `${days} ngày nữa`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(sub.amount)}</p>
                    <p className="text-sm text-gray-600">{getBillingCycleText(sub.billingCycle)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      {isLoading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải...</p>
          </div>
        </div>
      ) : subscriptions?.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Chưa có đăng ký nào</p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              Thêm đăng ký đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions?.map((subscription: any) => {
            const daysUntilRenewal = getDaysUntilRenewal(subscription.nextBillingDate)

            return (
              <div key={subscription.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{subscription.icon || '📱'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{subscription.name}</h3>
                      <p className="text-sm text-gray-600">{subscription.provider}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      subscription.status
                    )}`}
                  >
                    {subscription.status === 'ACTIVE'
                      ? 'Hoạt động'
                      : subscription.status === 'PAUSED'
                      ? 'Tạm dừng'
                      : 'Đã hủy'}
                  </span>
                </div>

                {subscription.description && (
                  <p className="text-sm text-gray-600 mb-4">{subscription.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giá</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(subscription.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Chu kỳ</span>
                    <span className="text-sm text-gray-900">
                      {getBillingCycleText(subscription.billingCycle)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gia hạn tiếp theo</span>
                    <span className="text-sm text-gray-900">
                      {new Date(subscription.nextBillingDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {daysUntilRenewal === 0
                          ? 'Gia hạn hôm nay'
                          : daysUntilRenewal > 0
                          ? `Còn ${daysUntilRenewal} ngày`
                          : `Quá hạn ${Math.abs(daysUntilRenewal)} ngày`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setEditingSubscription(subscription)
                        setShowModal(true)
                      }}
                      className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </button>

                    {subscription.status === 'ACTIVE' ? (
                      <button
                        onClick={() => pauseMutation.mutate(subscription.id)}
                        className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        Tạm dừng
                      </button>
                    ) : subscription.status === 'PAUSED' ? (
                      <button
                        onClick={() => resumeMutation.mutate(subscription.id)}
                        className="btn btn-success flex-1 flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Tiếp tục
                      </button>
                    ) : null}

                    {subscription.status !== 'CANCELLED' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc muốn hủy đăng ký này?')) {
                            cancelMutation.mutate(subscription.id)
                          }
                        }}
                        className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <SubscriptionModal
          subscription={editingSubscription}
          onClose={() => {
            setShowModal(false)
            setEditingSubscription(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries('subscriptions')
            queryClient.invalidateQueries('subscription-stats')
            queryClient.invalidateQueries('upcoming-subscriptions')
            setShowModal(false)
            setEditingSubscription(null)
          }}
        />
      )}
    </div>
  )
}
