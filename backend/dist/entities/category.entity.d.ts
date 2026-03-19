import { User } from './user.entity';
export declare class Category {
    id: number;
    userId: number;
    name: string;
    icon: string;
    type: string;
    user: User;
}
