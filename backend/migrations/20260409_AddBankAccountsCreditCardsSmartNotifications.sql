-- Migration: Add BankAccounts, CreditCards, SmartNotifications tables
-- Created: 2026-04-09

-- Create BankAccounts Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BankAccounts')
BEGIN
    CREATE TABLE BankAccounts (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        bankName NVARCHAR(255) NOT NULL,
        accountNumber NVARCHAR(255) NOT NULL,
        accountHolder NVARCHAR(255) NOT NULL,
        accountType NVARCHAR(100) NULL,
        balance DECIMAL(18, 2) DEFAULT 0,
        branchCode NVARCHAR(100) NULL,
        ifscCode NVARCHAR(100) NULL,
        routingNumber NVARCHAR(100) NULL,
        swiftCode NVARCHAR(100) NULL,
        icon NVARCHAR(255) NULL,
        isActive BIT DEFAULT 1,
        linkedWalletId INT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_BankAccounts_userId ON BankAccounts(userId);
    CREATE INDEX idx_BankAccounts_isActive ON BankAccounts(isActive);
    PRINT 'BankAccounts table created successfully';
END;

-- Create CreditCards Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CreditCards')
BEGIN
    CREATE TABLE CreditCards (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        cardholderName NVARCHAR(255) NOT NULL,
        cardNumber NVARCHAR(255) NOT NULL,
        cardType NVARCHAR(100) NOT NULL,
        issuingBank NVARCHAR(255) NOT NULL,
        expiryMonth INT NOT NULL,
        expiryYear INT NOT NULL,
        cvv NVARCHAR(255) NOT NULL,
        creditLimit DECIMAL(18, 2) NOT NULL,
        currentBalance DECIMAL(18, 2) DEFAULT 0,
        interestRate DECIMAL(5, 2) NULL,
        billingCycleDayOfMonth INT NULL,
        icon NVARCHAR(255) NULL,
        isActive BIT DEFAULT 1,
        linkedWalletId INT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_CreditCards_userId ON CreditCards(userId);
    CREATE INDEX idx_CreditCards_isActive ON CreditCards(isActive);
    CREATE INDEX idx_CreditCards_cardType ON CreditCards(cardType);
    PRINT 'CreditCards table created successfully';
END;

-- Create SmartNotifications Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SmartNotifications')
BEGIN
    CREATE TABLE SmartNotifications (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        type NVARCHAR(100) NOT NULL,
        severity NVARCHAR(50) NULL,
        isRead BIT DEFAULT 0,
        actionUrl NVARCHAR(MAX) NULL,
        metadata NVARCHAR(MAX) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_SmartNotifications_userId ON SmartNotifications(userId);
    CREATE INDEX idx_SmartNotifications_isRead ON SmartNotifications(isRead);
    CREATE INDEX idx_SmartNotifications_type ON SmartNotifications(type);
    CREATE INDEX idx_SmartNotifications_createdAt ON SmartNotifications(createdAt);
    PRINT 'SmartNotifications table created successfully';
END;

-- Create NotificationRules Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NotificationRules')
BEGIN
    CREATE TABLE NotificationRules (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        ruleName NVARCHAR(255) NOT NULL,
        ruleType NVARCHAR(100) NOT NULL,
        condition NVARCHAR(MAX) NOT NULL,
        action NVARCHAR(MAX) NULL,
        isEnabled BIT DEFAULT 1,
        frequency NVARCHAR(50) NULL,
        notificationChannel NVARCHAR(50) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_NotificationRules_userId ON NotificationRules(userId);
    CREATE INDEX idx_NotificationRules_isEnabled ON NotificationRules(isEnabled);
    CREATE INDEX idx_NotificationRules_ruleType ON NotificationRules(ruleType);
    PRINT 'NotificationRules table created successfully';
END;

PRINT 'All tables created successfully!';