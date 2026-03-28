export declare class CreateCategoryDto {
    name: string;
    icon?: string;
    color?: string;
    type: 'income' | 'expense';
    parentId?: number;
    isDefault?: boolean;
}
export declare class UpdateCategoryDto {
    name?: string;
    icon?: string;
    color?: string;
    type?: 'income' | 'expense';
    parentId?: number;
    isDefault?: boolean;
    isActive?: boolean;
}
