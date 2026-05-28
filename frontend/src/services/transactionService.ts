import api from '../lib/api'
import {
  CategoryModel,
  ExportResponseModel,
  TransactionFormModel,
  TransactionModel,
} from '../models/transaction'

export const transactionService = {
  async listTransactions(): Promise<TransactionModel[]> {
    const response = await api.get('/transactions')
    return response.data
  },

  async listCategories(): Promise<CategoryModel[]> {
    const response = await api.get('/categories')
    return response.data
  },

  async createTransaction(data: TransactionFormModel) {
    return api.post('/transactions', data)
  },

  async updateTransaction(id: number, data: TransactionFormModel) {
    return api.put(`/transactions/${id}`, data)
  },

  async deleteTransaction(id: number) {
    return api.delete(`/transactions/${id}`)
  },

  async requestExport(): Promise<ExportResponseModel> {
    const response = await api.post('/export-import/export', {
      exportType: 'EXCEL',
      dataType: 'TRANSACTIONS',
    })
    return response.data
  },

  async downloadExport(id: number): Promise<BlobPart> {
    const response = await api.get(`/export-import/download/${id}`, {
      responseType: 'blob',
    })
    return response.data
  },
}
