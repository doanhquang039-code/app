-- ========================================
-- Additional Migrations for New Features
-- ========================================

-- 1. Tags Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tags' and xtype='U')
BEGIN
    CREATE TABLE Tags (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        name NVARCHAR(255) NOT NULL,
        color NVARCHAR(50),
        icon NVARCHAR(255),
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id),
        UNIQUE(userId, name)
    );
    PRINT 'Created Tags table';
END
ELSE
    PRINT 'Tags table already exists';

-- 2. Transaction_Tags Junction Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='transaction_tags' and xtype='U')
BEGIN
    CREATE TABLE transaction_tags (
        transactionId INT NOT NULL,
        tagId INT NOT NULL,
        PRIMARY KEY (transactionId, tagId),
        FOREIGN KEY (transactionId) REFERENCES Transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (tagId) REFERENCES Tags(id) ON DELETE CASCADE
    );
    PRINT 'Created transaction_tags table';
END
ELSE
    PRINT 'transaction_tags table already exists';

-- 3. BudgetAlerts Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BudgetAlerts' and xtype='U')
BEGIN
    CREATE TABLE BudgetAlerts (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        budgetId INT NOT NULL,
        thresholdPercentage DECIMAL(5,2) NOT NULL,
        enabled BIT DEFAULT 1,
        notified BIT DEFAULT 0,
        lastNotificationDate DATETIME2,
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id),
        FOREIGN KEY (budgetId) REFERENCES Budgets(id)
    );
    PRINT 'Created BudgetAlerts table';
END
ELSE
    PRINT 'BudgetAlerts table already exists';

-- 4. BillReminders Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BillReminders' and xtype='U')
BEGIN
    CREATE TABLE BillReminders (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        billName NVARCHAR(255) NOT NULL,
        description NVARCHAR(1000),
        amount DECIMAL(18,2) NOT NULL,
        dueDate DATETIME2 NOT NULL,
        isPaid BIT DEFAULT 0,
        paidDate DATETIME2,
        status NVARCHAR(50) DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'overdue', 'paid')),
        reminderEnabled BIT DEFAULT 1,
        remindDaysBefore INT DEFAULT 3,
        reminderSent BIT DEFAULT 0,
        reminderSentDate DATETIME2,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    PRINT 'Created BillReminders table';
END
ELSE
    PRINT 'BillReminders table already exists';

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_tags_userId')
    CREATE INDEX idx_tags_userId ON Tags(userId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_transaction_tags_transactionId')
    CREATE INDEX idx_transaction_tags_transactionId ON transaction_tags(transactionId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_transaction_tags_tagId')
    CREATE INDEX idx_transaction_tags_tagId ON transaction_tags(tagId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_budgetAlerts_userId')
    CREATE INDEX idx_budgetAlerts_userId ON BudgetAlerts(userId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_budgetAlerts_budgetId')
    CREATE INDEX idx_budgetAlerts_budgetId ON BudgetAlerts(budgetId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_billReminders_userId')
    CREATE INDEX idx_billReminders_userId ON BillReminders(userId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_billReminders_dueDate')
    CREATE INDEX idx_billReminders_dueDate ON BillReminders(dueDate);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_billReminders_status')
    CREATE INDEX idx_billReminders_status ON BillReminders(status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_billReminders_isPaid')
    CREATE INDEX idx_billReminders_isPaid ON BillReminders(isPaid);

PRINT 'Migration completed successfully!';
GO
