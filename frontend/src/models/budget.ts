import { CategoryModel } from './transaction'

export type BudgetPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'

export interface BudgetModel {
  id: number
  name: string
  amount: number
  spent: number
  categoryId: number
  startDate: string
  endDate: string
  period: BudgetPeriod
  category?: CategoryModel
}

export interface BudgetFormModel {
  name: string
  amount: number
  categoryId: number
  startDate: string
  endDate: string
  period: BudgetPeriod
}
