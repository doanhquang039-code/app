import { BudgetAlertsService } from './budget-alerts.service';
import { CreateBudgetAlertDto } from './dto/create-budget-alert.dto';
import { UpdateBudgetAlertDto } from './dto/update-budget-alert.dto';
export declare class BudgetAlertsController {
    private budgetAlertsService;
    constructor(budgetAlertsService: BudgetAlertsService);
    create(req: any, dto: CreateBudgetAlertDto): Promise<import("../../entities/budget-alert.entity").BudgetAlert>;
    findAll(req: any): Promise<import("../../entities/budget-alert.entity").BudgetAlert[]>;
    findOne(req: any, id: string): Promise<import("../../entities/budget-alert.entity").BudgetAlert>;
    checkStatus(req: any, budgetId: string): Promise<{
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
    update(req: any, id: string, dto: UpdateBudgetAlertDto): Promise<import("../../entities/budget-alert.entity").BudgetAlert>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
