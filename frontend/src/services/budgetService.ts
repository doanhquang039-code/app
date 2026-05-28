import api from '../lib/api'
import { BudgetFormModel, BudgetModel } from '../models/budget'
import { CategoryModel } from '../models/transaction'

export const budgetService = {
  async listBudgets(): Promise<BudgetModel[]> {
    const response = await api.get('/budgets')
    return response.data
  },

  async listCategories(): Promise<CategoryModel[]> {
    const response = await api.get('/categories')
    return response.data
  },

  async createBudget(data: BudgetFormModel) {
    return api.post('/budgets', data)
  },

  async updateBudget(id: number, data: BudgetFormModel) {
    return api.put(`/budgets/${id}`, data)
  },

  async deleteBudget(id: number) {
    return api.delete(`/budgets/${id}`)
  },
}
