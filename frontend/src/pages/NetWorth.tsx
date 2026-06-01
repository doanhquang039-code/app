import {
  Landmark, TrendingUp, TrendingDown, Home, Car,
  Briefcase, DollarSign, CreditCard, Banknote, Plus, RefreshCw,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts'

const ASSETS = [
  { name: 'Tài khoản ngân hàng', value: 85000000, icon: <Landmark className="w-5 h-5" />, color: '#6366f1', bubble: 'icon-bubble-primary' },
  { name: 'Cổ phiếu & Quỹ', value: 131000000, icon: <TrendingUp className="w-5 h-5" />, color: '#10b981', bubble: 'icon-bubble-success' },
  { name: 'Bất động sản', value: 500000000, icon: <Home className="w-5 h-5" />, color: '#f59e0b', bubble: 'icon-bubble-warning' },
  { name: 'Xe cộ', value: 300000000, icon: <Car className="w-5 h-5" />, color: '#38bdf8', bubble: 'icon-bubble-info' },
  { name: 'Tiền điện tử', value: 27500000, icon: <DollarSign className="w-5 h-5" />, color: '#8b5cf6', bubble: 'icon-bubble-primary' },
  { name: 'Tiền mặt', value: 15000000, icon: <Banknote className="w-5 h-5" />, color: '#34d399', bubble: 'icon-bubble-success' },
]

const LIABILITIES = [
  { name: 'Vay mua nhà', value: 200000000, icon: <Home className="w-5 h-5" />, bubble: 'icon-bubble-danger' },
  { name: 'Vay mua xe', value: 50000000, icon: <Car className="w-5 h-5" />, bubble: 'icon-bubble-danger' },
  { name: 'Thẻ tín dụng', value: 8500000, icon: <CreditCard className="w-5 h-5" />, bubble: 'icon-bubble-warning' },
  { name: 'Vay cá nhân', value: 15000000, icon: <Briefcase className="w-5 h-5" />, bubble: 'icon-bubble-warning' },
]

const NET_WORTH_TREND = [
  { month: 'T1', assets: 900000000, liabilities: 285000000, net: 615000000 },
  { month: 'T2', assets: 920000000, liabilities: 280000000, net: 640000000 },
  { month: 'T3', assets: 935000000, liabilities: 278000000, net: 657000000 },
  { month: 'T4', assets: 945000000, liabilities: 275000000, net: 670000000 },
  { month: 'T5', assets: 980000000, liabilities: 273500000, net: 706500000 },
  { month: 'T6', assets: 1058500000, liabilities: 273500000, net: 785000000 },
]

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} triệu`
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl p-3 text-sm space-y-1">
        <p className="text-muted mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function NetWorth() {
  const totalAssets      = ASSETS.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = LIABILITIES.reduce((s, l) => s + l.value, 0)
  const netWorth         = totalAssets - totalLiabilities
  const debtRatio        = ((totalLiabilities / totalAssets) * 100).toFixed(1)

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Landmark className="w-7 h-7 text-indigo-400" />
            Tài sản ròng
          </h1>
          <p className="text-muted mt-1">Tổng quan tài sản và nợ của bạn</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Cập nhật
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm tài sản
          </button>
        </div>
      </div>

      {/* Net Worth Hero */}
      <div
        className="card text-center py-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: 'radial-gradient(ellipse at center, #6366f1, transparent 70%)' }}
        />
        <p className="text-muted text-sm font-medium uppercase tracking-wider mb-2">Tài sản ròng</p>
        <p className="text-5xl font-black text-white mb-3">{fmt(netWorth)}</p>
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-semibold text-sm">+12.4% so với tháng trước</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="stat-card stat-card-success">
          <p className="text-muted text-sm font-medium mb-2">Tổng tài sản</p>
          <p className="text-2xl font-bold text-emerald-400">{fmt(totalAssets)}</p>
        </div>
        <div className="stat-card stat-card-danger">
          <p className="text-muted text-sm font-medium mb-2">Tổng nợ</p>
          <p className="text-2xl font-bold text-rose-400">{fmt(totalLiabilities)}</p>
        </div>
        <div className="stat-card stat-card-primary">
          <p className="text-muted text-sm font-medium mb-2">Tài sản ròng</p>
          <p className="text-2xl font-bold text-indigo-400">{fmt(netWorth)}</p>
        </div>
        <div className="stat-card stat-card-warning">
          <p className="text-muted text-sm font-medium mb-2">Tỷ lệ nợ</p>
          <p className="text-2xl font-bold text-amber-400">{debtRatio}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Net Worth Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Xu hướng tài sản ròng</h3>
            <span className="badge badge-primary">6T qua</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={NET_WORTH_TREND}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                     tickFormatter={v => (v / 1_000_000_000).toFixed(1) + 'tỷ'} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2.5}
                    fill="url(#netGrad)" dot={false} name="Tài sản ròng" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Assets vs Liabilities Bar */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Tài sản vs Nợ</h3>
            <span className="badge badge-success">Hàng tháng</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={NET_WORTH_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                     tickFormatter={v => (v / 1_000_000_000).toFixed(1) + 'tỷ'} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
              <Bar dataKey="assets"      fill="#10b981" radius={[4,4,0,0]} name="Tài sản" />
              <Bar dataKey="liabilities" fill="#f43f5e" radius={[4,4,0,0]} name="Nợ" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assets & Liabilities Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Assets */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Tài sản
            </h3>
            <span className="badge badge-success">{fmt(totalAssets)}</span>
          </div>
          <div className="space-y-3">
            {ASSETS.map((asset, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`icon-bubble ${asset.bubble}`}>{asset.icon}</div>
                  <div>
                    <p className="font-medium text-white text-sm">{asset.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="h-1.5 rounded-full" style={{
                        width: `${Math.round((asset.value / totalAssets) * 60)}px`,
                        background: asset.color,
                        opacity: 0.7,
                      }} />
                      <span className="text-xs text-muted">
                        {((asset.value / totalAssets) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <p className="font-bold text-emerald-400 text-sm">{fmt(asset.value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              Nợ phải trả
            </h3>
            <span className="badge badge-danger">{fmt(totalLiabilities)}</span>
          </div>
          <div className="space-y-3">
            {LIABILITIES.map((liability, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`icon-bubble ${liability.bubble}`}>{liability.icon}</div>
                  <div>
                    <p className="font-medium text-white text-sm">{liability.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="h-1.5 rounded-full" style={{
                        width: `${Math.round((liability.value / totalLiabilities) * 60)}px`,
                        background: '#f43f5e',
                        opacity: 0.7,
                      }} />
                      <span className="text-xs text-muted">
                        {((liability.value / totalLiabilities) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <p className="font-bold text-rose-400 text-sm">{fmt(liability.value)}</p>
              </div>
            ))}
          </div>

          {/* Debt Ratio Bar */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted">Tỷ lệ nợ / Tài sản</span>
              <span className="font-bold text-amber-400">{debtRatio}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${debtRatio}%`,
                  background: Number(debtRatio) > 50
                    ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
                    : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
