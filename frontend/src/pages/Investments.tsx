import { useState } from 'react'
import {
  TrendingUp, TrendingDown, Plus, BarChart3, Leaf,
  DollarSign, Bitcoin, Building2, Landmark, Edit, Trash2, Globe,
  Zap, Droplets, Wind, Sun, ShieldCheck, ChevronRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0d9488']

const INVESTMENTS = [
  { id: 1, name: 'VNM',           type: 'STOCK',        value: 15_000_000, cost: 12_000_000, change: 25.0,   icon: '📈', green: false },
  { id: 2, name: 'FPT',           type: 'STOCK',        value: 8_500_000,  cost: 7_000_000,  change: 21.4,   icon: '💻', green: false },
  { id: 3, name: 'Bitcoin',       type: 'CRYPTO',       value: 22_000_000, cost: 18_000_000, change: 22.2,   icon: '₿',  green: false },
  { id: 4, name: 'Ethereum',      type: 'CRYPTO',       value: 5_500_000,  cost: 6_000_000,  change: -8.3,   icon: '⟠',  green: false },
  { id: 5, name: 'VinHomes REIT', type: 'REAL_ESTATE',  value: 50_000_000, cost: 45_000_000, change: 11.1,   icon: '🏢', green: false },
  { id: 6, name: 'Tiết kiệm 12T', type: 'SAVINGS',      value: 30_000_000, cost: 30_000_000, change: 6.5,    icon: '🏦', green: false },
  // Green investments
  { id: 7, name: 'VEIL Solar ETF',   type: 'GREEN',     value: 25_000_000, cost: 20_000_000, change: 18.5,   icon: '☀️', green: true  },
  { id: 8, name: 'Wind Energy Bond', type: 'GREEN',     value: 10_000_000, cost: 10_000_000, change: 7.2,    icon: '💨', green: true  },
  { id: 9, name: 'ESG VN30 Fund',    type: 'GREEN',     value: 15_000_000, cost: 12_500_000, change: 20.0,   icon: '🌿', green: true  },
]

const TREND = [
  { month: 'T1', value: 140_000_000, green: 35_000_000 },
  { month: 'T2', value: 148_000_000, green: 38_000_000 },
  { month: 'T3', value: 145_000_000, green: 40_000_000 },
  { month: 'T4', value: 155_000_000, green: 44_000_000 },
  { month: 'T5', value: 162_000_000, green: 48_000_000 },
  { month: 'T6', value: 181_000_000, green: 50_000_000 },
]

const TYPE_LABELS: Record<string,string> = {
  STOCK: 'Cổ phiếu', CRYPTO: 'Tiền số', REAL_ESTATE: 'Bất động sản',
  SAVINGS: 'Tiết kiệm', GREEN: '🌿 Xanh', FUND: 'Quỹ',
}

const GREEN_PROJECTS = [
  { name: 'VEIL Solar ETF',    icon: <Sun className="w-5 h-5" />,      roi: '18.5%', impact: '12.4 tấn CO₂', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { name: 'Wind Energy Bond',  icon: <Wind className="w-5 h-5" />,     roi: '7.2%',  impact: '8.1 tấn CO₂',  color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  { name: 'ESG VN30 Fund',     icon: <Leaf className="w-5 h-5" />,     roi: '20.0%', impact: '15.6 tấn CO₂', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { name: 'Clean Water Bond',  icon: <Droplets className="w-5 h-5" />, roi: '6.8%',  impact: '5.2 tấn CO₂',  color: '#2dd4bf', bg: 'rgba(13,148,136,0.12)' },
]

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div className="glass rounded-2xl p-3 text-sm shadow-2xl">
      <p className="text-muted mb-1 text-xs">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold text-sm">{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  )
  return null
}

export default function Investments() {
  const [filterType, setFilterType] = useState('ALL')
  const [activeTab, setActiveTab] = useState<'portfolio' | 'green'>('portfolio')

  const totalValue  = INVESTMENTS.reduce((s, i) => s + i.value, 0)
  const totalCost   = INVESTMENTS.reduce((s, i) => s + i.cost,  0)
  const totalProfit = totalValue - totalCost
  const totalReturn = ((totalProfit / totalCost) * 100).toFixed(1)
  const greenValue  = INVESTMENTS.filter(i => i.green).reduce((s, i) => s + i.value, 0)
  const greenPct    = ((greenValue / totalValue) * 100).toFixed(0)

  const byType = Object.entries(
    INVESTMENTS.reduce((acc: Record<string,number>, inv) => {
      acc[inv.type] = (acc[inv.type] || 0) + inv.value; return acc
    }, {})
  ).map(([name, value]) => ({ name: TYPE_LABELS[name] || name, value }))

  const filtered = filterType === 'ALL' ? INVESTMENTS : INVESTMENTS.filter(i => i.type === filterType)

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-blue-400" />
            Danh mục đầu tư
          </h1>
          <p className="text-muted mt-1">Quản lý và theo dõi tài sản đầu tư</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm đầu tư
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Tổng danh mục', value: fmt(totalValue),   cls: 'stat-card-primary', textCls: 'text-blue-400',    icon: <BarChart3 className="w-5 h-5" />, bubble: 'icon-bubble-primary' },
          { label: 'Vốn đầu tư',    value: fmt(totalCost),    cls: 'stat-card-warning', textCls: 'text-amber-400',   icon: <DollarSign className="w-5 h-5" />, bubble: 'icon-bubble-warning' },
          { label: 'Lợi nhuận',     value: fmt(totalProfit),  cls: 'stat-card-success', textCls: 'text-emerald-400', icon: <TrendingUp className="w-5 h-5" />, bubble: 'icon-bubble-success' },
          { label: '🌿 Đầu tư xanh',value: `${greenPct}%`,   cls: 'stat-card-green',   textCls: 'text-emerald-400', icon: <Leaf className="w-5 h-5" />, bubble: 'icon-bubble-green' },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.cls}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-muted text-xs font-semibold">{s.label}</p>
              <div className={`icon-bubble ${s.bubble} w-9 h-9`} style={{ borderRadius: '10px' }}>{s.icon}</div>
            </div>
            <p className={`text-xl font-black ${s.textCls}`}>{s.value}</p>
            {i === 0 && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold">+{totalReturn}% tổng lợi nhuận</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {[
          { key: 'portfolio', label: '📊 Danh mục' },
          { key: 'green',     label: '🌿 Đầu tư Xanh' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === t.key
                ? 'bg-white/12 text-white shadow-lg'
                : 'text-muted hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'portfolio' && (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="card xl:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-white">Xu hướng danh mục</h3>
                  <p className="text-xs text-muted">Tổng + Đầu tư xanh</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={TREND}>
                  <defs>
                    <linearGradient id="tot" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="grn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                         tickFormatter={v => (v/1_000_000).toFixed(0)+'M'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} fill="url(#tot)" dot={false} name="Tổng danh mục" />
                  <Area type="monotone" dataKey="green" stroke="#10b981" strokeWidth={2.5} fill="url(#grn)" dot={false} name="Đầu tư xanh" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-semibold text-white mb-4">Phân bổ tài sản</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byType} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: '10px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment List */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Tất cả tài sản</h3>
              <div className="flex gap-1.5 flex-wrap">
                {['ALL','STOCK','CRYPTO','REAL_ESTATE','SAVINGS','GREEN'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`btn text-xs py-1 px-3 ${filterType === t ? (t === 'GREEN' ? 'btn-green' : 'btn-primary') : 'btn-secondary'}`}
                  >
                    {t === 'ALL' ? 'Tất cả' : TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filtered.map(inv => {
                const profit = inv.value - inv.cost
                const isUp = inv.change >= 0
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all"
                    style={{ border: `1px solid ${inv.green ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)'}`, background: inv.green ? 'rgba(16,185,129,0.04)' : undefined }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: inv.green ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.12)' }}
                      >
                        {inv.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{inv.name}</p>
                          <span className={`badge ${inv.green ? 'badge-green' : 'badge-primary'}`}>
                            {TYPE_LABELS[inv.type]}
                          </span>
                          {inv.green && <Leaf className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <p className="text-sm text-muted">Vốn: {fmt(inv.cost)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 text-right">
                      <div>
                        <p className="font-black text-white">{fmt(inv.value)}</p>
                        <p className={`text-sm font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? '+' : ''}{fmt(profit)}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${isUp ? 'bg-emerald-500/12' : 'bg-rose-500/12'}`}>
                        {isUp ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                        <span className={`text-sm font-black ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? '+' : ''}{inv.change}%
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost p-2"><Edit className="w-4 h-4 text-blue-400" /></button>
                        <button className="btn btn-ghost p-2"><Trash2 className="w-4 h-4 text-rose-400" /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'green' && (
        <div className="space-y-5">
          {/* Green Header */}
          <div
            className="card text-center py-8"
            style={{ background: 'linear-gradient(135deg, rgba(5,46,22,0.7), rgba(6,78,59,0.5))', borderColor: 'rgba(16,185,129,0.25)' }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                 style={{ background: 'rgba(16,185,129,0.2)' }}>
              <Globe className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Đầu tư Xanh & Bền vững</h2>
            <p className="text-muted max-w-md mx-auto text-sm">
              Sinh lời tốt, đồng thời góp phần bảo vệ môi trường. Mỗi đồng đầu tư xanh là một hành động cho tương lai.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">{fmt(greenValue)}</p>
                <p className="text-xs text-muted">Tổng đầu tư xanh</p>
              </div>
              <div className="w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">36.1 T</p>
                <p className="text-xs text-muted">CO₂ tiết kiệm</p>
              </div>
              <div className="w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">{greenPct}%</p>
                <p className="text-xs text-muted">Tỷ lệ danh mục xanh</p>
              </div>
            </div>
          </div>

          {/* Green Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GREEN_PROJECTS.map((proj, i) => (
              <div
                key={i}
                className="card cursor-pointer group"
                style={{ borderColor: `${proj.color}25`, background: `${proj.bg}` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${proj.color}20`, color: proj.color }}
                  >
                    {proj.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white">{proj.name}</h3>
                      <span className="badge badge-green">{proj.roi} ROI</span>
                    </div>
                    <p className="text-sm text-muted mb-3">Tác động: <span className="font-semibold" style={{ color: proj.color }}>−{proj.impact}</span></p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-300">ESG Certified</span>
                      </div>
                      <button className="text-xs flex items-center gap-1 font-semibold transition-colors group-hover:text-white" style={{ color: proj.color }}>
                        Đầu tư ngay <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
