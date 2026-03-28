import { User } from './user.entity';
export declare class Category {
    id: number;
    userId: number;
    name: string;
    icon: string;
    color: string;
    type: string;
    parentId: number;
    isDefault: boolean;
    isActive: boolean;
    user: User;
    parent: Category;
    children: Category[];
}
