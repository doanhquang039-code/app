import { ScheduledTransactionsService } from './scheduled-transactions.service';
export declare class ScheduledTransactionsController {
    private readonly scheduledService;
    constructor(scheduledService: ScheduledTransactionsService);
    create(req: any, data: any): Promise<import("../../entities/scheduled-transaction.entity").ScheduledTransaction>;
    findAll(req: any): Promise<import("../../entities/scheduled-transaction.entity").ScheduledTransaction[]>;
    getUpcoming(req: any): Promise<import("../../entities/scheduled-transaction.entity").ScheduledTransaction[]>;
    findOne(req: any, id: number): Promise<import("../../entities/scheduled-transaction.entity").ScheduledTransaction>;
    update(req: any, id: number, data: any): Promise<import("../../entities/scheduled-transaction.entity").ScheduledTransaction>;
    pause(req: any, id: number): Promise<import("../../entities/scheduled-transaction.entity").ScheduledTransaction>;
    resume(req: any, id: number): Promise<import("../../entities/scheduled-transaction.entity").ScheduledTransaction>;
    executeNow(req: any, id: number): Promise<import("../../entities/transaction.entity").Transaction>;
    remove(req: any, id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
