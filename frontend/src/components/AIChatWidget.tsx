import { useState, useRef, useEffect } from 'react'
import {
  Bot, X, Send, ChevronDown, Sparkles,
  TrendingUp, AlertTriangle, Award, Target,
  BarChart3, Lightbulb, MessageCircle,
} from 'lucide-react'
import api from '../lib/api'

interface Message {
  role: 'user' | 'ai'
  content: string
  ts: Date
}

const QUICK_PROMPTS = [
  { icon: '💰', text: 'Chi tiêu tháng này?', query: 'Chi tiêu tháng này của tôi thế nào?' },
  { icon: '🎯', text: 'Gợi ý tiết kiệm', query: 'Tôi nên tiết kiệm bao nhiêu mỗi tháng?' },
  { icon: '📊', text: 'Phân tích ngân sách', query: 'Phân tích ngân sách hiện tại của tôi' },
  { icon: '📈', text: 'Dự đoán chi tiêu', query: 'Dự đoán chi tiêu tháng tới của tôi' },
]

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  warning:     <AlertTriangle className="w-4 h-4 text-amber-400" />,
  tip:         <Lightbulb className="w-4 h-4 text-indigo-400" />,
  achievement: <Award className="w-4 h-4 text-amber-400" />,
  prediction:  <Target className="w-4 h-4 text-purple-400" />,
}

const MOCK_INSIGHTS = [
  { type: 'warning',     priority: 'high',   title: 'Ngân sách ăn uống sắp vượt', message: 'Bạn đã chi 85% ngân sách ăn uống. Còn 15% cho 10 ngày còn lại.' },
  { type: 'tip',         priority: 'medium', title: 'Cơ hội tiết kiệm', message: 'Cắt giảm chi tiêu giải trí 20% có thể tiết kiệm ~600,000đ/tháng.' },
  { type: 'achievement', priority: 'low',    title: '🎉 Mục tiêu đạt được!', message: 'Mục tiêu "Mua laptop" đã hoàn thành 100%. Xuất sắc!' },
  { type: 'prediction',  priority: 'medium', title: 'Dự báo tháng tới', message: 'Dựa trên xu hướng, chi tiêu tháng tới khoảng 9,200,000đ.' },
]

function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            background: '#818cf8',
            animation: `bounce 1.2s ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'chat' | 'insights'>('chat')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: '👋 Xin chào! Tôi là trợ lý tài chính AI của bạn. Hỏi tôi bất cứ điều gì về tài chính nhé!',
      ts: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg, ts: new Date() }])
    setLoading(true)

    try {
      const res = await api.post('/ai-advisor/chat', { message: msg })
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response || res.data.message, ts: new Date() }])
    } catch {
      // Fallback: rule-based response
      const fallbacks: Record<string, string> = {
        'chi tiêu': '📊 Tháng này bạn đã chi khoảng 8,500,000đ qua 45 giao dịch. Chi tiêu ở mức trung bình.',
        'tiết kiệm': '💡 Dựa trên thu nhập hiện tại, bạn nên tiết kiệm ít nhất 20% — tương đương 3,000,000đ/tháng.',
        'ngân sách': '📋 Ngân sách ăn uống đang ở 85%. Hãy kiểm soát chi tiêu 10 ngày còn lại!',
        'dự đoán': '📈 Dự báo tháng tới chi tiêu khoảng 9,200,000đ dựa trên xu hướng 3 tháng gần nhất.',
      }
      const key = Object.keys(fallbacks).find(k => msg.toLowerCase().includes(k))
      const response = key
        ? fallbacks[key]
        : '🤖 Tôi đang phân tích dữ liệu của bạn. Hãy thêm thông tin giao dịch để nhận tư vấn chính xác hơn!'
      setMessages(prev => [...prev, { role: 'ai', content: response, ts: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* FAB Button */}
      <button
        id="ai-chat-fab"
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 animate-pulse-glow"
        style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
        aria-label="AI Chat"
      >
        {open ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                style={{ background: '#f43f5e' }}
              >
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          id="ai-chat-panel"
          className="fixed bottom-24 right-6 z-50 w-96 rounded-2xl overflow-hidden flex flex-col animate-fade-in-up"
          style={{
            height: '560px',
            background: '#12121f',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">AI Financial Advisor</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s infinite' }} />
                  <p className="text-xs" style={{ color: '#34d399' }}>Online — GPT-4o-mini</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Tab switcher */}
              <button
                onClick={() => setTab('chat')}
                className={`p-1.5 rounded-lg transition-colors ${tab === 'chat' ? 'bg-indigo-500/30 text-indigo-300' : 'text-muted hover:bg-white/10'}`}
                title="Chat"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTab('insights')}
                className={`p-1.5 rounded-lg transition-colors ${tab === 'insights' ? 'bg-indigo-500/30 text-indigo-300' : 'text-muted hover:bg-white/10'}`}
                title="Insights"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:bg-white/10 transition-colors ml-1"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ===== TAB: CHAT ===== */}
          {tab === 'chat' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 self-end"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                      >
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className="max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={
                        msg.role === 'user'
                          ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderBottomRightRadius: 4 }
                          : { background: 'rgba(255,255,255,0.07)', color: '#f0f0ff', borderBottomLeftRadius: 4 }
                      }
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', borderBottomLeftRadius: 4 }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick Prompts */}
              <div
                className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="w-full text-xs text-muted pt-2 pb-1">Câu hỏi nhanh:</p>
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.query)}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all hover:scale-[1.03] disabled:opacity-50"
                    style={{
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      color: '#a5b4fc',
                    }}
                  >
                    <span>{p.icon}</span>
                    {p.text}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div
                className="p-3 flex gap-2 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Nhập câu hỏi tài chính..."
                  disabled={loading}
                  className="flex-1 text-sm rounded-xl px-3 py-2.5 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f0f0ff',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.25)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  aria-label="Gửi"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          )}

          {/* ===== TAB: INSIGHTS ===== */}
          {tab === 'insights' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <p className="text-sm font-semibold text-white">AI Phân tích tài chính</p>
              </div>
              {MOCK_INSIGHTS.map((ins, i) => {
                const priorityBg: Record<string, string> = {
                  high:   'rgba(244,63,94,0.1)',
                  medium: 'rgba(245,158,11,0.1)',
                  low:    'rgba(16,185,129,0.1)',
                }
                const priorityBorder: Record<string, string> = {
                  high:   'rgba(244,63,94,0.3)',
                  medium: 'rgba(245,158,11,0.3)',
                  low:    'rgba(16,185,129,0.3)',
                }
                return (
                  <div
                    key={i}
                    className="rounded-xl p-3.5 transition-all hover:scale-[1.01]"
                    style={{
                      background: priorityBg[ins.priority],
                      border: `1px solid ${priorityBorder[ins.priority]}`,
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      {INSIGHT_ICONS[ins.type]}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-tight">{ins.title}</p>
                        <p className="text-xs text-muted mt-1 leading-relaxed">{ins.message}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="text-center pt-2">
                <a href="/ai-insights" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Xem đầy đủ AI Insights →
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </>
  )
}
