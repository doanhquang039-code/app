-- Migration: Add Analytics, SharedExpenses, FinancialReports, MultiCurrency tables
-- Created: 2026-04-09

-- Create AnalyticsData Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AnalyticsData')
BEGIN
    CREATE TABLE AnalyticsData (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        date DATETIME2 NOT NULL,
        totalIncome DECIMAL(18, 2) NOT NULL,
        totalExpense DECIMAL(18, 2) NOT NULL,
        savingsAmount DECIMAL(18, 2) NOT NULL,
        savingsRatePercentage DECIMAL(5, 2) NULL,
        period NVARCHAR(50) NULL,
        categoryBreakdown NVARCHAR(MAX) NULL,
        trends NVARCHAR(MAX) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_AnalyticsData_userId ON AnalyticsData(userId);
    CREATE INDEX idx_AnalyticsData_date ON AnalyticsData(date);
    PRINT 'AnalyticsData table created successfully';
END;

-- Create SpendingForecasts Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SpendingForecasts')
BEGIN
    CREATE TABLE SpendingForecasts (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        categoryId INT NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        predictedAmount DECIMAL(18, 2) NOT NULL,
        actualAmount DECIMAL(18, 2) NULL,
        confidence DECIMAL(5, 2) NOT NULL,
        notes NVARCHAR(MAX) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_SpendingForecasts_userId ON SpendingForecasts(userId);
    CREATE INDEX idx_SpendingForecasts_month_year ON SpendingForecasts(month, year);
    PRINT 'SpendingForecasts table created successfully';
END;

-- Create SharedExpenseGroups Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SharedExpenseGroups')
BEGIN
    CREATE TABLE SharedExpenseGroups (
        id INT PRIMARY KEY IDENTITY(1,1),
        groupName NVARCHAR(255) NOT NULL,
        ownerId INT NOT NULL,
        description NVARCHAR(MAX) NULL,
        totalAmount DECIMAL(18, 2) DEFAULT 0,
        icon NVARCHAR(255) NULL,
        isActive BIT DEFAULT 1,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (ownerId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_SharedExpenseGroups_ownerId ON SharedExpenseGroups(ownerId);
    CREATE INDEX idx_SharedExpenseGroups_isActive ON SharedExpenseGroups(isActive);
    PRINT 'SharedExpenseGroups table created successfully';
END;

-- Create group_members junction table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'group_members')
BEGIN
    CREATE TABLE group_members (
        groupId INT NOT NULL,
        userId INT NOT NULL,
        PRIMARY KEY (groupId, userId),
        FOREIGN KEY (groupId) REFERENCES SharedExpenseGroups(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_group_members_userId ON group_members(userId);
    PRINT 'group_members junction table created successfully';
END;

-- Create SharedExpenses Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SharedExpenses')
BEGIN
    CREATE TABLE SharedExpenses (
        id INT PRIMARY KEY IDENTITY(1,1),
        groupId INT NOT NULL,
        paidByUserId INT NOT NULL,
        description NVARCHAR(255) NOT NULL,
        amount DECIMAL(18, 2) NOT NULL,
        splits NVARCHAR(MAX) NOT NULL,
        date DATETIME2 NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (groupId) REFERENCES SharedExpenseGroups(id) ON DELETE CASCADE,
        FOREIGN KEY (paidByUserId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_SharedExpenses_groupId ON SharedExpenses(groupId);
    CREATE INDEX idx_SharedExpenses_paidByUserId ON SharedExpenses(paidByUserId);
    PRINT 'SharedExpenses table created successfully';
END;

-- Create GroupSettlements Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GroupSettlements')
BEGIN
    CREATE TABLE GroupSettlements (
        id INT PRIMARY KEY IDENTITY(1,1),
        groupId INT NOT NULL,
        fromUserId INT NOT NULL,
        toUserId INT NOT NULL,
        amount DECIMAL(18, 2) NOT NULL,
        isSettled BIT DEFAULT 0,
        settledDate DATETIME2 NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (groupId) REFERENCES SharedExpenseGroups(id) ON DELETE CASCADE,
        FOREIGN KEY (fromUserId) REFERENCES Users(id),
        FOREIGN KEY (toUserId) REFERENCES Users(id)
    );
    
    CREATE INDEX idx_GroupSettlements_groupId ON GroupSettlements(groupId);
    CREATE INDEX idx_GroupSettlements_fromUserId ON GroupSettlements(fromUserId);
    CREATE INDEX idx_GroupSettlements_toUserId ON GroupSettlements(toUserId);
    CREATE INDEX idx_GroupSettlements_isSettled ON GroupSettlements(isSettled);
    PRINT 'GroupSettlements table created successfully';
END;

-- Create FinancialReports Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FinancialReports')
BEGIN
    CREATE TABLE FinancialReports (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        reportType NVARCHAR(50) NOT NULL,
        reportData NVARCHAR(MAX) NOT NULL,
        totalIncome DECIMAL(18, 2) NOT NULL,
        totalExpense DECIMAL(18, 2) NOT NULL,
        netSavings DECIMAL(18, 2) NOT NULL,
        filePath NVARCHAR(MAX) NULL,
        status NVARCHAR(50) DEFAULT 'pending',
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_FinancialReports_userId ON FinancialReports(userId);
    CREATE INDEX idx_FinancialReports_month_year ON FinancialReports(month, year);
    CREATE INDEX idx_FinancialReports_reportType ON FinancialReports(reportType);
    PRINT 'FinancialReports table created successfully';
END;

-- Create Currencies Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Currencies')
BEGIN
    CREATE TABLE Currencies (
        id INT PRIMARY KEY IDENTITY(1,1),
        code NVARCHAR(10) UNIQUE NOT NULL,
        name NVARCHAR(255) NOT NULL,
        symbol NVARCHAR(10) NOT NULL,
        exchangeRate DECIMAL(18, 8) DEFAULT 1,
        icon NVARCHAR(255) NULL,
        isActive BIT DEFAULT 1,
        createdAt DATETIME2 DEFAULT GETDATE()
    );
    
    CREATE INDEX idx_Currencies_code ON Currencies(code);
    PRINT 'Currencies table created successfully';
END;

-- Create MultiCurrencyWallets Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MultiCurrencyWallets')
BEGIN
    CREATE TABLE MultiCurrencyWallets (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        walletId INT NOT NULL,
        currencyCode NVARCHAR(10) NOT NULL,
        balance DECIMAL(18, 2) DEFAULT 0,
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (walletId) REFERENCES Wallets(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_MultiCurrencyWallets_userId ON MultiCurrencyWallets(userId);
    CREATE INDEX idx_MultiCurrencyWallets_walletId ON MultiCurrencyWallets(walletId);
    CREATE INDEX idx_MultiCurrencyWallets_currencyCode ON MultiCurrencyWallets(currencyCode);
    PRINT 'MultiCurrencyWallets table created successfully';
END;

-- Create ExchangeRateHistories Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ExchangeRateHistories')
BEGIN
    CREATE TABLE ExchangeRateHistories (
        id INT PRIMARY KEY IDENTITY(1,1),
        fromCurrency NVARCHAR(10) NOT NULL,
        toCurrency NVARCHAR(10) NOT NULL,
        rate DECIMAL(18, 8) NOT NULL,
        date DATETIME2 NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE()
    );
    
    CREATE INDEX idx_ExchangeRateHistories_currencies ON ExchangeRateHistories(fromCurrency, toCurrency);
    CREATE INDEX idx_ExchangeRateHistories_date ON ExchangeRateHistories(date);
    PRINT 'ExchangeRateHistories table created successfully';
END;

-- Insert default currencies
IF NOT EXISTS (SELECT * FROM Currencies WHERE code = 'USD')
BEGIN
    INSERT INTO Currencies (code, name, symbol, exchangeRate, isActive)
    VALUES 
        ('USD', 'US Dollar', '$', 1.00000000, 1),
        ('EUR', 'Euro', '€', 0.92000000, 1),
        ('GBP', 'British Pound', '£', 0.79000000, 1),
        ('JPY', 'Japanese Yen', '¥', 149.50000000, 1),
        ('VND', 'Vietnamese Dong', '₫', 24500.00000000, 1),
        ('CNY', 'Chinese Yuan', '¥', 7.25000000, 1);
    PRINT 'Default currencies inserted successfully';
END;

PRINT 'All new feature tables created successfully!';