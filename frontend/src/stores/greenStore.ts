import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavingsPlan {
  id: string
  amount: number
  term: number // months
  rate: number // annual interest rate
  startDate: string
  autoRenew: boolean
  projectName: string // e.g., "Dự án Trồng Rừng ngập mặn Cần Giờ"
  status: 'ACTIVE' | 'COMPLETED'
}

export interface RideRecord {
  id: string
  pickup: string
  destination: string
  vehicleType: 'BIKE' | 'TAXI' | 'LUXURY'
  vehicleName: string
  distance: number
  fare: number
  co2Saved: number
  pointsEarned: number
  date: string
  status: 'COMPLETED'
}

export interface GreenTransaction {
  id: number | string
  desc: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  cat: string
  icon: string
  date: string
  green: boolean
  note?: string
}

interface GreenState {
  blueCardBalance: number
  greenCardBalance: number
  premiumCardBalance: number
  greenPoints: number
  co2Saved: number
  savingsPlans: SavingsPlan[]
  ridesHistory: RideRecord[]
  customTransactions: GreenTransaction[]
  
  // Actions
  deductBalance: (cardType: 'blue' | 'green' | 'premium', amount: number) => boolean
  addBalance: (cardType: 'blue' | 'green' | 'premium', amount: number) => void
  addGreenPoints: (points: number) => void
  addCo2Saved: (amount: number) => void
  addSavingsPlan: (plan: Omit<SavingsPlan, 'id' | 'startDate' | 'status'>) => void
  addRideRecord: (ride: Omit<RideRecord, 'id' | 'date' | 'status'>) => void
  addCustomTransaction: (tx: Omit<GreenTransaction, 'id' | 'date'>) => void
  resetStore: () => void
}

export const useGreenStore = create<GreenState>()(
  persist(
    (set, get) => ({
      blueCardBalance: 85000000,
      greenCardBalance: 30000000,
      premiumCardBalance: 131000000,
      greenPoints: 780,
      co2Saved: 12.4,
      savingsPlans: [
        {
          id: 'sp-1',
          amount: 10000000,
          term: 6,
          rate: 6.8,
          startDate: '2026-03-15',
          autoRenew: true,
          projectName: 'Rừng phòng hộ ngập mặn Cần Giờ',
          status: 'ACTIVE',
        },
        {
          id: 'sp-2',
          amount: 5000000,
          term: 3,
          rate: 5.5,
          startDate: '2026-05-10',
          autoRenew: false,
          projectName: 'Điện Mặt Trời mái nhà cộng đồng',
          status: 'ACTIVE',
        },
      ],
      ridesHistory: [
        {
          id: 'r-1',
          pickup: 'Hồ Hoàn Kiếm',
          destination: 'Sân bay Nội Bài',
          vehicleType: 'TAXI',
          vehicleName: 'VinFast VF e34',
          distance: 28,
          fare: 350000,
          co2Saved: 3.36,
          pointsEarned: 35,
          date: '2026-05-28T14:30:00Z',
          status: 'COMPLETED',
        },
        {
          id: 'r-2',
          pickup: 'Lăng Bác',
          destination: 'Nhà hát Lớn',
          vehicleType: 'BIKE',
          vehicleName: 'VinFast Feliz S',
          distance: 4.5,
          fare: 370000,
          co2Saved: 0.54,
          pointsEarned: 15,
          date: '2026-05-30T09:15:00Z',
          status: 'COMPLETED',
        },
      ],
      customTransactions: [],

      deductBalance: (cardType, amount) => {
        const currentBalance = get()[`${cardType}CardBalance`]
        if (currentBalance < amount) return false
        
        set((state) => ({
          ...state,
          [`${cardType}CardBalance`]: state[`${cardType}CardBalance`] - amount,
        }))
        return true
      },

      addBalance: (cardType, amount) => {
        set((state) => ({
          ...state,
          [`${cardType}CardBalance`]: state[`${cardType}CardBalance`] + amount,
        }))
      },

      addGreenPoints: (points) => {
        set((state) => ({ greenPoints: state.greenPoints + points }))
      },

      addCo2Saved: (amount) => {
        set((state) => ({ co2Saved: parseFloat((state.co2Saved + amount).toFixed(2)) }))
      },

      addSavingsPlan: (planData) => {
        const newPlan: SavingsPlan = {
          ...planData,
          id: `sp-${Date.now()}`,
          startDate: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
        }
        
        set((state) => ({
          savingsPlans: [newPlan, ...state.savingsPlans],
        }))

        // Deduct from green card
        get().deductBalance('green', planData.amount)

        // Add transaction
        get().addCustomTransaction({
          desc: `Gửi TK Xanh: ${planData.projectName}`,
          type: 'EXPENSE',
          amount: planData.amount,
          cat: 'Đầu tư',
          icon: '🌿',
          green: true,
          note: `Kỳ hạn ${planData.term} tháng, lãi suất ${planData.rate}%/năm`,
        })

        // Give points as reward
        get().addGreenPoints(Math.floor(planData.amount / 100000))
      },

      addRideRecord: (rideData) => {
        const newRide: RideRecord = {
          ...rideData,
          id: `r-${Date.now()}`,
          date: new Date().toISOString(),
          status: 'COMPLETED',
        }

        set((state) => ({
          ridesHistory: [newRide, ...state.ridesHistory],
        }))

        // Deduct fare from green card (or blue if green card balance is insufficient)
        const greenBalance = get().greenCardBalance
        const cardUsed = greenBalance >= rideData.fare ? 'green' : 'blue'
        get().deductBalance(cardUsed, rideData.fare)

        // Update green metrics
        get().addGreenPoints(rideData.pointsEarned)
        get().addCo2Saved(rideData.co2Saved)

        // Create transaction
        get().addCustomTransaction({
          desc: `Xanh SM: ${rideData.pickup} ➔ ${rideData.destination}`,
          type: 'EXPENSE',
          amount: rideData.fare,
          cat: 'Di chuyển',
          icon: rideData.vehicleType === 'BIKE' ? '🛵' : '🚙',
          green: true,
          note: `${rideData.vehicleName} · ${rideData.distance} km · giảm ${rideData.co2Saved}kg CO₂`,
        })
      },

      addCustomTransaction: (txData) => {
        const newTx: GreenTransaction = {
          ...txData,
          id: `ctx-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
        }

        set((state) => ({
          customTransactions: [newTx, ...state.customTransactions],
        }))
      },

      resetStore: () => {
        set({
          blueCardBalance: 85000000,
          greenCardBalance: 30000000,
          premiumCardBalance: 131000000,
          greenPoints: 780,
          co2Saved: 12.4,
          savingsPlans: [
            {
              id: 'sp-1',
              amount: 10000000,
              term: 6,
              rate: 6.8,
              startDate: '2026-03-15',
              autoRenew: true,
              projectName: 'Rừng phòng hộ ngập mặn Cần Giờ',
              status: 'ACTIVE',
            },
          ],
          ridesHistory: [],
          customTransactions: [],
        })
      },
    }),
    {
      name: 'green-banking-storage',
    }
  )
)
