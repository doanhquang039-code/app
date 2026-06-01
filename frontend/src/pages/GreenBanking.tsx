import { useState } from 'react'
import {
  CreditCard, Send, QrCode, ArrowUpRight, ArrowDownRight, Leaf,
  Zap, Copy, Check, Lock, Unlock, Landmark, AlertCircle, Plus,
  ShieldCheck, HelpCircle, Calendar, RefreshCw, ArrowLeftRight
} from 'lucide-react'
import { useGreenStore, SavingsPlan } from '../stores/greenStore'
import { toast } from 'sonner'

const BANKS = [
  { code: 'GB', name: 'FinGreen EcoBank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'MB', name: 'MBBank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'ACB', name: 'ACB' }
]

const ECO_PROJECTS = [
  { id: 'proj-1', name: 'Rừng phòng hộ ngập mặn Cần Giờ', rate: 6.8, desc: 'Hỗ trợ trồng cây đước, chắn sóng và lưu trữ carbon.' },
  { id: 'proj-2', name: 'Điện Mặt Trời mái nhà trường học', rate: 5.5, desc: 'Cung cấp năng lượng sạch cho các trường học vùng cao.' },
  { id: 'proj-3', name: 'Nhà máy Điện Gió tại Sóc Trăng', rate: 7.2, desc: 'Phát triển tuabin gió công suất lớn ngoài khơi.' }
]

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

