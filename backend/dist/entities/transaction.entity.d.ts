import { User } from './user.entity';
import { Wallet } from './wallet.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
export declare class Transaction {
    id: number;
    userId: number;
    walletId: number;
    categoryId: number;
    amount: number;
    type: string;
    note: string;
    date: Date;
    createdAt: Date;
    user: User;
    wallet: Wallet;
    category: Category;
    tags: Tag[];
}
