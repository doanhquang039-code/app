import { User } from './user.entity';
import { Category } from './category.entity';
export declare class Budget {
    id: number;
    userId: number;
    categoryId: number;
    amount: number;
    month: string;
    createdAt: Date;
    user: User;
    category: Category;
}
