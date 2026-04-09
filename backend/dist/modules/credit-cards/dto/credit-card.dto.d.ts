export declare class CreateCreditCardDto {
    cardholderName: string;
    cardNumber: string;
    cardType: string;
    issuingBank: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    creditLimit: number;
    currentBalance?: number;
    interestRate?: number;
    billingCycleDayOfMonth?: number;
    icon?: string;
    linkedWalletId?: number;
}
export declare class UpdateCreditCardDto {
    cardholderName?: string;
    cardType?: string;
    currentBalance?: number;
    creditLimit?: number;
    interestRate?: number;
    billingCycleDayOfMonth?: number;
    icon?: string;
    isActive?: boolean;
    linkedWalletId?: number;
}
