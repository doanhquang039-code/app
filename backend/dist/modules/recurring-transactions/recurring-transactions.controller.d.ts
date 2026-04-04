import { RecurringTransactionsService } from './recurring-transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { QueryRecurringTransactionDto } from './dto/query-recurring-transaction.dto';
export declare class RecurringTransactionsController {
    private recurringService;
    constructor(recurringService: RecurringTransactionsService);
    create(req: any, dto: CreateRecurringTransactionDto): Promise<import("../../entities/recurring-transaction.entity").RecurringTransaction>;
    findAll(req: any, query: QueryRecurringTransactionDto): Promise<import("../../entities/recurring-transaction.entity").RecurringTransaction[]>;
    findOne(req: any, id: string): Promise<import("../../entities/recurring-transaction.entity").RecurringTransaction>;
    update(req: any, id: string, dto: UpdateRecurringTransactionDto): Promise<import("../../entities/recurring-transaction.entity").RecurringTransaction>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    toggleActive(req: any, id: string, body: {
        isActive: boolean;
    }): Promise<import("../../entities/recurring-transaction.entity").RecurringTransaction>;
}
