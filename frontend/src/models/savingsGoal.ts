export type SavingsGoalStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PAUSED'

export interface SavingsGoalModel {
  id: number
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  deadline: string
  icon?: string
  status: SavingsGoalStatus
}

export interface SavingsGoalFormModel {
  name: string
  description?: string
  targetAmount: number
  currentAmount?: number
  deadline: string
  icon?: string
}
