-- Migration: Expand Database - Add UserProfiles, TransactionAttachments, Debts, Investments, AuditLogs
-- Created: 2026-04-19

-- =====================================================
-- 1. UserProfiles - Extended user profile information
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserProfiles')
BEGIN
    CREATE TABLE UserProfiles (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL UNIQUE,
        avatarUrl NVARCHAR(500) NULL,
        phoneNumber NVARCHAR(20) NULL,
        dateOfBirth DATETIME2 NULL,
        gender NVARCHAR(20) NULL,
        address NVARCHAR(500) NULL,
        city NVARCHAR(100) NULL,
        country NVARCHAR(100) NULL,
        defaultCurrency NVARCHAR(10) DEFAULT 'VND',
        language NVARCHAR(10) DEFAULT 'vi',
        timezone NVARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
        monthlyIncomeTarget DECIMAL(18, 2) NULL,
        monthlyExpenseLimit DECIMAL(18, 2) NULL,
        notificationEnabled BIT DEFAULT 1,
        emailNotification BIT DEFAULT 1,
        darkMode BIT DEFAULT 1,
        biometricEnabled BIT DEFAULT 0,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX idx_UserProfiles_userId ON UserProfiles(userId);
    PRINT 'UserProfiles table created successfully';
END;

-- =====================================================
-- 2. TransactionAttachments - Receipts, images for transactions
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TransactionAttachments')
BEGIN
    CREATE TABLE TransactionAttachments (
        id INT PRIMARY KEY IDENTITY(1,1),
        transactionId INT NOT NULL,
        userId INT NOT NULL,
        fileName NVARCHAR(255) NOT NULL,
        fileUrl NVARCHAR(500) NOT NULL,
        fileType NVARCHAR(50) NOT NULL, -- image/jpeg, image/png, application/pdf
        fileSize INT NULL, -- in bytes
        thumbnailUrl NVARCHAR(500) NULL,
        description NVARCHAR(255) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (transactionId) REFERENCES Transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id)
    );

    CREATE INDEX idx_TransactionAttachments_transactionId ON TransactionAttachments(transactionId);
    CREATE INDEX idx_TransactionAttachments_userId ON TransactionAttachments(userId);
    PRINT 'TransactionAttachments table created successfully';
END;