export default function GreenBanking() {
  const store = useGreenStore()
  
  // Local state
  const [activeCardType, setActiveCardType] = useState<'blue' | 'green' | 'premium'>('blue')
  const [hideCardDetails, setHideCardDetails] = useState(true)
  const [lockedCards, setLockedCards] = useState<Record<string, boolean>>({
    blue: false,
    green: false,
    premium: false,
  })

  // Action modals
  const [activeModal, setActiveModal] = useState<'transfer' | 'savings' | 'qr' | 'topup' | 'bills' | null>(null)
  
  // Transfer Form State
  const [transferType, setTransferType] = useState<'account' | 'phone'>('account')
  const [destBank, setDestBank] = useState('GB')
  const [destAccount, setDestAccount] = useState('')
  const [destName, setDestName] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferMsg, setTransferMsg] = useState('Chuyển tiền nhanh 247')

  // Topup Form State
  const [phoneNum, setPhoneNum] = useState('')
  const [topupAmount, setTopupAmount] = useState('100000')

  // Bill Form State
  const [billType, setBillType] = useState('EV_CHARGE')
  const [billAmount, setBillAmount] = useState('120000')

  // Savings Form State
  const [savingsAmount, setSavingsAmount] = useState('')
  const [savingsTerm, setSavingsTerm] = useState('6')
  const [savingsProject, setSavingsProject] = useState('proj-1')
  const [savingsRenew, setSavingsRenew] = useState(true)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép ${label}`)
  }

  const handleLockToggle = (type: 'blue' | 'green' | 'premium') => {
    setLockedCards(prev => {
      const updated = { ...prev, [type]: !prev[type] }
      toast.info(updated[type] ? `Đã khóa thẻ ${type === 'blue' ? 'Tài khoản chính' : type === 'green' ? 'Tiết kiệm Xanh' : 'VIP Premium'}` : `Đã mở khóa thẻ`);
      return updated
    })
  }

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(transferAmount)
    
    if (!amount || amount <= 0) {
      toast.error('Số tiền chuyển không hợp lệ')
      return
    }

    if (lockedCards[activeCardType]) {
      toast.error('Thẻ đang bị khóa, vui lòng mở khóa trước khi giao dịch')
      return
    }

    const success = store.deductBalance(activeCardType, amount)
    if (!success) {
      toast.error('Số dư khả dụng không đủ để thực hiện giao dịch')
      return
    }

    // Add transaction
    const cardLabels = { blue: '🏦 Thẻ chính', green: '🌿 Thẻ Xanh', premium: '💎 Thẻ VIP' }
    const receiverText = transferType === 'account' ? `${destAccount} (${destName || 'Người nhận'})` : phoneNum
    store.addCustomTransaction({
      desc: `Chuyển khoản: ${destBank} - ${receiverText}`,
      type: 'EXPENSE',
      amount,
      cat: 'Khác',
      icon: '💸',
      green: false,
      note: `${transferMsg} | Nguồn: ${cardLabels[activeCardType]}`
    })

    toast.success(`Chuyển tiền thành công ${fmt(amount)}!`)
    setActiveModal(null)
    // reset form
    setTransferAmount('')
    setDestAccount('')
    setDestName('')
  }

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(topupAmount)
    
    if (!phoneNum || phoneNum.length < 10) {
      toast.error('Số điện thoại không hợp lệ')
      return
    }

    if (lockedCards[activeCardType]) {
      toast.error('Thẻ đang bị khóa')
      return
    }

    const success = store.deductBalance(activeCardType, amount)
    if (!success) {
      toast.error('Số dư không đủ')
      return
    }

    store.addCustomTransaction({
      desc: `Nạp ĐT: ${phoneNum}`,
      type: 'EXPENSE',
      amount,
      cat: 'Sinh hoạt',
      icon: '📱',
      green: false,
      note: `Nguồn: ${activeCardType === 'blue' ? 'Thẻ chính' : activeCardType === 'green' ? 'Thẻ Xanh' : 'Thẻ VIP'}`
    })

    toast.success(`Đã nạp thành công ${fmt(amount)} vào số điện thoại ${phoneNum}`)
    setActiveModal(null)
    setPhoneNum('')
  }

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(billAmount)
    if (lockedCards[activeCardType]) {
      toast.error('Thẻ đang bị khóa')
      return
    }

    const success = store.deductBalance(activeCardType, amount)
    if (!success) {
      toast.error('Số dư không đủ')
      return
    }

    const isEv = billType === 'EV_CHARGE'
    const descText = isEv ? 'Trạm sạc VinFast EV' : (billType === 'ELECTRIC' ? 'Hóa đơn Điện lực' : 'Hóa đơn Nước')
    
    store.addCustomTransaction({
      desc: descText,
      type: 'EXPENSE',
      amount,
      cat: isEv ? 'Di chuyển' : 'Sinh hoạt',
      icon: isEv ? '⚡' : (billType === 'ELECTRIC' ? '💡' : '💧'),
      green: isEv,
      note: isEv ? `Phí sạc pin VinFast · Giảm 0.5kg CO₂` : `Hóa đơn sinh hoạt tháng`
    })

    if (isEv) {
      store.addGreenPoints(15)
      store.addCo2Saved(0.5)
      toast.success(`Đã thanh toán ${fmt(amount)} phí sạc xe EV và nhận +15 điểm Xanh!`)
    } else {
      toast.success(`Đã thanh toán hóa đơn ${fmt(amount)}`)
    }

    setActiveModal(null)
  }

  const handleSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(savingsAmount)

    if (!amount || amount < 1000000) {
      toast.error('Số tiền gửi tối thiểu là 1,000,000đ')
      return
    }

    if (store.greenCardBalance < amount) {
      toast.error('Số dư Tài khoản Xanh không đủ. Vui lòng chuyển tiền từ Thẻ chính sang Thẻ Xanh trước!')
      return
    }

    const selectedProj = ECO_PROJECTS.find(p => p.id === savingsProject)
    if (!selectedProj) return

    store.addSavingsPlan({
      amount,
      term: parseInt(savingsTerm),
      rate: selectedProj.rate,
      autoRenew: savingsRenew,
      projectName: selectedProj.name
    })

    toast.success(`Đã mở thành công Gói Tiết Kiệm Xanh ${fmt(amount)} cho dự án ${selectedProj.name}!`)
    setActiveModal(null)
    setSavingsAmount('')
  }

  const cardDetails = {
    blue: {
      number: '4291 8839 0012 4583',
      name: 'NGUYEN VAN A',
      expiry: '12/28',
      cvv: '394',
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
      label: 'Tài khoản chính',
      balance: store.blueCardBalance
    },
    green: {
      number: '8842 9012 8371 4452',
      name: 'NGUYEN VAN A',
      expiry: '06/29',
      cvv: '125',
      bg: 'linear-gradient(135deg, #052e16 0%, #064e3b 50%, #059669 100%)',
      label: 'Tài khoản Xanh (Eco)',
      balance: store.greenCardBalance
    },
    premium: {
      number: '3792 1104 9924 8839',
      name: 'NGUYEN VAN A (VIP)',
      expiry: '10/30',
      cvv: '882',
      bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #6d28d9 100%)',
      label: 'VIP Premium Card',
      balance: store.premiumCardBalance
    }
  }

  const currentCard = cardDetails[activeCardType]

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Landmark className="w-7 h-7 text-emerald-400" />
            FinGreen Bank
          </h1>
          <p className="text-muted mt-1">Ngân hàng điện tử Xanh & Bảo mật tích hợp</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success flex items-center gap-1 animate-pulse-green">
            <ShieldCheck className="w-3.5 h-3.5" />Kết nối an toàn (SSL 256-bit)
          </span>
        </div>
      </div>

      {/* Main Grid: Card Selector + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3: Virtual Cards & Information */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Card Tab Selectors */}
          <div className="flex gap-2">
            {(['blue', 'green', 'premium'] as const).map(type => (
              <button
                key={type}
                onClick={() => setActiveCardType(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeCardType === type
                    ? 'bg-white/15 text-white border border-white/20 shadow-lg'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {type === 'blue' ? '🏦 Thẻ Chính' : type === 'green' ? '🌿 Thẻ Xanh' : '💎 Thẻ VIP Premium'}
              </button>
            ))}
          </div>

          {/* Styled Virtual Card Container */}
          <div
            className={`bank-card min-h-[220px] ${lockedCards[activeCardType] ? 'opacity-65 filter grayscale' : ''}`}
            style={{ background: currentCard.bg }}
          >
            {/* Locked overlay */}
            {lockedCards[activeCardType] && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 z-20 backdrop-filter blur-[2px]">
                <Lock className="w-8 h-8 text-rose-400 animate-bounce" />
                <p className="text-sm font-bold text-rose-400 mt-2">THẺ ĐÃ KHÓA TẠM THỜI</p>
              </div>
            )}

            <div className="flex items-start justify-between mb-5 relative z-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{currentCard.label}</p>
                <p className="text-white font-bold text-sm mt-0.5">FinGreen EcoBank</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white/40" />
                  <div className="w-8 h-8 rounded-full absolute -right-3 top-0 bg-white/25" />
                </div>
              </div>
            </div>

            {/* Card chip */}
            <div className="card-chip mb-4 relative z-10" />

            {/* Balance area */}
            <div className="mb-4 relative z-10">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-white/60">Số dư tài khoản</span>
                <button
                  onClick={() => setHideCardDetails(h => !h)}
                  className="text-white/55 hover:text-white transition-opacity"
                >
                  {hideCardDetails ? 'Hiện' : 'Ẩn'}
                </button>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                {hideCardDetails ? '••••••••' : fmt(currentCard.balance)}
              </p>
            </div>

            {/* Cardholder name and details */}
            <div className="flex items-end justify-between relative z-10 text-white/80">
              <div>
                <p className="text-xs tracking-[0.2em] font-semibold text-white/60 mb-0.5">
                  {hideCardDetails ? '•••• •••• •••• ' + currentCard.number.slice(-4) : currentCard.number}
                </p>
                <p className="text-xs font-bold">{currentCard.name}</p>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <p className="text-[9px] text-white/40">EXPIRY</p>
                  <p className="text-xs font-bold">{currentCard.expiry}</p>
                </div>
                <div>
                  <p className="text-[9px] text-white/40">CVV</p>
                  <p className="text-xs font-bold">{hideCardDetails ? '•••' : currentCard.cvv}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick controls for card */}
          <div className="card flex items-center justify-between p-3.5">
            <span className="text-xs text-muted font-bold flex items-center gap-1.5">
              Thao tác thẻ:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(currentCard.number.replace(/\s/g, ''), 'Số thẻ')}
                className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Sao chép số thẻ
              </button>
              <button
                onClick={() => handleLockToggle(activeCardType)}
                className={`btn text-xs px-3 py-1.5 flex items-center gap-1 ${
                  lockedCards[activeCardType] ? 'btn-success' : 'btn-danger'
                }`}
              >
                {lockedCards[activeCardType] ? (
                  <><Unlock className="w-3.5 h-3.5" /> Mở khóa thẻ</>
                ) : (
                  <><Lock className="w-3.5 h-3.5" /> Khóa tạm thời</>
                )}
              </button>
            </div>
          </div>

          {/* Bank Quick Operations */}
          <div className="card">
            <h3 className="font-semibold text-white text-sm mb-4">Dịch vụ Ngân hàng</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button onClick={() => setActiveModal('transfer')} className="quick-action">
                <div className="quick-action-icon bg-blue-500/10 text-blue-400">
                  <Send className="w-5 h-5" />
                </div>
                <span>Chuyển tiền</span>
              </button>
              
              <button onClick={() => setActiveModal('qr')} className="quick-action">
                <div className="quick-action-icon bg-purple-500/10 text-purple-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <span>QR Pay</span>
              </button>

              <button onClick={() => setActiveModal('savings')} className="quick-action">
                <div className="quick-action-icon bg-emerald-500/10 text-emerald-400">
                  <Leaf className="w-5 h-5" />
                </div>
                <span>Tiết kiệm Xanh</span>
              </button>

              <button onClick={() => setActiveModal('bills')} className="quick-action">
                <div className="quick-action-icon bg-amber-500/10 text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <span>Hóa đơn / Trạm sạc</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1/3: Green Score, Carbon Offsets, Savings Progress */}
        <div className="space-y-4">
          
          {/* Carbon Credit and points overview */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(145deg, rgba(5,46,22,0.6) 0%, rgba(6,78,59,0.3) 100%)',
              borderColor: 'rgba(16,185,129,0.2)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Leaf className="w-4 h-4" /> Eco Reward
              </span>
              <span className="badge badge-green">Tích lũy</span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div>
                <p className="text-xs text-emerald-200/60">Điểm xanh (EcoPoints)</p>
                <p className="text-2xl font-black text-white mt-0.5">{store.greenPoints}</p>
                <p className="text-[10px] text-emerald-400 mt-1">↑ +85 điểm từ Xanh SM</p>
              </div>
              <div>
                <p className="text-xs text-emerald-200/60">CO₂ giảm thiểu</p>
                <p className="text-2xl font-black text-white mt-0.5">{store.co2Saved} kg</p>
                <p className="text-[10px] text-emerald-400 mt-1">~ Tương đương 1.2 cây xanh</p>
              </div>
            </div>

            <div className="divider opacity-20" />
            <div className="text-xs text-emerald-300 leading-snug">
              💡 Mỗi chuyến đi bằng **Xanh SM** và mỗi gói **Tiết kiệm Xanh** sẽ tích lũy điểm thưởng giúp giảm trừ trực tiếp lãi suất vay hoặc mua sắm voucher xe điện!
            </div>
          </div>

          {/* Active Savings Projects */}
          <div className="card">
            <h3 className="font-semibold text-white text-sm mb-3">Sổ Tiết Kiệm Xanh ({store.savingsPlans.length})</h3>
            <div className="space-y-3">
              {store.savingsPlans.map(plan => {
                const interest = (plan.amount * (plan.rate / 100) * (plan.term / 12))
                return (
                  <div
                    key={plan.id}
                    className="p-3 rounded-xl border border-white/5 bg-white/5 space-y-2 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[150px]">{plan.projectName}</p>
                        <p className="text-[10px] text-muted">Bắt đầu: {plan.startDate}</p>
                      </div>
                      <span className="badge badge-success text-[9px]">{plan.rate}%/năm</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-muted">Số tiền gửi</p>
                        <p className="text-sm font-black text-white">{fmt(plan.amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-emerald-400">Lãi dự kiến</p>
                        <p className="text-xs font-bold text-emerald-400">+{fmt(interest)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {store.savingsPlans.length === 0 && (
                <div className="text-center py-6 text-xs text-muted">
                  Bạn chưa có sổ tiết kiệm xanh nào.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History specific to card transfers / topups */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
            Lịch sử giao dịch gần đây
          </h3>
        </div>

        <div className="space-y-1">
          {store.customTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted">
              Chưa có giao dịch nội bộ nào được ghi nhận. Hãy thử chuyển tiền hoặc nạp trạm sạc!
            </div>
          ) : (
            store.customTransactions.map((tx, idx) => (
              <div
                key={tx.id || idx}
                className="transfer-row text-xs flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-lg">
                    {tx.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{tx.desc}</p>
                    <p className="text-[10px] text-muted">{tx.note || tx.cat} · {tx.date}</p>
                  </div>
                </div>
                <div className="text-right font-black text-rose-400">
                  -{fmt(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Money Transfer Modal */}
      {activeModal === 'transfer' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Chuyển tiền nhanh 24/7</h3>
              <button onClick={() => setActiveModal(null)} className="btn btn-ghost p-1 text-sm">✕</button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <p className="label">Hình thức chuyển</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferType('account')}
                    className={`btn text-xs py-2 ${transferType === 'account' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Số tài khoản / Thẻ
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferType('phone')}
                    className={`btn text-xs py-2 ${transferType === 'phone' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Số điện thoại
                  </button>
                </div>
              </div>

              {transferType === 'account' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Ngân hàng nhận</label>
                      <select
                        value={destBank}
                        onChange={e => setDestBank(e.target.value)}
                        className="input text-xs"
                      >
                        {BANKS.map(b => (
                          <option key={b.code} value={b.code}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Số tài khoản</label>
                      <input
                        type="text"
                        required
                        value={destAccount}
                        onChange={e => setDestAccount(e.target.value)}
                        placeholder="Nhập STK nhận..."
                        className="input text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Tên người nhận (Gợi ý)</label>
                    <input
                      type="text"
                      value={destName}
                      onChange={e => setDestName(e.target.value)}
                      placeholder="NGUYEN VAN B (Không bắt buộc)"
                      className="input text-xs"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="label">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={phoneNum}
                    onChange={e => setPhoneNum(e.target.value)}
                    placeholder="Nhập số điện thoại liên kết..."
                    className="input text-xs"
                  />
                </div>
              )}

              <div>
                <label className="label">Số tiền (VND)</label>
                <input
                  type="number"
                  required
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  className="input text-base font-bold"
                />
                <div className="flex gap-2 mt-1.5">
                  {[100000, 500000, 1000000, 5000000].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setTransferAmount(v.toString())}
                      className="btn btn-secondary text-[10px] py-1 px-2"
                    >
                      {fmt(v).replace(',00 ₫', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Nội dung</label>
                <input
                  type="text"
                  value={transferMsg}
                  onChange={e => setTransferMsg(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted">Nguồn tiền:</span>
                  <span className="font-bold text-white">{activeCardType === 'blue' ? 'Thẻ chính' : activeCardType === 'green' ? 'Thẻ Xanh' : 'Thẻ VIP'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Phí giao dịch:</span>
                  <span className="font-bold text-emerald-400">Miễn phí (Eco)</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full text-xs py-2.5">
                Xác nhận chuyển khoản
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. QR Pay Code Simulator */}
      {activeModal === 'qr' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="modal-content text-center">
            <div className="flex items-center justify-between mb-4 text-left">
              <h3 className="font-bold text-white text-base">Mã VietQR cá nhân</h3>
              <button onClick={() => setActiveModal(null)} className="btn btn-ghost p-1 text-sm">✕</button>
            </div>
            
            <div className="bg-white p-5 rounded-2xl inline-block shadow-2xl relative">
              {/* Fake QR generator using placeholder style svg */}
              <svg width="220" height="220" viewBox="0 0 100 100" className="mx-auto">
                <rect width="100" height="100" fill="white" />
                {/* QR corners */}
                <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                <rect x="8" y="8" width="19" height="19" fill="white" />
                <rect x="12" y="12" width="11" height="11" fill="#0f172a" />

                <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                <rect x="73" y="8" width="19" height="19" fill="white" />
                <rect x="77" y="12" width="11" height="11" fill="#0f172a" />

                <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                <rect x="8" y="73" width="19" height="19" fill="white" />
                <rect x="12" y="77" width="11" height="11" fill="#0f172a" />
                
                {/* Fake pixels */}
                <rect x="35" y="15" width="8" height="8" fill="#10b981" />
                <rect x="45" y="25" width="12" height="6" fill="#1e3a5f" />
                <rect x="55" y="45" width="8" height="18" fill="#059669" />
                <rect x="15" y="40" width="20" height="10" fill="#0f172a" />
                <rect x="40" y="70" width="15" height="15" fill="#1d4ed8" />
                <rect x="70" y="45" width="18" height="10" fill="#0f172a" />
                <rect x="80" y="75" width="12" height="12" fill="#10b981" />

                {/* center logo leaf */}
                <circle cx="50" cy="50" r="11" fill="white" />
                <path d="M47,53 C47,50 50,47 53,47 C53,50 50,53 47,53" fill="#10b981" />
                <path d="M50,50 L47,53" stroke="#10b981" strokeWidth="1" />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#080e1a] rounded-lg p-1">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <p className="text-sm font-bold text-white">Chủ tài khoản: NGUYEN VAN A</p>
              <p className="text-xs text-muted">Số tài khoản: {currentCard.number.replace(/\s/g, '')}</p>
              <p className="text-xs text-emerald-400">Ngân hàng: FinGreen EcoBank</p>
            </div>

            <button
              onClick={() => handleCopy(currentCard.number, 'Mã QR')}
              className="btn btn-secondary w-full text-xs py-2 mt-4"
            >
              Tải xuống mã QR
            </button>
          </div>
        </div>
      )}

      {/* 3. Green Savings Modal */}
      {activeModal === 'savings' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Mở sổ Tiết Kiệm Xanh</h3>
              <button onClick={() => setActiveModal(null)} className="btn btn-ghost p-1 text-sm">✕</button>
            </div>

            <form onSubmit={handleSavingsSubmit} className="space-y-4">
              <div className="alert alert-green text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  Tiền gửi tiết kiệm xanh sẽ được sử dụng độc quyền để cấp vốn cho các dự án xanh, năng lượng tái tạo, giảm phát thải carbon. Số dư trích từ **Thẻ Xanh**.
                </div>
              </div>

              <div>
                <label className="label">Chọn dự án đầu tư</label>
                <div className="space-y-2">
                  {ECO_PROJECTS.map(p => (
                    <label
                      key={p.id}
                      className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                        savingsProject === p.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-transparent'
                      }`}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name="project"
                            checked={savingsProject === p.id}
                            onChange={() => setSavingsProject(p.id)}
                            className="text-emerald-500 accent-emerald-500"
                          />
                          <span className="text-xs font-bold text-white leading-tight">{p.name}</span>
                        </div>
                        <p className="text-[10px] text-muted mt-1 leading-snug">{p.desc}</p>
                      </div>
                      <span className="text-xs font-black text-emerald-400 whitespace-nowrap bg-emerald-500/10 px-2 py-1 rounded-lg">
                        {p.rate}% / năm
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Kỳ hạn gửi</label>
                  <select
                    value={savingsTerm}
                    onChange={e => setSavingsTerm(e.target.value)}
                    className="input text-xs"
                  >
                    <option value="1">1 Tháng (5.0%)</option>
                    <option value="3">3 Tháng (5.5%)</option>
                    <option value="6">6 Tháng (6.8%)</option>
                    <option value="12">12 Tháng (7.2%)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Nguồn trích quỹ</label>
                  <input
                    type="text"
                    disabled
                    value={`Tài khoản Xanh (${fmt(store.greenCardBalance)})`}
                    className="input text-xs opacity-80"
                  />
                </div>
              </div>

              <div>
                <label className="label">Số tiền gửi (VND)</label>
                <input
                  type="number"
                  required
                  min="1000000"
                  value={savingsAmount}
                  onChange={e => setSavingsAmount(e.target.value)}
                  placeholder="Tối thiểu 1,000,000đ..."
                  className="input text-base font-bold"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted font-bold">Tự động tất toán & gia hạn:</span>
                <input
                  type="checkbox"
                  checked={savingsRenew}
                  onChange={e => setSavingsRenew(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 text-emerald-500 cursor-pointer"
                />
              </div>

              <button type="submit" className="btn btn-green w-full text-xs py-2.5">
                Xác nhận gửi tiết kiệm
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Topup & Charging Bills */}
      {activeModal === 'bills' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Thanh toán hóa đơn điện tử</h3>
              <button onClick={() => setActiveModal(null)} className="btn btn-ghost p-1 text-sm">✕</button>
            </div>

            <form onSubmit={handleBillSubmit} className="space-y-4">
              <div>
                <label className="label">Loại dịch vụ</label>
                <select
                  value={billType}
                  onChange={e => setBillType(e.target.value)}
                  className="input text-xs"
                >
                  <option value="EV_CHARGE">🔋 Phí trạm sạc VinFast EV (Eco-discount)</option>
                  <option value="ELECTRIC">💡 Hóa đơn điện EVN</option>
                  <option value="WATER">💧 Hóa đơn nước sinh hoạt</option>
                </select>
              </div>

              <div>
                <label className="label">Nhập mã khách hàng / biển số xe</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: PE1200039201 hoặc 30A-999.99..."
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label">Số tiền cần thanh toán</label>
                <input
                  type="number"
                  required
                  value={billAmount}
                  onChange={e => setBillAmount(e.target.value)}
                  className="input text-base font-bold"
                />
              </div>

              {billType === 'EV_CHARGE' && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  🌱 Điểm thưởng Eco: Nhận ngay **+15 điểm Xanh** và ghi nhận giảm phát thải carbon khi sử dụng phương tiện điện VinFast!
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full text-xs py-2.5">
                Thanh toán hóa đơn
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
