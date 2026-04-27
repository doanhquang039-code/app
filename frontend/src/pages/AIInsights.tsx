import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { toast } from 'sonner'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Sparkles,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Activity,
} from 'lucide-react'

interface Pattern {
  id: number
  patternType: string
  category: string
  description: string
  confidence: number
  insights: string
  detectedAt: string
}

interface Anomaly {
  id: number
  transactionId: number
  severity: string
  reason: string
  expectedAmount: number
  actualAmount: number
  status: string
  reviewedAt?: string
  reviewNote?: string
  detectedAt: string
}

interface Prediction {
  id: number
  category: string
  predictedAmount: number
  confidence: number
  predictionMonth: string
  insights: string
  createdAt: string
}

interface Recommendation {
  type: string
  priority: string
  message: string
  action: string
}

export default function AIInsights() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'anomalies' | 'predictions'>('overview')

  // Fetch insights overview
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const { data } = await api.get('/ai-analysis/insights')
      return data
    },
  })

  // Fetch patterns
  const { data: patterns, isLoading: patternsLoading } = useQuery({
    queryKey: ['ai-patterns'],
    queryFn: async () => {
      const { data } = await api.get('/ai-analysis/patterns')
      return data
    },
    enabled: activeTab === 'patterns',
  })

  // Fetch anomalies
  const { data: anomalies, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['ai-anomalies'],
    queryFn: async () => {
      const { data } = await api.get('/ai-analysis/anomalies')
      return data
    },
    enabled: activeTab === 'anomalies',
  })

  // Fetch predictions
  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['ai-predictions'],
    queryFn: async () => {
      const { data } = await api.get('/ai-analysis/predictions')
      return data
    },
    enabled: activeTab === 'predictions',
  })

  // Analyze patterns mutation
  const analyzePatternsMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/ai-analysis/patterns/analyze')
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Đã phân tích mẫu chi tiêu')
      queryClient.invalidateQueries({ queryKey: ['ai-patterns'] })
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
    },
    onError: () => {
      toast.error('Không thể phân tích mẫu chi tiêu')
    },
  })

  // Detect anomalies mutation
  const detectAnomaliesMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/ai-analysis/anomalies/detect')
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Đã phát hiện chi tiêu bất thường')
      queryClient.invalidateQueries({ queryKey: ['ai-anomalies'] })
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
    },
    onError: () => {
      toast.error('Không thể phát hiện chi tiêu bất thường')
    },
  })

  // Generate predictions mutation
  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/ai-analysis/predictions/generate')
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Đã tạo dự đoán chi tiêu')
      queryClient.invalidateQueries({ queryKey: ['ai-predictions'] })
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
    },
    onError: () => {
      toast.error('Không thể tạo dự đoán chi tiêu')
    },
  })

  // Update anomaly status mutation
  const updateAnomalyMutation = useMutation({
    mutationFn: async ({ anomalyId, status, note }: { anomalyId: number; status: string; note?: string }) => {
      const { data } = await api.put(`/ai-analysis/anomalies/${anomalyId}/status`, { status, note })
      return data
    },
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái')
      queryClient.invalidateQueries({ queryKey: ['ai-anomalies'] })
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái')
    },
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50'
      case 'HIGH':
        return 'text-orange-600 bg-orange-50'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50'
      case 'LOW':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getPatternTypeIcon = (type: string) => {
    switch (type) {
      case 'RECURRING':
        return <Clock className="w-5 h-5" />
      case 'SEASONAL':
        return <Calendar className="w-5 h-5" />
      case 'TREND':
        return <TrendingUp className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600 mt-1">Phân tích thông minh chi tiêu của bạn</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => analyzePatternsMutation.mutate()}
            disabled={analyzePatternsMutation.isPending}
            className="btn-secondary flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Phân tích mẫu
          </button>
          <button
            onClick={() => detectAnomaliesMutation.mutate()}
            disabled={detectAnomaliesMutation.isPending}
            className="btn-secondary flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Phát hiện bất thường
          </button>
          <button
            onClick={() => generatePredictionsMutation.mutate()}
            disabled={generatePredictionsMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Dự đoán chi tiêu
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'patterns'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Mẫu chi tiêu
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'anomalies'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Chi tiêu bất thường
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'predictions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Dự đoán
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mẫu phát hiện</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {insights?.summary?.patternsDetected || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Chi tiêu bất thường</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {insights?.summary?.anomaliesFound || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dự đoán</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {insights?.summary?.predictionsGenerated || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {insights?.recommendations && insights.recommendations.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Khuyến nghị từ AI</h3>
              <div className="space-y-3">
                {insights.recommendations.map((rec: Recommendation, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'HIGH'
                        ? 'bg-red-50 border-red-500'
                        : rec.priority === 'MEDIUM'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{rec.message}</p>
                        <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Patterns */}
          {insights?.patterns && insights.patterns.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mẫu chi tiêu gần đây</h3>
              <div className="space-y-3">
                {insights.patterns.map((pattern: Pattern) => (
                  <div key={pattern.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-blue-600">{getPatternTypeIcon(pattern.patternType)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{pattern.category}</p>
                        <span className="text-sm text-gray-600">{pattern.confidence}% độ tin cậy</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          {patternsLoading ? (
            <div className="card text-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Đang tải mẫu chi tiêu...</p>
            </div>
          ) : patterns && patterns.length > 0 ? (
            patterns.map((pattern: Pattern) => (
              <div key={pattern.id} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getPatternTypeIcon(pattern.patternType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{pattern.category}</h3>
                        <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {pattern.confidence}% tin cậy
                      </span>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{pattern.insights}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Phát hiện: {new Date(pattern.detectedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Chưa có mẫu chi tiêu nào được phát hiện</p>
              <button
                onClick={() => analyzePatternsMutation.mutate()}
                className="btn-primary mt-4"
              >
                Phân tích ngay
              </button>
            </div>
          )}
        </div>
      )}

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          {anomaliesLoading ? (
            <div className="card text-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Đang tải chi tiêu bất thường...</p>
            </div>
          ) : anomalies && anomalies.length > 0 ? (
            anomalies.map((anomaly: Anomaly) => (
              <div key={anomaly.id} className="card">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getSeverityColor(anomaly.severity)}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">Giao dịch #{anomaly.transactionId}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                            {anomaly.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{anomaly.reason}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Số tiền dự kiến</p>
                        <p className="text-sm font-medium text-gray-900">
                          {anomaly.expectedAmount.toLocaleString()}đ
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Số tiền thực tế</p>
                        <p className="text-sm font-medium text-red-600">
                          {anomaly.actualAmount.toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                    {anomaly.status === 'UNREVIEWED' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            updateAnomalyMutation.mutate({
                              anomalyId: anomaly.id,
                              status: 'CONFIRMED',
                              note: 'Xác nhận là bất thường',
                            })
                          }
                          className="btn-sm bg-red-600 text-white hover:bg-red-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Xác nhận
                        </button>
                        <button
                          onClick={() =>
                            updateAnomalyMutation.mutate({
                              anomalyId: anomaly.id,
                              status: 'FALSE_POSITIVE',
                              note: 'Không phải bất thường',
                            })
                          }
                          className="btn-sm bg-gray-600 text-white hover:bg-gray-700"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Bỏ qua
                        </button>
                      </div>
                    )}
                    {anomaly.status !== 'UNREVIEWED' && (
                      <div className="mt-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          anomaly.status === 'CONFIRMED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {anomaly.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã bỏ qua'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Không có chi tiêu bất thường nào</p>
              <button
                onClick={() => detectAnomaliesMutation.mutate()}
                className="btn-primary mt-4"
              >
                Phát hiện ngay
              </button>
            </div>
          )}
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-4">
          {predictionsLoading ? (
            <div className="card text-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Đang tải dự đoán...</p>
            </div>
          ) : predictions && predictions.length > 0 ? (
            predictions.map((prediction: Prediction) => (
              <div key={prediction.id} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{prediction.category}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Tháng {new Date(prediction.predictionMonth).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round(prediction.predictedAmount).toLocaleString()}đ
                        </p>
                        <span className="text-sm text-gray-600">{prediction.confidence}% tin cậy</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{prediction.insights}</p>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Chưa có dự đoán nào</p>
              <button
                onClick={() => generatePredictionsMutation.mutate()}
                className="btn-primary mt-4"
              >
                Tạo dự đoán
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
