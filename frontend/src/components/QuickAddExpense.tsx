import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { Plus, X, Zap, Mic, Camera, CheckCircle2 } from 'lucide-react'
import api from '../lib/api'
import { toast } from 'sonner'

const QUICK_CATEGORIES = [
  { id: null, name: 'Ăn uống',    emoji: '🍜', color: '#f43f5e' },
  { id: null, name: 'Di chuyển',  emoji: '🚗', color: '#f59e0b' },
  { id: null, name: 'Mua sắm',    emoji: '🛒', color: '#6366f1' },
  { id: null, name: 'Giải trí',   emoji: '🎬', color: '#8b5cf6' },
  { id: null, name: 'Y tế',       emoji: '💊', color: '#10b981' },
  { id: null, name: 'Khác',       emoji: '📦', color: '#38bdf8' },
]

export default function QuickAddExpense() {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [selectedCat, setSelectedCat] = useState<string>('Ăn uống')
  const [success, setSuccess] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  useEffect(() => {
    if (open) {
      setTimeout(() => amountRef.current?.focus(), 100)
    } else {
      setAmount('')
      setDescription('')
      setType('EXPENSE')
      setSelectedCat('Ăn uống')
      setSuccess(false)
    }
  }, [open])

  // Keyboard shortcut: Ctrl+Q / Cmd+Q
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault()
        setOpen(p => !p)
      }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const { mutate, isLoading } = useMutation(
    async () => {
      const payload = {
        amount: parseFloat(amount.replace(/,/g, '')),
        description: description || selectedCat,
        type,
        categoryName: selectedCat,
        date: new Date().toISOString(),
      }
      await api.post('/transactions', payload)
    },
    {
      onSuccess: () => {
        setSuccess(true)
        qc.invalidateQueries('recent-transactions')
        qc.invalidateQueries('dashboard-stats')
        toast.success(`Đã thêm ${type === 'EXPENSE' ? 'chi tiêu' : 'thu nhập'}: ${formatAmount(amount)}`)
        setTimeout(() => setOpen(false), 1200)
      },
      onError: () => {
        toast.error('Không thể thêm giao dịch. Vui lòng thử lại.')
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(parseFloat(amount.replace(/,/g, '')))) {
      toast.error('Vui lòng nhập số tiền hợp lệ')
      return
    }
    mutate()
  }

  const formatAmount = (val: string) => {
    const num = parseFloat(val.replace(/,/g, ''))
    if (isNaN(num)) return val
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setAmount(raw ? parseInt(raw, 10).toLocaleString('vi-VN') : '')
  }

  return (
    <>
      {/* FAB Button */}
      <button
        id="quick-add-fab"
        onClick={() => setOpen(true)}
        aria-label="Thêm giao dịch nhanh"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center
                   shadow-[0_8px_32px_rgba(99,102,241,0.5)] animate-pulse-glow
                   transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {/* Keyboard hint */}
      {!open && (
        <div className="fixed bottom-6 right-24 z-40 hidden lg:flex items-center gap-1.5
                        glass rounded-full px-3 py-1.5 text-xs text-muted pointer-events-none">
          <kbd className="bg-white/10 rounded px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="bg-white/10 rounded px-1.5 py-0.5 font-mono text-[10px]">Q</kbd>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal-content w-full max-w-md">
            {success ? (
              /* Success state */
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="icon-bubble icon-bubble-success w-16 h-16 rounded-2xl">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <p className="text-xl font-bold text-white">Đã lưu!</p>
                <p className="text-muted text-sm">Giao dịch đã được thêm thành công.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-white">Thêm nhanh</h2>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Type Toggle */}
                <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5">
                  <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                      type === 'EXPENSE'
                        ? 'bg-rose-500 text-white'
                        : 'text-muted hover:bg-white/5'
                    }`}
                  >
                    💸 Chi tiêu
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('INCOME')}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                      type === 'INCOME'
                        ? 'bg-emerald-500 text-white'
                        : 'text-muted hover:bg-white/5'
                    }`}
                  >
                    💰 Thu nhập
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="label">Số tiền *</label>
                  <div className="relative">
                    <input
                      ref={amountRef}
                      id="quick-add-amount"
                      type="text"
                      inputMode="numeric"
                      className="input text-xl font-bold pr-16"
                      placeholder="0"
                      value={amount}
                      onChange={handleAmountChange}
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">
                      VND
                    </span>
                  </div>
                  {amount && (
                    <p className="text-indigo-400 text-xs mt-1 font-medium">{formatAmount(amount)}</p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="label">Mô tả</label>
                  <input
                    id="quick-add-description"
                    type="text"
                    className="input"
                    placeholder="Ăn trưa, cà phê, đổ xăng…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                {/* Quick Categories */}
                <div className="mb-6">
                  <label className="label">Danh mục</label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_CATEGORIES.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedCat(c.name)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          selectedCat === c.name
                            ? 'border-indigo-500 bg-indigo-500/15 text-white'
                            : 'border-white/10 text-muted hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="text-xl">{c.emoji}</span>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {/* Voice / Camera quick actions */}
                  <button
                    type="button"
                    className="btn btn-secondary w-11 h-11 p-0 flex-shrink-0"
                    title="Nhận diện giọng nói (sắp có)"
                    aria-label="Voice input"
                    onClick={() => toast.info('Tính năng giọng nói đang phát triển')}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary w-11 h-11 p-0 flex-shrink-0"
                    title="Scan hóa đơn (sắp có)"
                    aria-label="Scan receipt"
                    onClick={() => toast.info('Tính năng quét hóa đơn đang phát triển')}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !amount}
                    className={`btn flex-1 ${type === 'EXPENSE' ? 'btn-danger' : 'btn-success'}`}
                  >
                    {isLoading ? (
                      <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Lưu giao dịch
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
