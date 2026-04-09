import { User } from './user.entity';
export declare class CreditCard {
    id: number;
    userId: number;
    cardholderName: string;
    cardNumber: string;
    cardType: string;
    issuingBank: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    creditLimit: number;
    currentBalance: number;
    interestRate: number;
    billingCycleDayOfMonth: number;
    icon: string;
    isActive: boolean;
    linkedWalletId: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
