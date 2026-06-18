import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Download } from 'lucide-react'
import api from '../lib/api'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function Analytics() {
  const [dateRange, setDateRange] = useState('6months')

  const { data: monthlyTrend } = useQuery({
    queryKey: ['monthly-trend', dateRange],
    queryFn: async () => {
      const months = dateRange === '3months' ? 3 : dateRange === '6months' ? 6 : 12
      const response = await api.get(`/financial-insights/monthly-trend?months=${months}`)
      return response.data
    }
  })

  const { data: categoryBreakdown } = useQuery({
    queryKey: ['category-breakdown'],
    queryFn: async () => {
      const response = await api.get('/financial-insights/spending-by-category')
      return response.data
    }
  })

  const { data: summary } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const response = await api.get('/financial-insights/summary')
      return response.data
    }
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await api.get('/financial-insights/recommendations')
      return response.data
    }
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
        'Thu nhập': data.income,
        'Chi tiêu': data.expense,
        'Tiết kiệm': data.net,
      }))
    : []

  const categoryData = categoryBreakdown?.byCategory?.map((cat: any) => ({
    name: cat.category,
    value: cat.amount,
    percentage: cat.percentage,
  })) || []

  const savingsRate = summary?.lastMonth?.savingsRate || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phân tích</h1>
          <p className="text-gray-600 mt-1">Báo cáo chi tiết về tài chính</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input"
          >
            <option value="3months">3 tháng</option>
            <option value="6months">6 tháng</option>
            <option value="12months">12 tháng</option>
          </select>
          <button className="btn btn-primary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success-600" />
            </div>
            <p className="text-sm text-gray-600">Tổng thu nhập</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary?.allTime?.totalIncome || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Tất cả thời gian</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-danger-600" />
            </div>
            <p className="text-sm text-gray-600">Tổng chi tiêu</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary?.allTime?.totalExpense || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Tất cả thời gian</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-sm text-gray-600">Tiết kiệm ròng</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary?.allTime?.net || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Tất cả thời gian</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-warning-600" />
            </div>
            <p className="text-sm text-gray-600">Tỷ lệ tiết kiệm</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{savingsRate}%</p>
          <p className="text-sm text-gray-500 mt-1">Tháng trước</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Xu hướng thu chi ({dateRange === '3months' ? '3' : dateRange === '6months' ? '6' : '12'} tháng)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="Thu nhập" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="Chi tiêu" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="Tiết kiệm" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiêu theo danh mục</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Comparison */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">So sánh theo tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Thu nhập" fill="#22c55e" />
              <Bar dataKey="Chi tiêu" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết danh mục</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {categoryData.map((cat: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-900">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(cat.value)}</p>
                  <p className="text-sm text-gray-500">{cat.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.recommendations?.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Đề xuất từ AI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.recommendations.map((rec: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  rec.type === 'warning'
                    ? 'border-warning-200 bg-warning-50'
                    : rec.type === 'success'
                    ? 'border-success-200 bg-success-50'
                    : 'border-primary-200 bg-primary-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      rec.type === 'warning'
                        ? 'bg-warning-100'
                        : rec.type === 'success'
                        ? 'bg-success-100'
                        : 'bg-primary-100'
                    }`}
                  >
                    {rec.type === 'warning' ? '⚠️' : rec.type === 'success' ? '✅' : '💡'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-700">{rec.description}</p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                        rec.priority === 'high'
                          ? 'bg-danger-100 text-danger-800'
                          : rec.priority === 'medium'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-primary-100 text-primary-800'
                      }`}
                    >
                      {rec.priority === 'high' ? 'Ưu tiên cao' : rec.priority === 'medium' ? 'Ưu tiên trung bình' : 'Ưu tiên thấp'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Month Summary */}
      {summary?.lastMonth && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt tháng trước</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tháng</p>
              <p className="text-lg font-semibold text-gray-900">{summary.lastMonth.month}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Thu nhập</p>
              <p className="text-lg font-semibold text-success-600">
                {formatCurrency(summary.lastMonth.income)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Chi tiêu</p>
              <p className="text-lg font-semibold text-danger-600">
                {formatCurrency(summary.lastMonth.expense)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tiết kiệm</p>
              <p className="text-lg font-semibold text-primary-600">
                {formatCurrency(summary.lastMonth.net)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
