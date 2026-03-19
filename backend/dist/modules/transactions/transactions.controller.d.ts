import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    create(req: any, dto: CreateTransactionDto): Promise<import("../../entities/transaction.entity").Transaction>;
    findAll(req: any, query: QueryTransactionDto): Promise<import("../../entities/transaction.entity").Transaction[]>;
    getSummary(req: any, month: string): Promise<{
        income: any;
        expense: any;
        balance: number;
    }>;
    findOne(req: any, id: string): Promise<import("../../entities/transaction.entity").Transaction>;
    update(req: any, id: string, dto: UpdateTransactionDto): Promise<import("../../entities/transaction.entity").Transaction>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
