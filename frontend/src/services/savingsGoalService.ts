import api from '../lib/api'
import { SavingsGoalFormModel, SavingsGoalModel } from '../models/savingsGoal'

export const savingsGoalService = {
  async listGoals(): Promise<SavingsGoalModel[]> {
    const response = await api.get('/savings-goals')
    return response.data
  },

  async createGoal(data: SavingsGoalFormModel) {
    return api.post('/savings-goals', data)
  },

  async updateGoal(id: number, data: SavingsGoalFormModel) {
    return api.put(`/savings-goals/${id}`, data)
  },

  async deleteGoal(id: number) {
    return api.delete(`/savings-goals/${id}`)
  },

  async contribute(id: number, amount: number) {
    return api.post(`/savings-goals/${id}/contribute`, { amount })
  },
}
