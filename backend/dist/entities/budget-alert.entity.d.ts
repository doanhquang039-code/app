import { User } from './user.entity';
import { Budget } from './budget.entity';
export declare class BudgetAlert {
    id: number;
    userId: number;
    budgetId: number;
    thresholdPercentage: number;
    enabled: boolean;
    notified: boolean;
    lastNotificationDate: Date;
    createdAt: Date;
    user: User;
    budget: Budget;
}
