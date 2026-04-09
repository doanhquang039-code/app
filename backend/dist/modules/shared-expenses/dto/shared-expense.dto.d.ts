export declare class CreateGroupDto {
    groupName: string;
    description?: string;
    icon?: string;
}
export declare class UpdateGroupDto {
    groupName?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
}
export declare class CreateSharedExpenseDto {
    description: string;
    amount: number;
    splits: string;
    date?: string;
}
