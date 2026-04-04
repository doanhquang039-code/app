import { User } from './user.entity';
import { Transaction } from './transaction.entity';
export declare class Tag {
    id: number;
    userId: number;
    name: string;
    color: string;
    icon: string;
    createdAt: Date;
    user: User;
    transactions: Transaction[];
}
