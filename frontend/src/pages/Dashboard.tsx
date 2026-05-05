import { useQuery } from 'react-query'
import {
  TrendingUp, TrendingDown, Wallet, Target, CreditCard, AlertCircle,
  ArrowUpRight, ArrowDownRight, Sparkles, Activity,
} from 'lucide-react'
import api from '../lib/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#38bdf8']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-sm">
        <p className="text-muted mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {formatCurrencyStatic(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function formatCurrencyStatic(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function Dashboard() {
  const { data: stats } = useQuery('dashboard-stats', async () => {
    const res = await api.get('/dashboard/stats')
    return res.data
  })

  const { data: recentTransactions } = useQuery('recent-transactions', async () => {
    const res = await api.get('/transactions?limit=5')
    return res.data
  })

  const { data: monthlyTrend } = useQuery('monthly-trend', async () => {
    const res = await api.get('/financial-insights/monthly-trend?months=6')
    return res.data
  })

  const formatCurrency = (amount: number) => formatCurrencyStatic(amount)

  const trendData = monthlyTrend
    ? Object.entries(monthlyTrend).map(([month, data]: [string, any]) => ({
        month,
        'Thu nhập': data.income,
        'Chi tiêu':  data.expense,
        net: data.net,
      }))
    : []

  const statCards = [
    {
      label: 'Thu nhập tháng này',
      value: stats?.monthlyIncome || 0,
      icon: <TrendingUp className="w-5 h-5" />,
      cls: 'stat-card-success',
      iconCls: 'icon-bubble-success',
      textCls: 'text-emerald-400',
      change: '+12.5%',
      up: true,
    },
    {
      label: 'Chi tiêu tháng này',
      value: stats?.monthlyExpense || 0,
      icon: <TrendingDown className="w-5 h-5" />,
      cls: 'stat-card-danger',
      iconCls: 'icon-bubble-danger',
      textCls: 'text-rose-400',
      change: '+3.2%',
      up: false,
    },
    {
      label: 'Số dư ví',
      value: stats?.totalBalance || 0,
      icon: <Wallet className="w-5 h-5" />,
      cls: 'stat-card-primary',
      iconCls: 'icon-bubble-primary',
      textCls: 'text-indigo-400',
      change: '+8.1%',
      up: true,
    },
    {
      label: 'Mục tiêu tiết kiệm',
      value: stats?.savingsGoalsCount || 0,
      icon: <Target className="w-5 h-5" />,
      cls: 'stat-card-warning',
      iconCls: 'icon-bubble-warning',
      textCls: 'text-amber-400',
      isCounting: true,
      change: '+2',
      up: true,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-400" />
            Dashboard
          </h1>
          <p className="text-muted mt-1">Tổng quan tài chính của bạn hôm nay</p>
        </div>
        <div className="badge badge-primary flex items-center gap-1.5">
          <Activity className="w-3 h-3" />
          Live
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((s, i) => (
          <div key={i} className={`stat-card ${s.cls}`} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted text-sm font-medium">{s.label}</p>
              <div className={`icon-bubble ${s.iconCls}`}>{s.icon}</div>
            </div>
            <p className={`text-2xl font-bold ${s.textCls}`}>
              {s.isCounting ? s.value : formatCurrency(s.value)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {s.up
                ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                : <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />}
              <span className={`text-xs font-semibold ${s.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {s.change}
              </span>
              <span className="text-muted text-xs">so với tháng trước</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Area Chart - chiếm 2 cột */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Xu hướng 6 tháng</h3>
            <span className="badge badge-primary">6T qua</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                     tickFormatter={v => (v / 1000000).toFixed(0) + 'M'} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="Thu nhập" stroke="#10b981" strokeWidth={2.5} fill="url(#income)" dot={false} />
              <Area type="monotone" dataKey="Chi tiêu"  stroke="#f43f5e" strokeWidth={2.5} fill="url(#expense)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Chi tiêu theo danh mục</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats?.categoryBreakdown || []}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {(stats?.categoryBreakdown || []).map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Giao dịch gần đây</h3>
            <a href="/transactions" className="text-indigo-400 text-sm hover:text-indigo-300 font-medium transition-colors">
              Xem tất cả →
            </a>
          </div>
          <div className="space-y-2">
            {(recentTransactions || []).length === 0 && (
              <p className="text-muted text-sm text-center py-6">Chưa có giao dịch nào</p>
            )}
            {(recentTransactions || []).map((t: any) => (
              <div key={t.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`icon-bubble ${t.type === 'INCOME' ? 'icon-bubble-success' : 'icon-bubble-danger'}`}>
                    {t.type === 'INCOME'
                      ? <TrendingUp className="w-4 h-4" />
                      : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{t.description}</p>
                    <p className="text-muted text-xs">{t.category?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <p className="text-muted text-xs">{new Date(t.date).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Cảnh báo & Thông báo</h3>
          <div className="space-y-3">
            <div className="alert alert-warning">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Ngân sách sắp vượt</p>
                <p className="text-xs opacity-80 mt-0.5">Bạn đã chi 85% ngân sách "Ăn uống" tháng này</p>
              </div>
            </div>
            <div className="alert alert-info">
              <CreditCard className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Đăng ký sắp gia hạn</p>
                <p className="text-xs opacity-80 mt-0.5">Netflix Premium sẽ gia hạn vào 3 ngày nữa</p>
              </div>
            </div>
            <div className="alert alert-success">
              <Target className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Đạt mục tiêu tiết kiệm!</p>
                <p className="text-xs opacity-80 mt-0.5">Mục tiêu "Mua laptop" đã đạt 100% — Chúc mừng!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
