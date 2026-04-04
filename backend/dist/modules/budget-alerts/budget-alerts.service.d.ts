import { Repository } from 'typeorm';
import { BudgetAlert } from '../../entities/budget-alert.entity';
import { Budget } from '../../entities/budget.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateBudgetAlertDto } from './dto/create-budget-alert.dto';
import { UpdateBudgetAlertDto } from './dto/update-budget-alert.dto';
export declare class BudgetAlertsService {
    private budgetAlertRepository;
    private budgetRepository;
    private transactionRepository;
    constructor(budgetAlertRepository: Repository<BudgetAlert>, budgetRepository: Repository<Budget>, transactionRepository: Repository<Transaction>);
    create(userId: number, dto: CreateBudgetAlertDto): Promise<BudgetAlert>;
    findAll(userId: number): Promise<BudgetAlert[]>;
    findOne(userId: number, id: number): Promise<BudgetAlert>;
    update(userId: number, id: number, dto: UpdateBudgetAlertDto): Promise<BudgetAlert>;
    remove(userId: number, id: number): Promise<{
        message: string;
    }>;
    checkBudgetStatus(userId: number, budgetId: number): Promise<{
        budgetId: number;
        categoryName: number;
        budgetAmount: number;
        spent: number;
        percentage: number;
        thresholdPercentage: number;
        isExceeded: boolean;
        hasAlert: boolean;
        message: string;
    }>;
}
