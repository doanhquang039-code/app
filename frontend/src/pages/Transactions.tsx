import { useState } from 'react'
import { useQuery } from 'react-query'
import {
  ArrowLeftRight, Search, Filter, Plus, Download,
  TrendingUp, TrendingDown, Leaf, ChevronDown,
  ArrowUpRight, ArrowDownRight, ArrowRight, CreditCard,
  Calendar, Tag, RefreshCw,
} from 'lucide-react'
import api from '../lib/api'
import TransactionModal from '../components/transactions/TransactionModal'
import { useGreenStore } from '../stores/greenStore'
import { transactionService } from '../services/transactionService'

const CATEGORIES = [
  { name: 'Tất cả', icon: '🔍' },
  { name: 'Ăn uống', icon: '🍔' },
  { name: 'Di chuyển', icon: '🚗' },
  { name: 'Mua sắm', icon: '🛍️' },
  { name: 'Giải trí', icon: '🎬' },
  { name: 'Sức khỏe', icon: '💊' },
  { name: 'Sinh hoạt', icon: '🏠' },
  { name: 'Thu nhập', icon: '💼' },
]

const MOCK_TRANSACTIONS = [
  { id: 1,  desc: 'Lương tháng 6',     type: 'INCOME',  amount: 15_000_000, cat: 'Thu nhập',  icon: '💼', date: '2026-06-01', green: false, note: 'Công ty ABC' },
  { id: 2,  desc: 'Shopee',            type: 'EXPENSE', amount: 450_000,    cat: 'Mua sắm',  icon: '🛒', date: '2026-06-01', green: false, note: 'Đặt hàng #123' },
  { id: 3,  desc: 'Xe đạp điện',       type: 'EXPENSE', amount: 35_000,     cat: 'Di chuyển',icon: '🚲', date: '2026-05-31', green: true,  note: 'EBIKE sharing' },
  { id: 4,  desc: 'Grab Food',         type: 'EXPENSE', amount: 85_000,     cat: 'Ăn uống',  icon: '🍔', date: '2026-05-31', green: false, note: 'Cơm gà + bún bò' },
  { id: 5,  desc: 'Siêu thị organic',  type: 'EXPENSE', amount: 320_000,    cat: 'Thực phẩm',icon: '🥗', date: '2026-05-30', green: true,  note: 'Vinmart+' },
  { id: 6,  desc: 'Netflix',           type: 'EXPENSE', amount: 199_000,    cat: 'Giải trí', icon: '🎬', date: '2026-05-30', green: false, note: 'Premium' },
  { id: 7,  desc: 'Điện nước',         type: 'EXPENSE', amount: 350_000,    cat: 'Sinh hoạt',icon: '💡', date: '2026-05-29', green: false, note: 'Tháng 5/2026' },
  { id: 8,  desc: 'Năng lượng mặt trời',type:'INCOME',  amount: 280_000,    cat: 'Thu nhập', icon: '☀️', date: '2026-05-29', green: true,  note: 'Solar panel sell-back' },
  { id: 9,  desc: 'Gym',               type: 'EXPENSE', amount: 400_000,    cat: 'Sức khỏe', icon: '💪', date: '2026-05-28', green: false, note: 'Tháng 6' },
  { id: 10, desc: 'Chuyển tiền Minh',  type: 'EXPENSE', amount: 500_000,    cat: 'Khác',     icon: '💸', date: '2026-05-28', green: false, note: 'Góp tiền nhậu' },
]

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

