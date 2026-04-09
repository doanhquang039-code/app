import { SharedExpensesService } from './shared-expenses.service';
import { CreateGroupDto, CreateSharedExpenseDto, UpdateGroupDto } from './dto/shared-expense.dto';
export declare class SharedExpensesController {
    private readonly sharedExpensesService;
    constructor(sharedExpensesService: SharedExpensesService);
    createGroup(req: any, createGroupDto: CreateGroupDto): Promise<import("../../entities/shared-expense.entity").SharedExpenseGroup>;
    getGroups(req: any): Promise<import("../../entities/shared-expense.entity").SharedExpenseGroup[]>;
    getGroupDetails(groupId: string, req: any): Promise<import("../../entities/shared-expense.entity").SharedExpenseGroup | null>;
    updateGroup(groupId: string, req: any, updateGroupDto: UpdateGroupDto): Promise<import("../../entities/shared-expense.entity").SharedExpenseGroup>;
    deleteGroup(groupId: string, req: any): Promise<void>;
    addMember(groupId: string, memberId: string, req: any): Promise<import("../../entities/shared-expense.entity").SharedExpenseGroup>;
    removeMember(groupId: string, memberId: string, req: any): Promise<import("../../entities/shared-expense.entity").SharedExpenseGroup>;
    createExpense(groupId: string, req: any, createExpenseDto: CreateSharedExpenseDto): Promise<import("../../entities/shared-expense.entity").SharedExpense>;
    getGroupExpenses(groupId: string, req: any): Promise<import("../../entities/shared-expense.entity").SharedExpense[]>;
    getExpenseDetails(groupId: string, expenseId: string, req: any): Promise<import("../../entities/shared-expense.entity").SharedExpense>;
    deleteExpense(groupId: string, expenseId: string, req: any): Promise<void>;
    getSettlements(groupId: string, req: any): Promise<import("../../entities/shared-expense.entity").GroupSettlement[]>;
    getMySettlements(groupId: string, req: any): Promise<import("../../entities/shared-expense.entity").GroupSettlement[]>;
    settlePayment(settlementId: string, req: any): Promise<import("../../entities/shared-expense.entity").GroupSettlement>;
    getBalance(groupId: string, req: any): Promise<any>;
    getExpenseSummary(groupId: string, req: any): Promise<any>;
}
