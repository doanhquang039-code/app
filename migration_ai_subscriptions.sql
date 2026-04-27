-- Migration for AI Analysis & Subscription Management
-- Created: 2026-04-27

USE ExpenseTrackerDB;
GO

-- ========================================
-- AI ANALYSIS FEATURE
-- ========================================

-- Spending Patterns Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SpendingPatterns')
BEGIN
    CREATE TABLE SpendingPatterns (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        patternType NVARCHAR(100) NOT NULL,
        category NVARCHAR(255) NOT NULL,
        averageAmount DECIMAL(18,2) NOT NULL,
        minAmount DECIMAL(18,2) NOT NULL,
        maxAmount DECIMAL(18,2) NOT NULL,
        frequency INT NOT NULL,
        timePattern NVARCHAR(100) NOT NULL,
        dayOfWeek INT NULL,
        dayOfMonth INT NULL,
        confidence DECIMAL(5,2) NOT NULL,
        insights NVARCHAR(MAX) NOT NULL,
        periodStart DATETIME2 NOT NULL,
        periodEnd DATETIME2 NOT NULL,
        occurrences INT NOT NULL DEFAULT 0,
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_SpendingPatterns_UserId ON SpendingPatterns(userId);
    CREATE INDEX IX_SpendingPatterns_PatternType ON SpendingPatterns(patternType);
    CREATE INDEX IX_SpendingPatterns_Category ON SpendingPatterns(category);
    CREATE INDEX IX_SpendingPatterns_Confidence ON SpendingPatterns(confidence DESC);
    
    PRINT 'Created SpendingPatterns table';
END
GO

-- AI Predictions Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AIPredictions')
BEGIN
    CREATE TABLE AIPredictions (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        predictionType NVARCHAR(100) NOT NULL,
        category NVARCHAR(255) NULL,
        targetDate DATETIME2 NOT NULL,
        predictedAmount DECIMAL(18,2) NOT NULL,
        actualAmount DECIMAL(18,2) NULL,
        confidence DECIMAL(5,2) NOT NULL,
        accuracy DECIMAL(5,2) NULL,
        factors NVARCHAR(MAX) NOT NULL,
        recommendations NVARCHAR(MAX) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
        isNotified BIT NOT NULL DEFAULT 0,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_AIPredictions_UserId ON AIPredictions(userId);
    CREATE INDEX IX_AIPredictions_PredictionType ON AIPredictions(predictionType);
    CREATE INDEX IX_AIPredictions_TargetDate ON AIPredictions(targetDate);
    CREATE INDEX IX_AIPredictions_Status ON AIPredictions(status);
    
    PRINT 'Created AIPredictions table';
END
GO

-- Spending Anomalies Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SpendingAnomalies')
BEGIN
    CREATE TABLE SpendingAnomalies (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        transactionId INT NULL,
        anomalyType NVARCHAR(100) NOT NULL,
        severity NVARCHAR(50) NOT NULL,
        amount DECIMAL(18,2) NOT NULL,
        expectedAmount DECIMAL(18,2) NOT NULL,
        deviationPercentage DECIMAL(5,2) NOT NULL,
        category NVARCHAR(255) NOT NULL,
        description NVARCHAR(1000) NOT NULL,
        analysis NVARCHAR(MAX) NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'UNREVIEWED',
        isNotified BIT NOT NULL DEFAULT 0,
        userNote NVARCHAR(1000) NULL,
        detectedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        reviewedAt DATETIME2 NULL,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (transactionId) REFERENCES Transactions(id) ON DELETE SET NULL
    );

    CREATE INDEX IX_SpendingAnomalies_UserId ON SpendingAnomalies(userId);
    CREATE INDEX IX_SpendingAnomalies_Severity ON SpendingAnomalies(severity);
    CREATE INDEX IX_SpendingAnomalies_Status ON SpendingAnomalies(status);
    CREATE INDEX IX_SpendingAnomalies_DetectedAt ON SpendingAnomalies(detectedAt DESC);
    
    PRINT 'Created SpendingAnomalies table';
END
GO

-- ========================================
-- SUBSCRIPTION MANAGEMENT FEATURE
-- ========================================

-- Subscriptions Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Subscriptions')
BEGIN
    CREATE TABLE Subscriptions (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(1000) NULL,
        amount DECIMAL(18,2) NOT NULL,
        currency NVARCHAR(10) NOT NULL DEFAULT 'VND',
        billingCycle NVARCHAR(50) NOT NULL,
        categoryId INT NULL,
        startDate DATETIME2 NOT NULL,
        endDate DATETIME2 NULL,
        nextBillingDate DATETIME2 NOT NULL,
        provider NVARCHAR(255) NULL,
        website NVARCHAR(500) NULL,
        icon NVARCHAR(255) NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        autoRenew BIT NOT NULL DEFAULT 1,
        reminderEnabled BIT NOT NULL DEFAULT 1,
        reminderDaysBefore INT NOT NULL DEFAULT 3,
        reminderSent BIT NOT NULL DEFAULT 0,
        notes NVARCHAR(MAX) NULL,
        totalPaid DECIMAL(18,2) NOT NULL DEFAULT 0,
        paymentCount INT NOT NULL DEFAULT 0,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (categoryId) REFERENCES Categories(id) ON DELETE SET NULL
    );

    CREATE INDEX IX_Subscriptions_UserId ON Subscriptions(userId);
    CREATE INDEX IX_Subscriptions_Status ON Subscriptions(status);
    CREATE INDEX IX_Subscriptions_NextBillingDate ON Subscriptions(nextBillingDate);
    CREATE INDEX IX_Subscriptions_Provider ON Subscriptions(provider);
    
    PRINT 'Created Subscriptions table';
END
GO

-- Subscription Payments Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SubscriptionPayments')
BEGIN
    CREATE TABLE SubscriptionPayments (
        id INT PRIMARY KEY IDENTITY(1,1),
        subscriptionId INT NOT NULL,
        transactionId INT NULL,
        amount DECIMAL(18,2) NOT NULL,
        paymentDate DATETIME2 NOT NULL,
        dueDate DATETIME2 NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
        paymentMethod NVARCHAR(500) NULL,
        notes NVARCHAR(1000) NULL,
        isAutomatic BIT NOT NULL DEFAULT 0,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (subscriptionId) REFERENCES Subscriptions(id) ON DELETE CASCADE,
        FOREIGN KEY (transactionId) REFERENCES Transactions(id) ON DELETE SET NULL
    );

    CREATE INDEX IX_SubscriptionPayments_SubscriptionId ON SubscriptionPayments(subscriptionId);
    CREATE INDEX IX_SubscriptionPayments_Status ON SubscriptionPayments(status);
    CREATE INDEX IX_SubscriptionPayments_PaymentDate ON SubscriptionPayments(paymentDate DESC);
    
    PRINT 'Created SubscriptionPayments table';
END
GO

PRINT '========================================';
PRINT 'Migration completed successfully!';
PRINT 'Created tables:';
PRINT '  - SpendingPatterns (AI pattern detection)';
PRINT '  - AIPredictions (AI predictions)';
PRINT '  - SpendingAnomalies (Anomaly detection)';
PRINT '  - Subscriptions (Subscription management)';
PRINT '  - SubscriptionPayments (Payment tracking)';
PRINT '========================================';
GO
