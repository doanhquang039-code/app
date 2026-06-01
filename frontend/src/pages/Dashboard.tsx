import { useState } from 'react'
import { useQuery } from 'react-query'
import {
  TrendingUp, TrendingDown, Wallet, Target, CreditCard, AlertCircle,
  ArrowUpRight, ArrowDownRight, Sparkles, Activity, Send, QrCode,
  Plus, ArrowLeftRight, Leaf, Zap, ChevronRight, Eye, EyeOff,
  BarChart3, ShieldCheck, Globe, RefreshCw, Bell,
} from 'lucide-react'
import api from '../lib/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useGreenStore } from '../stores/greenStore'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#38bdf8', '#0d9488']

/* ---- Mock data ---- */
const MOCK_TREND = [
  { month: 'T1', 'Thu nhập': 15_000_000, 'Chi tiêu': 9_200_000 },
  { month: 'T2', 'Thu nhập': 15_000_000, 'Chi tiêu': 8_800_000 },
  { month: 'T3', 'Thu nhập': 16_500_000, 'Chi tiêu': 10_100_000 },
  { month: 'T4', 'Thu nhập': 15_000_000, 'Chi tiêu': 9_600_000 },
  { month: 'T5', 'Thu nhập': 18_000_000, 'Chi tiêu': 8_400_000 },
  { month: 'T6', 'Thu nhập': 15_000_000, 'Chi tiêu': 7_800_000 },
]
const MOCK_CAT = [
  { name: 'Ăn uống',    value: 3_800_000 },
  { name: 'Di chuyển',  value: 1_200_000 },
  { name: 'Giải trí',   value: 900_000 },
  { name: 'Mua sắm',    value: 1_100_000 },
  { name: 'Sức khỏe',   value: 500_000 },
  { name: 'Khác',       value: 300_000 },
]
const MOCK_CONTACTS = [
  { name: 'Minh Tuấn', avatar: 'MT', color: '#2563eb' },
  { name: 'Lan Anh',   avatar: 'LA', color: '#10b981' },
  { name: 'Huy Đức',   avatar: 'HD', color: '#f59e0b' },
  { name: 'Thu Hà',    avatar: 'TH', color: '#8b5cf6' },
]
const MOCK_TRANSACTIONS = [
  { id: 1, desc: 'Shopee',         type: 'EXPENSE', amount: 450_000,    cat: 'Mua sắm',   icon: '🛒', date: '2026-06-01' },
  { id: 2, desc: 'Lương tháng 6',  type: 'INCOME',  amount: 15_000_000, cat: 'Thu nhập',  icon: '💼', date: '2026-06-01' },
  { id: 3, desc: 'Grab Food',      type: 'EXPENSE', amount: 85_000,     cat: 'Ăn uống',   icon: '🍔', date: '2026-05-31' },
  { id: 4, desc: 'Điện nước',      type: 'EXPENSE', amount: 350_000,    cat: 'Sinh hoạt', icon: '💡', date: '2026-05-30' },
  { id: 5, desc: 'Grab Bike',      type: 'EXPENSE', amount: 45_000,     cat: 'Di chuyển', icon: '🛵', date: '2026-05-30' },
]
const GREEN_TIPS = [
  { icon: '🌱', text: 'Đi xe đạp giúp giảm 2.3kg CO₂ hôm nay', impact: '-2.3kg' },
  { icon: '♻️', text: 'Mua đồ cũ tiết kiệm 40% carbon', impact: '−40%' },
  { icon: '🥗', text: 'Ăn chay 1 bữa = tiết kiệm 2.5kg CO₂', impact: '-2.5kg' },
]

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-2xl p-3.5 text-sm shadow-2xl">
        <p className="text-muted mb-2 text-xs">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold text-sm">
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

