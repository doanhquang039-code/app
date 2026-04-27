import { useQuery } from 'react-query'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  CreditCard,
  AlertCircle,
} from 'lucide-react'
import api from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Dashboard() {
  const { data: stats } = useQuery('dashboard-stats', async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  })

  const { data: recentTransactions } = useQuery('recent-transactions', async () => {
    const response = await api.get('/transactions?limit=5')
    return response.data
  })

  const { data: monthlyTrend } = useQuery('monthly-trend', async () => {
    const response = await api.get('/financial-insights/monthly-trend?months=6')
    return response.data
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const trendData = monthlyTrend
    ? Object.entries(monthlyTrend).map(([month, data]: [string, any]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.net,
      }))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan tài chính của bạn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Thu nhập tháng này</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {formatCurrency(stats?.monthlyIncome || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chi tiêu tháng này</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">
                {formatCurrency(stats?.monthlyExpense || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Số dư ví</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {formatCurrency(stats?.totalBalance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mục tiêu tiết kiệm</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">
                {stats?.savingsGoalsCount || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng 6 tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="income" fill="#22c55e" name="Thu nhập" />
              <Bar dataKey="expense" fill="#ef4444" name="Chi tiêu" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiêu theo danh mục</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.categoryBreakdown || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(stats?.categoryBreakdown || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Giao dịch gần đây</h3>
          <div className="space-y-3">
            {recentTransactions?.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'INCOME'
                        ? 'bg-success-100 text-success-600'
                        : 'bg-danger-100 text-danger-600'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cảnh báo</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-warning-50 rounded-lg border border-warning-200">
              <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5" />
              <div>
                <p className="font-medium text-warning-900">Ngân sách sắp vượt</p>
                <p className="text-sm text-warning-700 mt-1">
                  Bạn đã chi 85% ngân sách "Ăn uống" tháng này
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <CreditCard className="w-5 h-5 text-primary-600 mt-0.5" />
              <div>
                <p className="font-medium text-primary-900">Đăng ký sắp hết hạn</p>
                <p className="text-sm text-primary-700 mt-1">
                  Netflix Premium sẽ gia hạn vào 3 ngày nữa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