-- =====================================================
-- 3. Debts - Track personal debts and loans
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Debts')
BEGIN
    CREATE TABLE Debts (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        type NVARCHAR(20) NOT NULL, -- 'lend' (cho vay) or 'borrow' (vay)
        personName NVARCHAR(255) NOT NULL, -- Tên người cho vay/vay
        personPhone NVARCHAR(20) NULL,
        personEmail NVARCHAR(255) NULL,
        totalAmount DECIMAL(18, 2) NOT NULL,
        paidAmount DECIMAL(18, 2) DEFAULT 0,
        remainingAmount AS (totalAmount - paidAmount), -- Computed column
        currency NVARCHAR(10) DEFAULT 'VND',
        interestRate DECIMAL(5, 2) NULL, -- % per year
        startDate DATETIME2 NOT NULL,
        dueDate DATETIME2 NULL,
        status NVARCHAR(20) DEFAULT 'active', -- active, paid, overdue, cancelled
        reminderEnabled BIT DEFAULT 1,
        reminderDaysBefore INT DEFAULT 3,
        notes NVARCHAR(MAX) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_Debts_userId ON Debts(userId);
    CREATE INDEX idx_Debts_type ON Debts(type);
    CREATE INDEX idx_Debts_status ON Debts(status);
    CREATE INDEX idx_Debts_dueDate ON Debts(dueDate);
    PRINT 'Debts table created successfully';
END;

-- =====================================================
-- 4. DebtPayments - Track debt payment history
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DebtPayments')
BEGIN
    CREATE TABLE DebtPayments (
        id INT PRIMARY KEY IDENTITY(1,1),
        debtId INT NOT NULL,
        userId INT NOT NULL,
        amount DECIMAL(18, 2) NOT NULL,
        paymentDate DATETIME2 NOT NULL,
        paymentMethod NVARCHAR(50) NULL, -- cash, bank_transfer, wallet
        note NVARCHAR(255) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (debtId) REFERENCES Debts(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id)
    );

    CREATE INDEX idx_DebtPayments_debtId ON DebtPayments(debtId);
    CREATE INDEX idx_DebtPayments_userId ON DebtPayments(userId);
    CREATE INDEX idx_DebtPayments_paymentDate ON DebtPayments(paymentDate);
    PRINT 'DebtPayments table created successfully';
END;

-- =====================================================
-- 5. Investments - Track investment portfolio
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Investments')
BEGIN
    CREATE TABLE Investments (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        name NVARCHAR(255) NOT NULL,
        type NVARCHAR(50) NOT NULL, -- stock, crypto, mutual_fund, gold, real_estate, bond, savings_deposit
        symbol NVARCHAR(20) NULL, -- Mã chứng khoán, crypto
        quantity DECIMAL(18, 8) NULL, -- Số lượng cổ phiếu/coin
        buyPrice DECIMAL(18, 2) NOT NULL, -- Giá mua
        currentPrice DECIMAL(18, 2) NULL, -- Giá hiện tại
        totalInvested DECIMAL(18, 2) NOT NULL, -- Tổng tiền đầu tư
        currentValue DECIMAL(18, 2) NULL, -- Giá trị hiện tại
        profitLoss DECIMAL(18, 2) NULL, -- Lãi/lỗ
        profitLossPercentage DECIMAL(8, 2) NULL, -- % lãi/lỗ
        currency NVARCHAR(10) DEFAULT 'VND',
        platform NVARCHAR(100) NULL, -- Sàn giao dịch
        buyDate DATETIME2 NOT NULL,
        sellDate DATETIME2 NULL,
        status NVARCHAR(20) DEFAULT 'holding', -- holding, sold, matured
        notes NVARCHAR(MAX) NULL,
        icon NVARCHAR(255) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_Investments_userId ON Investments(userId);
    CREATE INDEX idx_Investments_type ON Investments(type);
    CREATE INDEX idx_Investments_status ON Investments(status);
    CREATE INDEX idx_Investments_symbol ON Investments(symbol);
    PRINT 'Investments table created successfully';
END;

-- =====================================================
-- 6. InvestmentTransactions - Buy/Sell history
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InvestmentTransactions')
BEGIN
    CREATE TABLE InvestmentTransactions (
        id INT PRIMARY KEY IDENTITY(1,1),
        investmentId INT NOT NULL,
        userId INT NOT NULL,
        type NVARCHAR(20) NOT NULL, -- buy, sell, dividend, interest
        quantity DECIMAL(18, 8) NULL,
        price DECIMAL(18, 2) NOT NULL,
        totalAmount DECIMAL(18, 2) NOT NULL,
        fee DECIMAL(18, 2) DEFAULT 0,
        transactionDate DATETIME2 NOT NULL,
        note NVARCHAR(255) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (investmentId) REFERENCES Investments(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id)
    );

    CREATE INDEX idx_InvestmentTransactions_investmentId ON InvestmentTransactions(investmentId);
    CREATE INDEX idx_InvestmentTransactions_userId ON InvestmentTransactions(userId);
    CREATE INDEX idx_InvestmentTransactions_type ON InvestmentTransactions(type);
    PRINT 'InvestmentTransactions table created successfully';
END;

-- =====================================================
-- 7. AuditLogs - User activity logging
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
BEGIN
    CREATE TABLE AuditLogs (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        action NVARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT
        entityType NVARCHAR(100) NOT NULL, -- Transaction, Budget, Wallet, etc.
        entityId INT NULL,
        oldValue NVARCHAR(MAX) NULL, -- JSON previous state
        newValue NVARCHAR(MAX) NULL, -- JSON new state
        ipAddress NVARCHAR(50) NULL,
        userAgent NVARCHAR(500) NULL,
        description NVARCHAR(500) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_AuditLogs_userId ON AuditLogs(userId);
    CREATE INDEX idx_AuditLogs_action ON AuditLogs(action);
    CREATE INDEX idx_AuditLogs_entityType ON AuditLogs(entityType);
    CREATE INDEX idx_AuditLogs_createdAt ON AuditLogs(createdAt);
    PRINT 'AuditLogs table created successfully';
END;

-- =====================================================
-- 8. Add missing columns to Users table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'avatarUrl')
BEGIN
    ALTER TABLE Users ADD avatarUrl NVARCHAR(500) NULL;
    PRINT 'Added avatarUrl column to Users table';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'phoneNumber')
BEGIN
    ALTER TABLE Users ADD phoneNumber NVARCHAR(20) NULL;
    PRINT 'Added phoneNumber column to Users table';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'role')
BEGIN
    ALTER TABLE Users ADD role NVARCHAR(20) DEFAULT 'user';
    PRINT 'Added role column to Users table';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'updatedAt')
BEGIN
    ALTER TABLE Users ADD updatedAt DATETIME2 DEFAULT GETDATE();
    PRINT 'Added updatedAt column to Users table';
END;

-- =====================================================
-- 9. Add location/attachment columns to Transactions
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Transactions') AND name = 'location')
BEGIN
    ALTER TABLE Transactions ADD location NVARCHAR(255) NULL;
    PRINT 'Added location column to Transactions table';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Transactions') AND name = 'paymentMethod')
BEGIN
    ALTER TABLE Transactions ADD paymentMethod NVARCHAR(50) NULL;
    PRINT 'Added paymentMethod column to Transactions table';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Transactions') AND name = 'isRecurring')
BEGIN
    ALTER TABLE Transactions ADD isRecurring BIT DEFAULT 0;
    PRINT 'Added isRecurring column to Transactions table';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Transactions') AND name = 'recurringTransactionId')
BEGIN
    ALTER TABLE Transactions ADD recurringTransactionId INT NULL;
    PRINT 'Added recurringTransactionId column to Transactions table';
END;

PRINT '=== Database expansion completed successfully! ===';
PRINT 'New tables: UserProfiles, TransactionAttachments, Debts, DebtPayments, Investments, InvestmentTransactions, AuditLogs';
PRINT 'Updated tables: Users (avatarUrl, phoneNumber, role, updatedAt), Transactions (location, paymentMethod, isRecurring)';
