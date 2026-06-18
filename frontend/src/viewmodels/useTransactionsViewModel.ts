import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  TransactionFilterType,
  TransactionModel,
} from '../models/transaction'
import { transactionService } from '../services/transactionService'

export function useTransactionsViewModel() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionModel | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<TransactionFilterType>('ALL')

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionService.listTransactions,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: transactionService.listCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Đã xóa giao dịch')
    },
    onError: () => {
      toast.error('Xóa giao dịch thất bại')
    },
  })

  const filteredTransactions = useMemo(() => {
    return transactions?.filter((transaction) => {
      const normalizedSearch = searchTerm.toLowerCase()
      const matchesSearch =
        transaction.description?.toLowerCase().includes(normalizedSearch) ||
        transaction.category?.name?.toLowerCase().includes(normalizedSearch)
      const matchesType = filterType === 'ALL' || transaction.type === filterType
      return matchesSearch && matchesType
    })
  }, [filterType, searchTerm, transactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const openCreateModal = () => {
    setEditingTransaction(null)
    setShowModal(true)
  }

  const openEditModal = (transaction: TransactionModel) => {
    setEditingTransaction(transaction)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTransaction(null)
  }

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    closeModal()
  }

  const deleteTransaction = (id: number) => {
    if (window.confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a giao dá»‹ch nÃ y?')) {
      deleteMutation.mutate(id)
    }
  }

  const exportTransactions = async () => {
    try {
      const exportRequest = await transactionService.requestExport()
      toast.success('Äang xuáº¥t file...')

      const download = await transactionService.downloadExport(exportRequest.id)
      const url = window.URL.createObjectURL(new Blob([download]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', exportRequest.fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Xuáº¥t file tháº¥t báº¡i')
    }
  }

  return {
    categories,
    editingTransaction,
    filterType,
    filteredTransactions,
    formatCurrency,
    isLoading,
    searchTerm,
    showModal,
    closeModal,
    deleteTransaction,
    exportTransactions,
    handleMutationSuccess,
    openCreateModal,
    openEditModal,
    setFilterType,
    setSearchTerm,
  }
}
