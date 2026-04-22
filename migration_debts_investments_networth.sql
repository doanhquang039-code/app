-- =============================================
-- Migration: Debts, Investments, NetWorth, UserProfiles
-- Database: ExpenseTrackerDB
-- =============================================

USE ExpenseTrackerDB;
GO

-- =============================================
-- 1. Debts Table
-- =============================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Debts')
BEGIN
    CREATE TABLE Debts (
        id              INT PRIMARY KEY IDENTITY(1,1),
        userId          INT NOT NULL,
        title           NVARCHAR(255) NOT NULL,
        description     NVARCHAR(MAX),
        type            NVARCHAR(20) NOT NULL CHECK(type IN ('lend', 'borrow')),
        personName      NVARCHAR(255) NOT NULL,
        personPhone     NVARCHAR(50),
        personEmail     NVARCHAR(255),
        totalAmount     DECIMAL(18,2) NOT NULL,
        paidAmount      DECIMAL(18,2) DEFAULT 0,
        currency        NVARCHAR(10) DEFAULT 'VND',
        interestRate    DECIMAL(5,2),
        startDate       DATETIME2 NOT NULL,
        dueDate         DATETIME2,
        status          NVARCHAR(20) DEFAULT 'active' CHECK(status IN ('active','paid','overdue','cancelled')),
        reminderEnabled BIT DEFAULT 1,
        reminderDaysBefore INT DEFAULT 3,
        notes           NVARCHAR(MAX),
        createdAt       DATETIME2 DEFAULT GETDATE(),
        updatedAt       DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    PRINT 'Created Debts table';
END
GO

-- =============================================
-- 2. DebtPayments Table
-- =============================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'DebtPayments')
BEGIN
    CREATE TABLE DebtPayments (
        id            INT PRIMARY KEY IDENTITY(1,1),
        debtId        INT NOT NULL,
        userId        INT NOT NULL,
        amount        DECIMAL(18,2) NOT NULL,
        paymentDate   DATETIME2 NOT NULL,
        paymentMethod NVARCHAR(100),
        note          NVARCHAR(500),
        createdAt     DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (debtId) REFERENCES Debts(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    PRINT 'Created DebtPayments table';
END
GO

-- =============================================
-- 3. Investments Table
-- =============================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Investments')
BEGIN
    CREATE TABLE Investments (
        id                    INT PRIMARY KEY IDENTITY(1,1),
        userId                INT NOT NULL,
        name                  NVARCHAR(255) NOT NULL,
        type                  NVARCHAR(50) NOT NULL CHECK(type IN ('stock','crypto','mutual_fund','gold','real_estate','bond','savings_deposit')),
        symbol                NVARCHAR(50),
        quantity              DECIMAL(18,8),
        buyPrice              DECIMAL(18,2) NOT NULL,
        currentPrice          DECIMAL(18,2),
        totalInvested         DECIMAL(18,2) NOT NULL,
        currentValue          DECIMAL(18,2),
        profitLoss            DECIMAL(18,2),
        profitLossPercentage  DECIMAL(10,4),
        currency              NVARCHAR(10) DEFAULT 'VND',
        platform              NVARCHAR(255),
        buyDate               DATETIME2 NOT NULL,
        sellDate              DATETIME2,
        status                NVARCHAR(20) DEFAULT 'holding' CHECK(status IN ('holding','sold','partial')),
        notes                 NVARCHAR(MAX),
        icon                  NVARCHAR(255),
        createdAt             DATETIME2 DEFAULT GETDATE(),
        updatedAt             DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    PRINT 'Created Investments table';
END
GO

-- =============================================
-- 4. InvestmentTransactions Table
-- =============================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'InvestmentTransactions')
BEGIN
    CREATE TABLE InvestmentTransactions (
        id              INT PRIMARY KEY IDENTITY(1,1),
        investmentId    INT NOT NULL,
        userId          INT NOT NULL,
        type            NVARCHAR(20) NOT NULL CHECK(type IN ('buy','sell','dividend','split')),
        quantity        DECIMAL(18,8),
        price           DECIMAL(18,2) NOT NULL,
        totalAmount     DECIMAL(18,2) NOT NULL,
        fee             DECIMAL(18,2) DEFAULT 0,
        transactionDate DATETIME2 NOT NULL,
        note            NVARCHAR(500),
        createdAt       DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (investmentId) REFERENCES Investments(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    PRINT 'Created InvestmentTransactions table';
END
GO

-- =============================================
-- 5. NetWorthSnapshots Table
-- =============================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'NetWorthSnapshots')
BEGIN
    CREATE TABLE NetWorthSnapshots (
        id              INT PRIMARY KEY IDENTITY(1,1),
        userId          INT NOT NULL,
        totalAssets     DECIMAL(18,2) NOT NULL DEFAULT 0,
        totalLiabilities DECIMAL(18,2) NOT NULL DEFAULT 0,
        netWorth        DECIMAL(18,2) NOT NULL DEFAULT 0,
        walletBalance   DECIMAL(18,2) DEFAULT 0,
        bankBalance     DECIMAL(18,2) DEFAULT 0,
        investmentValue DECIMAL(18,2) DEFAULT 0,
        savingsBalance  DECIMAL(18,2) DEFAULT 0,
        totalDebt       DECIMAL(18,2) DEFAULT 0,
        creditCardDebt  DECIMAL(18,2) DEFAULT 0,
        note            NVARCHAR(500),
        snapshotDate    DATETIME2 DEFAULT GETDATE(),
        createdAt       DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    PRINT 'Created NetWorthSnapshots table';
END
GO

-- =============================================
-- 6. UserProfiles Table
-- =============================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserProfiles')
BEGIN
    CREATE TABLE UserProfiles (
        id              INT PRIMARY KEY IDENTITY(1,1),
        userId          INT NOT NULL UNIQUE,
        fullName        NVARCHAR(255),
        phone           NVARCHAR(50),
        avatar          NVARCHAR(500),
        dateOfBirth     DATE,
        gender          NVARCHAR(20),
        occupation      NVARCHAR(255),
        monthlyIncome   DECIMAL(18,2),
        currency        NVARCHAR(10) DEFAULT 'VND',
        language        NVARCHAR(10) DEFAULT 'vi',
        timezone        NVARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
        notificationsEnabled BIT DEFAULT 1,
        budgetAlertEnabled   BIT DEFAULT 1,
        billReminderEnabled  BIT DEFAULT 1,
        createdAt       DATETIME2 DEFAULT GETDATE(),
        updatedAt       DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    PRINT 'Created UserProfiles table';
END
GO

-- =============================================
-- 7. AuditLogs Table
-- =============================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AuditLogs')
BEGIN
    CREATE TABLE AuditLogs (
        id          INT PRIMARY KEY IDENTITY(1,1),
        userId      INT NOT NULL,
        action      NVARCHAR(100) NOT NULL,
        entity      NVARCHAR(100),
        entityId    INT,
        oldValues   NVARCHAR(MAX),
        newValues   NVARCHAR(MAX),
        ipAddress   NVARCHAR(50),
        userAgent   NVARCHAR(500),
        createdAt   DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    PRINT 'Created AuditLogs table';
END
GO

-- =============================================
-- 8. TransactionAttachments Table
-- =============================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'TransactionAttachments')
BEGIN
    CREATE TABLE TransactionAttachments (
        id              INT PRIMARY KEY IDENTITY(1,1),
        transactionId   INT NOT NULL,
        userId          INT NOT NULL,
        fileName        NVARCHAR(255) NOT NULL,
        fileUrl         NVARCHAR(500) NOT NULL,
        fileSize        INT,
        mimeType        NVARCHAR(100),
        createdAt       DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (transactionId) REFERENCES Transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    PRINT 'Created TransactionAttachments table';
END
GO

-- =============================================
-- Indexes
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_debts_userId')
    CREATE INDEX idx_debts_userId ON Debts(userId);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_debts_status')
    CREATE INDEX idx_debts_status ON Debts(status);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_investments_userId')
    CREATE INDEX idx_investments_userId ON Investments(userId);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_investments_type')
    CREATE INDEX idx_investments_type ON Investments(type);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_networth_userId')
    CREATE INDEX idx_networth_userId ON NetWorthSnapshots(userId);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_auditlogs_userId')
    CREATE INDEX idx_auditlogs_userId ON AuditLogs(userId);

PRINT '✅ Migration hoàn tất!';
GO
