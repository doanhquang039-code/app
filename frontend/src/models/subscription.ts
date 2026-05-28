export type BillingCycle = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED'

export interface SubscriptionModel {
  id: number
  name: string
  description?: string
  amount: number
  billingCycle: BillingCycle
  provider?: string
  website?: string
  icon?: string
  startDate: string
  nextBillingDate: string
  reminderDaysBefore: number
  status: SubscriptionStatus
}

export interface SubscriptionFormModel {
  name: string
  description?: string
  amount: number
  billingCycle: BillingCycle
  provider?: string
  website?: string
  icon?: string
  startDate: string
  reminderDaysBefore: number
}

export interface SubscriptionStatsModel {
  total: number
  active: number
  monthlyCost: number
  yearlyCost: number
}
