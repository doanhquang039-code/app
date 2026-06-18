import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  LineChart as LineChartIcon,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../lib/api'

type Transaction = {
  id: number
  amount: number | string
  date: string
  type: string
  description?: string
  note?: string
  category?: { name?: string }
}

type Budget = {
  id: number
  name?: string
  amount: number | string
  spent?: number | string
  category?: { name?: string }
}

type Subscription = {
  id: number
  name?: string
  amount?: number | string
  cost?: number | string
  nextBillingDate?: string
  nextPaymentDate?: string
}

type CashFlowReport = {
  income: number
  expense: number
  net: number
  dailyBurn: number
  dailyIncome?: number
  projectedExpense: number
  projectedNet: number
  runwayDays: number
  savingsRate?: number
  expenseRatio?: number
  largestExpenseDay?: { date: string; amount: number; net: number } | null
  healthScore: number
  trend: Array<{ date: string; income: number; expense: number; net: number; cumulative: number }>
  forecast?: Array<{ date: string; balance: number; bills: number }>
  categoryData: Array<{ name: string; value: number }>
  budgetRisks: Array<{ id: number; name: string; amount: number; spent: number; percent: number }>
  upcomingBills: Array<{ id: number; name: string; amount: number; dueIn: number | null; date: Date | string | null }>
  topTransactions?: Array<{ id: number; amount: number; date: string | Date; category: string; description: string }>
  insights?: Array<{ type: 'success' | 'warning' | 'danger' | 'info'; title: string; description: string; action: string }>
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#38bdf8', '#8b5cf6']

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function normalizeAmount(value: number | string | undefined) {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? amount : 0
}

function isIncome(type: string) {
  return type?.toUpperCase() === 'INCOME'
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function daysBetween(from: Date, to: Date) {
  return Math.max(1, Math.ceil((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86400000))
}

function sameDay(left: Date, right: Date) {
  return startOfDay(left).getTime() === startOfDay(right).getTime()
}

function buildFallbackInsights(report: {
  projectedNet: number
  savingsRate: number
  expenseRatio: number
  runwayDays: number
  budgetRisks: CashFlowReport['budgetRisks']
  upcomingBills: CashFlowReport['upcomingBills']
  categoryData: CashFlowReport['categoryData']
}) {
  const insights: CashFlowReport['insights'] = []

  if (report.projectedNet < 0) {
    insights.push({
      type: 'danger',
      title: 'Projected cash gap',
      description: 'Cash flow is projected to be negative over the next 30 days.',
      action: 'Review flexible spending and delay non-essential purchases.',
    })
  } else if (report.savingsRate >= 20) {
    insights.push({
      type: 'success',
      title: 'Healthy savings rate',
      description: `Current savings rate is ${report.savingsRate}%.`,
      action: 'Move surplus cash into savings or investments.',
    })
  }

  if (report.expenseRatio >= 90) {
    insights.push({
      type: 'warning',
      title: 'High expense ratio',
      description: `Expenses are using ${report.expenseRatio}% of income.`,
      action: 'Set a weekly spend ceiling for the largest categories.',
    })
  }

  if (report.runwayDays < 14) {
    insights.push({
      type: 'danger',
      title: 'Low runway',
      description: `Available net cash covers about ${report.runwayDays} days of spending.`,
      action: 'Prioritize upcoming bills and pause optional subscriptions.',
    })
  }

  const riskiestBudget = report.budgetRisks[0]
  if (riskiestBudget) {
    insights.push({
      type: riskiestBudget.percent >= 100 ? 'danger' : 'warning',
      title: 'Budget pressure',
      description: `${riskiestBudget.name} has reached ${riskiestBudget.percent}% of its monthly budget.`,
      action: 'Move remaining purchases in this category to next month where possible.',
    })
  }

  const topCategory = report.categoryData[0]
  if (topCategory) {
    insights.push({
      type: 'info',
      title: 'Top spending category',
      description: `${topCategory.name} is the largest expense category in this period.`,
      action: 'Check large transactions before adding new spend.',
    })
  }

  return insights.length > 0
    ? insights.slice(0, 6)
    : [{
      type: 'success' as const,
      title: 'Cash flow is stable',
      description: 'No major cash flow risks were detected for this period.',
      action: 'Keep tracking transactions to preserve forecast accuracy.',
    }]
}

export default function CashFlow() {
  const [rangeDays, setRangeDays] = useState(30)

  const { data: serverReport } = useQuery<CashFlowReport | null>({
    queryKey: ['cash-flow-summary', rangeDays],
    queryFn: async () => {
      try {
        const response = await api.get(`/cash-flow/summary?days=${rangeDays}`)
        return response.data
      } catch {
        return null
      }
    }
  })

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['cash-flow-transactions', rangeDays],
    queryFn: async () => {
      const response = await api.get(`/transactions?limit=500&days=${rangeDays}`)
      return Array.isArray(response.data) ? response.data : response.data?.data || []
    }
  })

  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ['cash-flow-budgets'],
    queryFn: async () => {
      const response = await api.get('/budgets')
      return Array.isArray(response.data) ? response.data : response.data?.data || []
    }
  })

  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ['cash-flow-subscriptions'],
    queryFn: async () => {
      const response = await api.get('/subscriptions/upcoming')
      return Array.isArray(response.data) ? response.data : response.data?.data || []
    }
  })

  const clientReport = useMemo<CashFlowReport>(() => {
    const today = startOfDay(new Date())
    const rangeStart = new Date(today)
    rangeStart.setDate(today.getDate() - rangeDays + 1)

    const inRange = transactions.filter((transaction) => {
      const date = startOfDay(new Date(transaction.date))
      return date >= rangeStart && date <= today
    })

    const income = inRange
      .filter((transaction) => isIncome(transaction.type))
      .reduce((sum, transaction) => sum + normalizeAmount(transaction.amount), 0)

    const expense = inRange
      .filter((transaction) => !isIncome(transaction.type))
      .reduce((sum, transaction) => sum + normalizeAmount(transaction.amount), 0)

    const net = income - expense
    const dailyBurn = expense / rangeDays
    const dailyIncome = income / rangeDays
    const projectedExpense = dailyBurn * 30
    const projectedNet = dailyIncome * 30 - projectedExpense
    const runwayDays = dailyBurn > 0 ? Math.floor(Math.max(net, 0) / dailyBurn) : 999
    const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0
    const expenseRatio = income > 0 ? Math.round((expense / income) * 100) : 0

    const dailyMap = new Map<string, { date: string; income: number; expense: number; net: number }>()
    for (let index = rangeDays - 1; index >= 0; index -= 1) {
      const date = new Date(today)
      date.setDate(today.getDate() - index)
      const key = date.toISOString().slice(5, 10)
      dailyMap.set(key, { date: key, income: 0, expense: 0, net: 0 })
    }

    inRange.forEach((transaction) => {
      const key = new Date(transaction.date).toISOString().slice(5, 10)
      const row = dailyMap.get(key)
      if (!row) return

      const amount = normalizeAmount(transaction.amount)
      if (isIncome(transaction.type)) {
        row.income += amount
      } else {
        row.expense += amount
      }
      row.net = row.income - row.expense
    })

    let cumulative = 0
    const trend = Array.from(dailyMap.values()).map((row) => {
      cumulative += row.net
      return { ...row, cumulative }
    })

    const categoryMap = new Map<string, number>()
    inRange
      .filter((transaction) => !isIncome(transaction.type))
      .forEach((transaction) => {
        const category = transaction.category?.name || 'Uncategorized'
        categoryMap.set(category, (categoryMap.get(category) || 0) + normalizeAmount(transaction.amount))
      })

    const categoryData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    const budgetRisks = budgets
      .map((budget) => {
        const amount = normalizeAmount(budget.amount)
        const spent = normalizeAmount(budget.spent)
        const percent = amount > 0 ? Math.round((spent / amount) * 100) : 0
        return {
          id: budget.id,
          name: budget.category?.name || budget.name || 'Budget',
          amount,
          spent,
          percent,
        }
      })
      .filter((budget) => budget.percent >= 70)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5)

    const upcomingBills = subscriptions
      .map((subscription) => {
        const dateText = subscription.nextBillingDate || subscription.nextPaymentDate
        const date = dateText ? new Date(dateText) : null
        return {
          id: subscription.id,
          name: subscription.name || 'Subscription',
          amount: normalizeAmount(subscription.amount ?? subscription.cost),
          dueIn: date ? daysBetween(today, date) : null,
          date,
        }
      })
      .filter((bill) => bill.dueIn === null || bill.dueIn <= 30)
      .sort((a, b) => (a.dueIn ?? 99) - (b.dueIn ?? 99))
      .slice(0, 5)

    let projectedBalance = net
    const forecast = Array.from({ length: 30 }).map((_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() + index + 1)
      const bills = upcomingBills
        .filter((bill) => bill.date && sameDay(new Date(bill.date), date))
        .reduce((sum, bill) => sum + bill.amount, 0)
      projectedBalance += dailyIncome - dailyBurn - bills

      return {
        date: date.toISOString().slice(5, 10),
        balance: Math.round(projectedBalance),
        bills,
      }
    })

    const topTransactions = inRange
      .filter((transaction) => !isIncome(transaction.type))
      .map((transaction) => ({
        id: transaction.id,
        amount: normalizeAmount(transaction.amount),
        date: transaction.date,
        category: transaction.category?.name || 'Uncategorized',
        description: transaction.description || transaction.note || transaction.category?.name || 'Expense',
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    const largestDay = trend.reduce<(typeof trend)[number] | null>((current, row) => {
      if (!current || row.expense > current.expense) return row
      return current
    }, null)
    const largestExpenseDay = largestDay && largestDay.expense > 0
      ? { date: largestDay.date, amount: largestDay.expense, net: largestDay.net }
      : null

    const insightInput = {
      projectedNet,
      savingsRate,
      expenseRatio,
      runwayDays,
      budgetRisks,
      upcomingBills,
      categoryData,
    }

    return {
      income,
      expense,
      net,
      dailyBurn,
      dailyIncome,
      projectedExpense,
      projectedNet,
      runwayDays,
      savingsRate,
      expenseRatio,
      largestExpenseDay,
      healthScore: Math.max(
        0,
        Math.min(
          100,
          Math.round(
            55 +
              (net > 0 ? 15 : -20) +
              (runwayDays >= 30 ? 20 : runwayDays >= 14 ? 10 : -15) +
              (savingsRate >= 20 ? 15 : savingsRate >= 10 ? 8 : savingsRate < 0 ? -10 : 0) -
              Math.min(20, budgetRisks.length * 5)
          )
        )
      ),
      trend,
      forecast,
      categoryData,
      budgetRisks,
      upcomingBills,
      topTransactions,
      insights: buildFallbackInsights(insightInput),
    }
  }, [budgets, rangeDays, subscriptions, transactions])

  const report = serverReport || clientReport
  const healthScore = report.healthScore
  const savingsRate = report.savingsRate ?? 0
  const expenseRatio = report.expenseRatio ?? 0
  const forecast = report.forecast || []
  const insights = report.insights || []
  const topTransactions = report.topTransactions || []

  const insightStyles = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    danger: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  }

  const statCards = [
    {
      label: 'Income',
      value: formatCurrency(report.income),
      icon: ArrowUpRight,
      bubble: 'icon-bubble-success',
      tone: 'text-emerald-400',
    },
    {
      label: 'Expense',
      value: formatCurrency(report.expense),
      icon: ArrowDownRight,
      bubble: 'icon-bubble-danger',
      tone: 'text-rose-400',
    },
    {
      label: 'Net cash flow',
      value: formatCurrency(report.net),
      icon: Wallet,
      bubble: report.net >= 0 ? 'icon-bubble-success' : 'icon-bubble-danger',
      tone: report.net >= 0 ? 'text-emerald-400' : 'text-rose-400',
    },
    {
      label: 'Daily burn',
      value: formatCurrency(report.dailyBurn),
      icon: LineChartIcon,
      bubble: 'icon-bubble-warning',
      tone: 'text-amber-400',
    },
    {
      label: 'Savings rate',
      value: `${savingsRate}%`,
      icon: ShieldCheck,
      bubble: savingsRate >= 20 ? 'icon-bubble-success' : savingsRate >= 0 ? 'icon-bubble-warning' : 'icon-bubble-danger',
      tone: savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 0 ? 'text-amber-400' : 'text-rose-400',
    },
    {
      label: 'Expense ratio',
      value: `${expenseRatio}%`,
      icon: TrendingUp,
      bubble: expenseRatio <= 70 ? 'icon-bubble-success' : expenseRatio <= 90 ? 'icon-bubble-warning' : 'icon-bubble-danger',
      tone: expenseRatio <= 70 ? 'text-emerald-400' : expenseRatio <= 90 ? 'text-amber-400' : 'text-rose-400',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Cash Flow</h1>
          <p className="text-muted mt-1">Theo doi dong tien, toc do chi va rui ro ngan sach.</p>
        </div>
        <div className="flex gap-2">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => setRangeDays(days)}
              className={`btn ${rangeDays === days ? 'btn-primary' : 'btn-secondary'}`}
            >
              {days} ngay
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted text-sm font-medium">{card.label}</p>
              <div className={`icon-bubble ${card.bubble}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Daily cash movement</h3>
            <span className="badge badge-primary">{rangeDays}D</span>
          </div>
          {loadingTransactions ? (
            <div className="h-[320px] flex items-center justify-center text-muted">Dang tai du lieu...</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={report.trend}>
                <defs>
                  <linearGradient id="cashflow-income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cashflow-expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#cashflow-income)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" fill="url(#cashflow-expense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Health score</h3>
            <PiggyBank className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-center justify-center py-4">
            <div
              className="relative w-40 h-40 rounded-full flex items-center justify-center"
              style={{ background: `conic-gradient(#10b981 ${healthScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
            >
              <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center" style={{ background: 'var(--color-bg)' }}>
                <span className="text-4xl font-bold text-white">{healthScore}</span>
                <span className="text-muted text-xs">/ 100</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Projected 30D expense</span>
              <span className="font-semibold text-white">{formatCurrency(report.projectedExpense)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Projected 30D net</span>
              <span className={`font-semibold ${report.projectedNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(report.projectedNet)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Runway</span>
              <span className="font-semibold text-white">{report.runwayDays >= 999 ? 'No burn' : `${report.runwayDays} ngay`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Savings rate</span>
              <span className={savingsRate >= 20 ? 'font-semibold text-emerald-400' : 'font-semibold text-amber-400'}>
                {savingsRate}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Largest expense day</span>
              <span className="font-semibold text-white">
                {report.largestExpenseDay ? formatCurrency(report.largestExpenseDay.amount) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">30-day cash forecast</h3>
            <span className="badge badge-primary">Forecast</span>
          </div>
          {forecast.length === 0 ? (
            <p className="text-muted text-sm py-12 text-center">Chua du du lieu de du bao dong tien.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="cashflow-forecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cashflow-bills" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="balance" name="Projected balance" stroke="#38bdf8" fill="url(#cashflow-forecast)" strokeWidth={2} />
                <Area type="monotone" dataKey="bills" name="Scheduled bills" stroke="#f59e0b" fill="url(#cashflow-bills)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Smart insights</h3>
            <Sparkles className="w-5 h-5 text-sky-400" />
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={`${insight.title}-${index}`} className={`border rounded-lg p-3 ${insightStyles[insight.type]}`}>
                <p className="font-semibold text-sm">{insight.title}</p>
                <p className="text-xs text-white/80 mt-1">{insight.description}</p>
                <p className="text-xs text-white/60 mt-2">{insight.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card">
          <h3 className="font-semibold text-white mb-5">Top spending categories</h3>
          {report.categoryData.length === 0 ? (
            <p className="text-muted text-sm py-10 text-center">Chua co du lieu chi tieu.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={report.categoryData} innerRadius={62} outerRadius={92} paddingAngle={3} dataKey="value">
                  {report.categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-2">
            {report.categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                  {category.name}
                </span>
                <span className="font-semibold text-white">{formatCurrency(category.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Budget risks</h3>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-4">
            {report.budgetRisks.length === 0 ? (
              <div className="alert alert-success">
                <PiggyBank className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">No risky budgets</p>
                  <p className="text-xs opacity-80 mt-0.5">Cac ngan sach dang trong vung an toan.</p>
                </div>
              </div>
            ) : report.budgetRisks.map((budget) => (
              <div key={budget.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-white">{budget.name}</span>
                  <span className={budget.percent >= 100 ? 'text-rose-400' : 'text-amber-400'}>{budget.percent}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, budget.percent)}%`,
                      background: budget.percent >= 100 ? 'var(--gradient-danger)' : 'var(--gradient-warning)',
                    }}
                  />
                </div>
                <p className="text-muted text-xs mt-1">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Upcoming bills</h3>
            <CalendarClock className="w-5 h-5 text-sky-400" />
          </div>
          <div className="space-y-3">
            {report.upcomingBills.length === 0 ? (
              <p className="text-muted text-sm py-10 text-center">Khong co khoan thanh toan trong 30 ngay toi.</p>
            ) : report.upcomingBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div>
                  <p className="font-medium text-white text-sm">{bill.name}</p>
                  <p className="text-muted text-xs">
                    {bill.date ? new Date(bill.date).toLocaleDateString('vi-VN') : 'Chua co ngay'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white text-sm">{formatCurrency(bill.amount)}</p>
                  <p className="text-sky-400 text-xs">{bill.dueIn === null ? 'TBD' : `${bill.dueIn} ngay`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">Largest expenses</h3>
          <ReceiptText className="w-5 h-5 text-rose-400" />
        </div>
        {topTransactions.length === 0 ? (
          <p className="text-muted text-sm py-8 text-center">Chua co giao dich chi tieu trong khoang thoi gian nay.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            {topTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-lg border border-white/10 p-3 bg-white/[0.03]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm truncate">{transaction.description}</p>
                    <p className="text-muted text-xs mt-1 truncate">{transaction.category}</p>
                  </div>
                  <span className="text-rose-400 font-semibold text-sm whitespace-nowrap">
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
                <p className="text-muted text-xs mt-3">{new Date(transaction.date).toLocaleDateString('vi-VN')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
