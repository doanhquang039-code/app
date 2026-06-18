import { useState, useRef } from 'react'
import {
  Camera, Upload, ScanLine, CheckCircle, Clock,
  Tag, DollarSign, Store, Calendar, Plus, Trash2,
  FileText, Eye, X,
} from 'lucide-react'

import { MOCK_RECEIPTS, Receipt } from '../fixtures/mockData'

const CATEGORY_MAP: Record<string, string> = {
  'Thực phẩm': 'icon-bubble-success',
  'Ăn uống':   'icon-bubble-primary',
  'Giải trí':  'icon-bubble-warning',
  'Di chuyển': 'icon-bubble-info',
}

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

function StatusBadge({ status }: { status: Receipt['status'] }) {
  const map = {
    added:   { cls: 'badge-success', label: 'Đã thêm', icon: <CheckCircle className="w-3 h-3" /> },
    scanned: { cls: 'badge-primary', label: 'Đã quét', icon: <ScanLine className="w-3 h-3" /> },
    pending: { cls: 'badge-warning', label: 'Chờ xử lý', icon: <Clock className="w-3 h-3" /> },
  }
  const s = map[status]
  return (
    <span className={`badge ${s.cls} flex items-center gap-1`}>
      {s.icon}{s.label}
    </span>
  )
}

