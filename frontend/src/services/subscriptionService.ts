import api from '../lib/api'
import {
  SubscriptionFormModel,
  SubscriptionModel,
  SubscriptionStatsModel,
} from '../models/subscription'

export const subscriptionService = {
  async listSubscriptions(): Promise<SubscriptionModel[]> {
    const response = await api.get('/subscriptions')
    return response.data
  },

  async getStats(): Promise<SubscriptionStatsModel> {
    const response = await api.get('/subscriptions/stats')
    return response.data
  },

  async listUpcoming(): Promise<SubscriptionModel[]> {
    const response = await api.get('/subscriptions/upcoming?days=30')
    return response.data
  },

  async createSubscription(data: SubscriptionFormModel) {
    return api.post('/subscriptions', data)
  },

  async updateSubscription(id: number, data: SubscriptionFormModel) {
    return api.put(`/subscriptions/${id}`, data)
  },

  async pauseSubscription(id: number) {
    return api.put(`/subscriptions/${id}/pause`)
  },

  async resumeSubscription(id: number) {
    return api.put(`/subscriptions/${id}/resume`)
  },

  async cancelSubscription(id: number) {
    return api.put(`/subscriptions/${id}/cancel`)
  },
}
