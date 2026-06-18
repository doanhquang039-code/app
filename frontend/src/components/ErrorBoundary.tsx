import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: string
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: '' }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.setState({ errorInfo: errorInfo.componentStack || '' })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: '' })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
          <div className="card max-w-lg w-full text-center" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(239,68,68,0.12)' }}
            >
              <AlertTriangle className="w-10 h-10 text-rose-400" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-white mb-2">Đã xảy ra lỗi</h2>
            <p className="text-muted text-sm mb-6">
              Ứng dụng gặp sự cố không mong muốn. Bạn có thể thử lại hoặc quay về trang chủ.
            </p>

            {/* Error detail (collapsible) */}
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-xs text-muted cursor-pointer hover:text-white transition-colors font-semibold">
                  Xem chi tiết lỗi
                </summary>
                <div
                  className="mt-2 p-3 rounded-xl text-xs font-mono overflow-auto max-h-40"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}
                >
                  <p className="font-bold mb-1">{this.state.error.message}</p>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap text-muted">{this.state.errorInfo}</pre>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button onClick={this.handleRetry} className="btn btn-primary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
              <button onClick={this.handleGoHome} className="btn btn-secondary flex items-center gap-2">
                <Home className="w-4 h-4" />
                Trang chủ
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