/* ==== Virtual Bank Card ==== */
function VirtualCard({ balance, hideBalance, onToggle, cardType }: {
  balance: number
  hideBalance: boolean
  onToggle: () => void
  cardType: 'blue' | 'green' | 'premium'
}) {
  const gradients = {
    blue:    'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
    green:   'linear-gradient(135deg, #052e16 0%, #064e3b 50%, #059669 100%)',
    premium: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #6d28d9 100%)',
  }
  const labels = { blue: 'Tài khoản chính', green: 'Tiết kiệm Xanh', premium: 'VIP Premium' }

  return (
    <div
      className="bank-card select-none"
      style={{ background: gradients[cardType], minHeight: '200px' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {labels[cardType]}
          </p>
          <p className="text-white font-bold text-sm mt-0.5">Expense Tracker Pro</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div className="relative">
            <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
            <div className="w-8 h-8 rounded-full absolute -right-3 top-0" style={{ background: 'rgba(255,255,255,0.25)' }} />
          </div>
        </div>
      </div>

      {/* Chip */}
      <div className="card-chip mb-5 relative z-10" />

      {/* Balance */}
      <div className="mb-5 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Số dư khả dụng</p>
          <button onClick={onToggle} className="transition-opacity hover:opacity-80">
            {hideBalance
              ? <EyeOff className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
              : <Eye className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />}
          </button>
        </div>
        <p className="text-3xl font-black text-white tracking-tight">
          {hideBalance ? '••••••••' : fmt(balance)}
        </p>
      </div>

      {/* Card Number + Holder */}
      <div className="flex items-end justify-between relative z-10">
        <div>
          <p className="text-xs tracking-[0.25em] text-white/50 mb-0.5">•••• •••• •••• 4291</p>
          <p className="text-xs font-semibold text-white/70">NGUYEN VAN A</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50">HẾT HẠN</p>
          <p className="text-sm font-bold text-white/80">12/28</p>
        </div>
      </div>
    </div>
  )
}

/* ==== Green Score Circle ==== */
function GreenScore({ score }: { score: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Xuất sắc' : score >= 40 ? 'Trung bình' : 'Cần cải thiện'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-black" style={{ color }}>{score}</p>
          <p className="text-xs text-muted">/ 100</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-center" style={{ color }}>🌱 {label}</p>
        <p className="text-xs text-muted text-center">Green Score</p>
      </div>
    </div>
  )
}

/* ==== Quick Action ==== */
function QuickAction({ icon, label, onClick, color }: { icon: string; label: string; onClick?: () => void; color?: string }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <div className="quick-action-icon" style={{ background: color || 'rgba(37,99,235,0.15)' }}>
        <span className="text-2xl">{icon}</span>
      </div>
      <span>{label}</span>
    </button>
  )
}

/* ==== MAIN DASHBOARD ==== */
export default function Dashboard() {
  const store = useGreenStore()
  const [hideBalance, setHideBalance] = useState(false)
  const [activeCard, setActiveCard] = useState<'blue' | 'green' | 'premium'>('blue')
  const [showTransfer, setShowTransfer] = useState(false)
  const [tipIdx, setTipIdx] = useState(0)

  const { data: stats } = useQuery('dashboard-stats', async () => {
    try { const res = await api.get('/dashboard/stats'); return res.data } catch { return null }
  })

  const balance = stats?.totalBalance || store.blueCardBalance
  const monthlyIncome  = stats?.monthlyIncome  || 15_000_000
  const monthlyExpense = stats?.monthlyExpense || 7_800_000
  
  // Calculate dynamic green score
  const greenScore = Math.min(100, Math.max(0, Math.floor(78 + (store.greenPoints - 780) / 12)))

  const cardBalances = { 
    blue: store.blueCardBalance, 
    green: store.greenCardBalance, 
    premium: store.premiumCardBalance 
  }

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ===== TOP SECTION: Cards + Quick Actions ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Virtual Card + Quick Actions */}
        <div className="xl:col-span-2 space-y-4">

          {/* Card Switcher Tabs */}
          <div className="flex gap-2">
            {(['blue', 'green', 'premium'] as const).map(type => {
              const labels = { blue: '🏦 Chính', green: '🌿 Xanh', premium: '💎 VIP' }
              return (
                <button
                  key={type}
                  onClick={() => setActiveCard(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeCard === type
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'text-muted hover:text-white hover:bg-white/7'
                  }`}
                >
                  {labels[type]}
                </button>
              )
            })}
          </div>

          {/* Card */}
          <VirtualCard
            balance={cardBalances[activeCard]}
            hideBalance={hideBalance}
            onToggle={() => setHideBalance(h => !h)}
            cardType={activeCard}
          />

          {/* Quick Actions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-white text-sm">Thao tác nhanh</p>
              <span className="badge badge-green flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />Bảo mật
              </span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <QuickAction icon="💸" label="Chuyển tiền" color="rgba(37,99,235,0.18)" onClick={() => setShowTransfer(true)} />
              <QuickAction icon="📱" label="Nạp tiền" color="rgba(16,185,129,0.18)" />
              <QuickAction icon="📷" label="Quét QR" color="rgba(139,92,246,0.18)" />
              <QuickAction icon="💳" label="Thanh toán" color="rgba(245,158,11,0.18)" />
              <QuickAction icon="🏧" label="Rút tiền" color="rgba(239,68,68,0.18)" />
              <QuickAction icon="📊" label="Báo cáo" color="rgba(56,189,248,0.18)" />
            </div>
          </div>
        </div>

        {/* Right: Green Score + Stats */}
        <div className="space-y-4">

          {/* Green Score Card */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(145deg, rgba(5,46,22,0.6) 0%, rgba(6,78,59,0.4) 100%)',
              borderColor: 'rgba(16,185,129,0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  Carbon & Xanh
                </p>
                <p className="text-xs text-muted mt-0.5">Điểm tác động môi trường</p>
              </div>
              <span className="badge badge-green">Tháng 6</span>
            </div>

            <div className="flex items-center gap-4">
              <GreenScore score={greenScore} />
              <div className="flex-1 space-y-2.5">
                {[
                  { label: 'Carbon tiết kiệm', value: `${store.co2Saved} kg CO₂`, color: '#34d399' },
                  { label: 'Điểm tích lũy', value: `${store.greenPoints} pts`, color: '#2dd4bf' },
                  { label: 'Xu hướng', value: '↑ +8.5%', color: '#34d399' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted">{item.label}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Green Tip */}
            <div
              className="mt-4 p-3 rounded-xl text-xs"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <div className="flex items-start gap-2">
                <span className="text-base">{GREEN_TIPS[tipIdx].icon}</span>
                <div className="flex-1">
                  <p className="text-emerald-300 leading-snug">{GREEN_TIPS[tipIdx].text}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                    {GREEN_TIPS[tipIdx].impact}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setTipIdx(i => (i + 1) % GREEN_TIPS.length)}
                className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />Mẹo tiếp theo
              </button>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="icon-bubble icon-bubble-success mb-3 w-9 h-9" style={{ borderRadius: '10px' }}>
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted">Thu nhập</p>
              <p className="text-lg font-black text-emerald-400 leading-tight mt-0.5">{fmt(monthlyIncome)}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold">+8.2%</span>
              </div>
            </div>
            <div className="card p-4">
              <div className="icon-bubble icon-bubble-danger mb-3 w-9 h-9" style={{ borderRadius: '10px' }}>
                <TrendingDown className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted">Chi tiêu</p>
              <p className="text-lg font-black text-rose-400 leading-tight mt-0.5">{fmt(monthlyExpense)}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
                <span className="text-xs text-rose-400 font-semibold">−7.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEND MONEY CONTACTS ===== */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-400" />
            Chuyển nhanh
          </h3>
          <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            Tất cả <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1">
          {/* Add new */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105"
              style={{ background: 'rgba(37,99,235,0.15)', border: '2px dashed rgba(37,99,235,0.3)' }}
            >
              <Plus className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs text-muted">Thêm mới</span>
          </div>
          {MOCK_CONTACTS.map((c, i) => (
            <button key={i} className="flex flex-col items-center gap-2 flex-shrink-0 group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-sm font-black transition-all group-hover:scale-110 group-hover:shadow-lg"
                style={{ background: c.color, boxShadow: `0 4px 16px ${c.color}40` }}
              >
                {c.avatar}
              </div>
              <span className="text-xs text-muted group-hover:text-white transition-colors whitespace-nowrap">
                {c.name.split(' ').slice(-1)[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Area Chart */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-white">Dòng tiền 6 tháng</h3>
              <p className="text-xs text-muted mt-0.5">Thu nhập vs Chi tiêu</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary flex items-center gap-1">
                <Activity className="w-3 h-3" />Live
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MOCK_TREND}>
              <defs>
                <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                     tickFormatter={v => (v / 1_000_000).toFixed(0) + 'M'} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '11px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="Thu nhập" stroke="#10b981" strokeWidth={2.5} fill="url(#inc)" dot={false} />
              <Area type="monotone" dataKey="Chi tiêu"  stroke="#ef4444" strokeWidth={2.5} fill="url(#exp)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Danh mục chi tiêu</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={MOCK_CAT} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {MOCK_CAT.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#9ca3af' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== BOTTOM: Transactions + Alerts ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Recent Transactions */}
        <div className="card xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-blue-400" />
              Giao dịch gần đây
            </h3>
            <a href="/transactions" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors">
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-1">
            {[...store.customTransactions, ...MOCK_TRANSACTIONS].slice(0, 5).map((t, idx) => (
              <div
                key={t.id || idx}
                className="transfer-row"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: t.type === 'INCOME' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)' }}
                >
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{t.desc}</p>
                  <p className="text-xs text-muted">{t.cat} · {new Date(t.date).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-black text-sm ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'INCOME' ? '+' : '−'}{fmt(t.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts + Eco Impact */}
        <div className="xl:col-span-2 space-y-4">

          {/* Smart Alerts */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Cảnh báo thông minh
            </h3>
            <div className="space-y-2">
              <div className="alert alert-warning text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Ngân sách ăn uống đã dùng <strong>85%</strong></p>
              </div>
              <div className="alert alert-info text-xs">
                <CreditCard className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Netflix gia hạn sau <strong>3 ngày</strong> (199,000đ)</p>
              </div>
              <div className="alert alert-success text-xs">
                <Target className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>🎉 Mục tiêu "Mua laptop" đạt <strong>100%!</strong></p>
              </div>
            </div>
          </div>

          {/* Eco Impact */}
          <div
            className="card"
            style={{ background: 'linear-gradient(145deg, rgba(5,46,22,0.5) 0%, rgba(6,78,59,0.3) 100%)', borderColor: 'rgba(16,185,129,0.15)' }}
          >
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-emerald-400" />
              Tác động môi trường
            </h3>
            <div className="space-y-3">
              {[
                { label: '🌳 Cây tương đương',   value: '2.1 cây', bar: 42, color: '#10b981' },
                { label: '⚡ Điện tiết kiệm',     value: '48 kWh',  bar: 60, color: '#38bdf8' },
                { label: '💧 Nước tiết kiệm',     value: '320 L',   bar: 35, color: '#2dd4bf' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted">{item.label}</span>
                    <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <div className="progress-fill h-1.5" style={{ width: `${item.bar}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
            <a href="/investments" className="mt-3 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              <Leaf className="w-3 h-3" />Xem đầu tư xanh <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* ===== TRANSFER MODAL ===== */}
      {showTransfer && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTransfer(false)}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Chuyển tiền nhanh</h3>
              <button onClick={() => setShowTransfer(false)} className="btn btn-ghost p-2">
                <span className="text-muted">✕</span>
              </button>
            </div>

            {/* Contacts */}
            <div className="mb-5">
              <p className="label">Người nhận</p>
              <div className="flex gap-3 mb-3">
                {MOCK_CONTACTS.map((c, i) => (
                  <button
                    key={i}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-black transition-all group-hover:scale-110"
                      style={{ background: c.color }}
                    >
                      {c.avatar}
                    </div>
                    <span className="text-xs text-muted">{c.name.split(' ').slice(-1)[0]}</span>
                  </button>
                ))}
              </div>
              <input className="input" placeholder="Nhập số tài khoản hoặc tên..." />
            </div>

            <div className="mb-5">
              <p className="label">Số tiền</p>
              <div className="relative">
                <input className="input text-xl font-bold pr-20" placeholder="0" type="number" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted font-semibold">VND</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[100_000, 500_000, 1_000_000, 2_000_000].map(v => (
                  <button key={v} className="btn btn-secondary text-xs py-1 px-2.5">
                    {(v / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="label">Lời nhắn</p>
              <input className="input" placeholder="Chuyển tiền..." />
            </div>

            <button className="btn btn-primary w-full flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Xác nhận chuyển tiền
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
