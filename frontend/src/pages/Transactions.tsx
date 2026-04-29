import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Search, TrendingUp, TrendingDown, Edit, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import api from '../lib/api'
import TransactionModal from '../components/transactions/TransactionModal'

export default function Transactions() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')

  const { data: transactions, isLoading } = useQuery('transactions', async () => {
    const response = await api.get('/transactions')
    return response.data
  })

  const { data: categories } = useQuery('categories', async () => {
    const response = await api.get('/categories')
    return response.data
  })

  const deleteMutation = useMutation(
    (id: number) => api.delete(`/transactions/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('transactions')
        toast.success('Đã xóa giao dịch')
      },
      onError: () => {
        toast.error('Xóa giao dịch thất bại')
      },
    }
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const filteredTransactions = transactions?.filter((t: any) => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'ALL' || t.type === filterType
    return matchesSearch && matchesType
  })

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa giao dịch này?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.post('/export-import/export', {
        exportType: 'EXCEL',
        dataType: 'TRANSACTIONS',
      })
      toast.success('Đang xuất file...')
      // Download file
      const downloadResponse = await api.get(`/export-import/download/${response.data.id}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', response.data.fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('Xuất file thất bại')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Giao dịch</h1>
          <p className="text-gray-600 mt-1">Quản lý thu chi của bạn</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Xuất Excel
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null)
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm giao dịch
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'ALL'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('INCOME')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'INCOME'
                  ? 'bg-success-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Thu nhập
            </button>
            <button
              onClick={() => setFilterType('EXPENSE')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'EXPENSE'
                  ? 'bg-danger-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chi tiêu
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải...</p>
          </div>
        ) : filteredTransactions?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có giao dịch nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mô tả</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Danh mục</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ví</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Số tiền</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions?.map((transaction: any) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'INCOME'
                              ? 'bg-success-100 text-success-600'
                              : 'bg-danger-100 text-danger-600'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          {transaction.notes && (
                            <p className="text-sm text-gray-500">{transaction.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {transaction.category?.name || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.wallet?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold ${
                          transaction.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          categories={categories}
          onClose={() => {
            setShowModal(false)
            setEditingTransaction(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries('transactions')
            setShowModal(false)
            setEditingTransaction(null)
          }}
        />
      )}
    </div>
  )
}
