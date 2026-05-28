export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionFilterType = 'ALL' | TransactionType

export interface CategoryModel {
  id: number
  name: string
  type: TransactionType
}

export interface WalletModel {
  id: number
  name: string
}

export interface TransactionModel {
  id: number
  type: TransactionType
  amount: number
  description: string
  categoryId: number
  walletId?: number
  date: string
  notes?: string
  category?: CategoryModel
  wallet?: WalletModel
}

export interface TransactionFormModel {
  type: TransactionType
  amount: number
  description: string
  categoryId: number
  walletId?: number
  date: string
  notes?: string
}

export interface ExportResponseModel {
  id: number
  fileName: string
}
