export declare enum ExportType {
    EXCEL = "EXCEL",
    CSV = "CSV",
    PDF = "PDF",
    JSON = "JSON"
}
export declare enum DataType {
    TRANSACTIONS = "TRANSACTIONS",
    BUDGETS = "BUDGETS",
    SAVINGS_GOALS = "SAVINGS_GOALS",
    BILLS = "BILLS",
    BANK_ACCOUNTS = "BANK_ACCOUNTS",
    CREDIT_CARDS = "CREDIT_CARDS",
    REPORTS = "REPORTS",
    ALL = "ALL"
}
export declare class ExportDataDto {
    exportType: ExportType;
    dataType: DataType;
    startDate?: string;
    endDate?: string;
    categoryIds?: number[];
    walletIds?: number[];
    includeAttachments?: boolean;
}
export declare class ImportDataDto {
    dataType: DataType;
    overwriteExisting?: boolean;
    skipDuplicates?: boolean;
}
