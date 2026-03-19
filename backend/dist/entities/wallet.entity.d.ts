import { User } from './user.entity';
export declare class Wallet {
    id: number;
    userId: number;
    name: string;
    balance: number;
    icon: string;
    createdAt: Date;
    user: User;
}
