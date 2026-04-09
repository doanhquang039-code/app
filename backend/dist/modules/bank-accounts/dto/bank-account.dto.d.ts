export declare class CreateBankAccountDto {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    accountType?: string;
    balance?: number;
    branchCode?: string;
    ifscCode?: string;
    routingNumber?: string;
    swiftCode?: string;
    icon?: string;
    linkedWalletId?: number;
}
export declare class UpdateBankAccountDto {
    bankName?: string;
    accountHolder?: string;
    accountType?: string;
    balance?: number;
    branchCode?: string;
    icon?: string;
    isActive?: boolean;
    linkedWalletId?: number;
}
