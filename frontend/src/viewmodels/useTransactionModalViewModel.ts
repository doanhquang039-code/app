import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { toast } from 'sonner'
import {
  TransactionFormModel,
  TransactionModel,
} from '../models/transaction'
import { transactionService } from '../services/transactionService'

interface UseTransactionModalViewModelProps {
  transaction?: TransactionModel | null
  onSuccess: () => void
}

export function useTransactionModalViewModel({
  transaction,
  onSuccess,
}: UseTransactionModalViewModelProps) {
  const form = useForm<TransactionFormModel>({
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          categoryId: transaction.categoryId,
          walletId: transaction.walletId,
          date: new Date(transaction.date).toISOString().split('T')[0],
          notes: transaction.notes,
        }
      : {
          type: 'EXPENSE',
          date: new Date().toISOString().split('T')[0],
        },
  })

  const mutation = useMutation(
    (data: TransactionFormModel) => {
      if (transaction) {
        return transactionService.updateTransaction(transaction.id, data)
      }
      return transactionService.createTransaction(data)
    },
    {
      onSuccess: () => {
        toast.success(transaction ? 'ÄÃ£ cáº­p nháº­t giao dá»‹ch' : 'ÄÃ£ thÃªm giao dá»‹ch')
        onSuccess()
      },
      onError: () => {
        toast.error('CÃ³ lá»—i xáº£y ra')
      },
    },
  )

  return {
    errors: form.formState.errors,
    handleSubmit: form.handleSubmit((data) => mutation.mutate(data)),
    isSaving: mutation.isLoading,
    register: form.register,
    transactionType: form.watch('type'),
  }
}