export default function ReceiptScanner() {
  const [receipts, setReceipts] = useState<Receipt[]>(MOCK_RECEIPTS)
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const simulateScan = () => {
    setScanning(true)
    setScanProgress(0)
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setScanning(false)
          // Add mock scanned receipt
          const newReceipt: Receipt = {
            id: Date.now(),
            merchant: 'Vinmart+',
            date: new Date().toISOString().split('T')[0],
            total: 234500,
            category: 'Thực phẩm',
            status: 'scanned',
            items: [
              { name: 'Mì Hảo Hảo (5 gói)', quantity: 1, price: 32000 },
              { name: 'Nước mắm Chin-su', quantity: 1, price: 45000 },
              { name: 'Dầu ăn Tường An', quantity: 1, price: 85000 },
              { name: 'Đường cát trắng 1kg', quantity: 1, price: 28000 },
              { name: 'Muối i-ốt', quantity: 2, price: 12000 },
            ],
          }
          setReceipts(prev => [newReceipt, ...prev])
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)
  }

  const addToTransactions = (id: number) => {
    setReceipts(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'added' as const } : r)
    )
    setSelectedReceipt(null)
  }

  const deleteReceipt = (id: number) => {
    setReceipts(prev => prev.filter(r => r.id !== id))
    if (selectedReceipt?.id === id) setSelectedReceipt(null)
  }

  const totalScanned = receipts.length
  const totalAmount  = receipts.reduce((s, r) => s + r.total, 0)
  const addedCount   = receipts.filter(r => r.status === 'added').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ScanLine className="w-7 h-7 text-indigo-400" />
            Quét hóa đơn
          </h1>
          <p className="text-muted mt-1">Scan và tự động nhận dạng hóa đơn bằng OCR</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="stat-card stat-card-primary">
          <p className="text-muted text-sm font-medium mb-2">Tổng hóa đơn</p>
          <p className="text-3xl font-bold text-indigo-400">{totalScanned}</p>
        </div>
        <div className="stat-card stat-card-warning">
          <p className="text-muted text-sm font-medium mb-2">Tổng giá trị</p>
          <p className="text-2xl font-bold text-amber-400">{fmt(totalAmount)}</p>
        </div>
        <div className="stat-card stat-card-success">
          <p className="text-muted text-sm font-medium mb-2">Đã thêm giao dịch</p>
          <p className="text-3xl font-bold text-emerald-400">{addedCount}</p>
        </div>
      </div>

      {/* Upload Zone + Scanner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Drop Zone */}
        <div
          className={`card flex flex-col items-center justify-center py-12 cursor-pointer transition-all ${dragOver ? 'border-indigo-500' : ''}`}
          style={{
            border: `2px dashed ${dragOver ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
            background: dragOver ? 'rgba(99,102,241,0.08)' : undefined,
          }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); simulateScan() }}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={simulateScan} />
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
               style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Upload className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="font-semibold text-white mb-1">Tải ảnh hóa đơn lên</p>
          <p className="text-sm text-muted text-center">Kéo thả hoặc click để chọn file</p>
          <p className="text-xs text-muted mt-1">PNG, JPG, JPEG — tối đa 10MB</p>
        </div>

        {/* Camera Scan */}
        <div className="card flex flex-col items-center justify-center py-12">
          {scanning ? (
            <div className="w-full text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <ScanLine className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
              <p className="font-semibold text-white mb-1">Đang quét hóa đơn...</p>
              <p className="text-sm text-muted mb-4">OCR đang nhận dạng văn bản</p>
              <div className="w-full max-w-xs mx-auto">
                <div className="progress-bar">
                  <div
                    className="progress-fill transition-all duration-300"
                    style={{ width: `${Math.min(scanProgress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted text-right mt-1">{Math.round(Math.min(scanProgress, 100))}%</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                   style={{ background: 'rgba(16,185,129,0.15)' }}>
                <Camera className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="font-semibold text-white mb-1">Chụp ảnh trực tiếp</p>
              <p className="text-sm text-muted text-center mb-4">Dùng camera để scan hóa đơn</p>
              <button onClick={simulateScan} className="btn btn-success flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Quét ngay
              </button>
            </>
          )}
        </div>
      </div>

      {/* Receipt List + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* List */}
        <div className={`card ${selectedReceipt ? 'xl:col-span-2' : 'xl:col-span-5'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Danh sách hóa đơn
            </h3>
            <span className="badge badge-primary">{receipts.length}</span>
          </div>
          <div className="space-y-2">
            {receipts.map(receipt => (
              <div
                key={receipt.id}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedReceipt?.id === receipt.id
                    ? 'bg-indigo-500/20 border-indigo-500/40'
                    : 'hover:bg-white/5'
                }`}
                style={{
                  border: selectedReceipt?.id === receipt.id
                    ? '1px solid rgba(99,102,241,0.4)'
                    : '1px solid rgba(255,255,255,0.06)',
                }}
                onClick={() => setSelectedReceipt(r => r?.id === receipt.id ? null : receipt)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`icon-bubble ${CATEGORY_MAP[receipt.category] || 'icon-bubble-primary'}`}>
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{receipt.merchant}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-muted" />
                        <p className="text-xs text-muted">
                          {new Date(receipt.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-bold text-white text-sm">{fmt(receipt.total)}</p>
                    <StatusBadge status={receipt.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedReceipt && (
          <div className="card xl:col-span-3 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">{selectedReceipt.merchant}</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedReceipt.status} />
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="btn btn-ghost p-1.5"
                >
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { icon: <Calendar className="w-4 h-4" />, label: 'Ngày', value: new Date(selectedReceipt.date).toLocaleDateString('vi-VN') },
                { icon: <Tag className="w-4 h-4" />, label: 'Danh mục', value: selectedReceipt.category },
                { icon: <DollarSign className="w-4 h-4" />, label: 'Tổng tiền', value: fmt(selectedReceipt.total) },
                { icon: <FileText className="w-4 h-4" />, label: 'Số mặt hàng', value: `${selectedReceipt.items.length} món` },
              ].map((m, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-1.5 text-muted mb-1">
                    {m.icon}
                    <span className="text-xs">{m.label}</span>
                  </div>
                  <p className="font-semibold text-white text-sm">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Chi tiết mặt hàng</p>
              <div className="space-y-2">
                {selectedReceipt.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm py-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted text-xs w-5 text-center">{i + 1}</span>
                      <span className="text-white">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="badge badge-info text-xs">×{item.quantity}</span>
                      )}
                    </div>
                    <span className="font-semibold text-emerald-400">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="font-bold text-white">Tổng cộng</span>
                  <span className="font-bold text-indigo-400 text-base">{fmt(selectedReceipt.total)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedReceipt.status !== 'added' && (
                <button
                  onClick={() => addToTransactions(selectedReceipt.id)}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm vào giao dịch
                </button>
              )}
              <button className="btn btn-secondary flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Xem ảnh
              </button>
              <button
                onClick={() => deleteReceipt(selectedReceipt.id)}
                className="btn btn-ghost p-2.5"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
