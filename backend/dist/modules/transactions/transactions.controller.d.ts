import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { BulkImportTransactionsDto } from './dto/bulk-import-transactions.dto';
import { TransactionsViewModel } from './transactions.view-model';
export declare class TransactionsController {
    private readonly viewModel;
    constructor(viewModel: TransactionsViewModel);
    create(req: any, dto: CreateTransactionDto): Promise<import("../../entities/transaction.entity").Transaction>;
    bulkCreate(req: any, dto: BulkImportTransactionsDto): Promise<{
        created: number;
        results: import("../../entities/transaction.entity").Transaction[];
        errors: {
            index: number;
            message: string;
        }[];
    }>;
    findAll(req: any, query: QueryTransactionDto): Promise<import("../../entities/transaction.entity").Transaction[]>;
    getSummary(req: any, month: string): Promise<{
        totalIncome: number;
        totalExpense: number;
        balance: number;
        income: number;
        expense: number;
    }>;
    findOne(req: any, id: string): Promise<import("../../entities/transaction.entity").Transaction>;
    update(req: any, id: string, dto: UpdateTransactionDto): Promise<import("../../entities/transaction.entity").Transaction>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