function TransactionRow({ t, onClick }: { t: typeof MOCK_TRANSACTIONS[0]; onClick: () => void }) {
  const isIncome = t.type === 'INCOME'
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer group transition-all hover:bg-white/5"
      style={{ border: '1px solid rgba(255,255,255,0.04)' }}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all group-hover:scale-105"
        style={{ background: isIncome ? 'rgba(16,185,129,0.12)' : (t.green ? 'rgba(13,148,136,0.12)' : 'rgba(255,255,255,0.06)') }}
      >
        {t.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-white truncate">{t.desc}</p>
          {t.green && (
            <span className="flex-shrink-0 flex items-center gap-0.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              <Leaf className="w-2.5 h-2.5" />Eco
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-primary">{t.cat}</span>
          <span className="text-xs text-muted flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(t.date).toLocaleDateString('vi-VN')}
          </span>
          {t.note && <span className="text-xs text-muted hidden md:inline truncate max-w-[120px]">• {t.note}</span>}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1.5 justify-end">
          {isIncome
            ? <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            : <ArrowUpRight className="w-4 h-4 text-rose-400" />}
          <p className={`font-black text-lg ${isIncome ? 'text-emerald-400' : 'text-white'}`}>
            {isIncome ? '+' : '−'}{fmt(t.amount)}
          </p>
        </div>
        {!isIncome && (
          <p className="text-xs text-muted text-right">Chi tiêu</p>
        )}
      </div>
    </div>
  )
}

export default function Transactions() {
  const store = useGreenStore()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [activeCat, setActiveCat] = useState('Tất cả')
  const [showModal, setShowModal] = useState(false)
  const [selectedTx, setSelectedTx] = useState<any | null>(null)

  const { data: transactions, refetch } = useQuery('transactions', async () => {
    try { const res = await api.get('/transactions'); return res.data } catch { return MOCK_TRANSACTIONS }
  }, { initialData: MOCK_TRANSACTIONS })

  const { data: categories } = useQuery('categories', () => transactionService.listCategories(), {
    initialData: [],
  })

  const txList = [...store.customTransactions, ...((transactions as any) || MOCK_TRANSACTIONS)]

  const filtered = txList.filter(t => {
    const matchSearch = t.desc.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'ALL' || t.type === filterType
    const matchCat  = activeCat === 'Tất cả' || t.cat === activeCat
    return matchSearch && matchType && matchCat
  })

  const totalIncome  = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const greenTxCount = filtered.filter(t => t.green).length

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7 text-blue-400" />
            Giao dịch
          </h1>
          <p className="text-muted mt-1">Lịch sử giao dịch tài khoản</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
          <button onClick={() => { setSelectedTx(null); setShowModal(true) }} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm giao dịch
          </button>
        </div>
      </div>

      {/* Summary mini cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="icon-bubble icon-bubble-success w-10 h-10" style={{ borderRadius: '12px' }}>
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Thu nhập</p>
            <p className="font-black text-emerald-400">{fmt(totalIncome)}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="icon-bubble icon-bubble-danger w-10 h-10" style={{ borderRadius: '12px' }}>
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Chi tiêu</p>
            <p className="font-black text-rose-400">{fmt(totalExpense)}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="icon-bubble icon-bubble-green w-10 h-10" style={{ borderRadius: '12px' }}>
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Giao dịch Eco</p>
            <p className="font-black text-emerald-400">{greenTxCount} giao dịch</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm giao dịch..."
              className="input pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'INCOME',  label: '↓ Thu' },
              { key: 'EXPENSE', label: '↑ Chi' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setFilterType(t.key as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  filterType === t.key ? 'bg-blue-600 text-white shadow-lg' : 'text-muted hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCat(cat.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                activeCat === cat.name
                  ? 'text-white border-blue-500/50'
                  : 'text-muted hover:text-white border-transparent'
              }`}
              style={{
                background: activeCat === cat.name ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeCat === cat.name ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">{filtered.length} giao dịch</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Sắp xếp theo:</span>
            <button className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Ngày mới nhất <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ArrowLeftRight className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(232,240,254,0.2)' }} />
            <p className="text-muted">Không tìm thấy giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map(t => (
              <TransactionRow
                key={t.id}
                t={t}
                onClick={() => { setSelectedTx(t as any); setShowModal(true) }}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TransactionModal
          transaction={selectedTx}
          categories={categories || []}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); refetch() }}
        />
      )}
    </div>
  )
}
