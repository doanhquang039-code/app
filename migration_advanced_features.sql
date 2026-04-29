-- =====================================================
-- ADVANCED FEATURES MIGRATION SCRIPT
-- Expense Tracker - Cross-Platform Support
-- Date: April 29, 2026
-- =====================================================

USE expense_tracker;
GO

-- =====================================================
-- 1. BANK ACCOUNTS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BankAccounts')
BEGIN
    CREATE TABLE BankAccounts (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        bankName NVARCHAR(255) NOT NULL,
        accountNumber NVARCHAR(100) NOT NULL,
        accountType NVARCHAR(50) NOT NULL, -- CHECKING, SAVINGS, CREDIT_CARD
        accountHolderName NVARCHAR(255) NOT NULL,
        balance DECIMAL(15,2) DEFAULT 0,
        currency NVARCHAR(10) DEFAULT 'VND',
        bankCode NVARCHAR(50),
        branchCode NVARCHAR(50),
        swiftCode NVARCHAR(50),
        iban NVARCHAR(100),
        
        -- Integration details
        plaidAccessToken NVARCHAR(MAX),
        plaidItemId NVARCHAR(255),
        plaidAccountId NVARCHAR(255),
        connectionType NVARCHAR(50) DEFAULT 'MANUAL', -- MANUAL, PLAID, OPEN_BANKING, API
        status NVARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, DISCONNECTED, ERROR
        
        -- Sync settings
        autoSync BIT DEFAULT 1,
        lastSyncedAt DATETIME,
        syncFrequency NVARCHAR(50), -- REALTIME, HOURLY, DAILY, WEEKLY
        syncError NVARCHAR(MAX),
        
        isPrimary BIT DEFAULT 0,
        isActive BIT DEFAULT 1,
        notes NVARCHAR(MAX),
        
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_BankAccounts_UserId ON BankAccounts(userId);
    CREATE INDEX IX_BankAccounts_Status ON BankAccounts(status);
    PRINT 'Table BankAccounts created successfully';
END
GO

-- =====================================================
-- 2. BANK TRANSACTIONS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BankTransactions')
BEGIN
    CREATE TABLE BankTransactions (
        id INT PRIMARY KEY IDENTITY(1,1),
        bankAccountId INT NOT NULL,
        transactionId INT, -- Link to Transactions table
        externalTransactionId NVARCHAR(255) NOT NULL,
        
        transactionDate DATE NOT NULL,
        postedDate DATETIME,
        amount DECIMAL(15,2) NOT NULL,
        type NVARCHAR(20) NOT NULL, -- DEBIT, CREDIT
        description NVARCHAR(MAX),
        merchantName NVARCHAR(255),
        category NVARCHAR(255),
        location NVARCHAR(500),
        balance DECIMAL(15,2), -- Balance after transaction
        
        status NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, POSTED, CANCELLED
        isReconciled BIT DEFAULT 0,
        isDuplicate BIT DEFAULT 0,
        duplicateOfId INT,
        
        rawData NVARCHAR(MAX), -- Original JSON from bank
        metadata NVARCHAR(MAX),
        
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (bankAccountId) REFERENCES BankAccounts(id) ON DELETE CASCADE,
        FOREIGN KEY (transactionId) REFERENCES Transactions(id)
    );
    
    CREATE INDEX IX_BankTransactions_BankAccountId ON BankTransactions(bankAccountId);
    CREATE INDEX IX_BankTransactions_TransactionDate ON BankTransactions(transactionDate);
    CREATE INDEX IX_BankTransactions_IsReconciled ON BankTransactions(isReconciled);
    CREATE UNIQUE INDEX IX_BankTransactions_External ON BankTransactions(bankAccountId, externalTransactionId);
    PRINT 'Table BankTransactions created successfully';
END
GO

-- =====================================================
-- 3. SCHEDULED TRANSACTIONS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ScheduledTransactions')
BEGIN
    CREATE TABLE ScheduledTransactions (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        name NVARCHAR(255) NOT NULL,
        type NVARCHAR(20) NOT NULL, -- INCOME, EXPENSE
        amount DECIMAL(15,2) NOT NULL,
        categoryId INT,
        walletId INT,
        description NVARCHAR(MAX),
        
        -- Scheduling
        frequency NVARCHAR(50) NOT NULL, -- DAILY, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY, CUSTOM
        startDate DATE NOT NULL,
        endDate DATE,
        occurrences INT,
        executedCount INT DEFAULT 0,
        nextExecutionDate DATE,
        lastExecutionDate DATE,
        
        -- Custom scheduling
        customPattern NVARCHAR(255),
        daysOfWeek NVARCHAR(MAX), -- JSON array [1,3,5]
        daysOfMonth NVARCHAR(MAX), -- JSON array [1,15]
        monthsOfYear NVARCHAR(MAX), -- JSON array [1,6,12]
        
        -- Smart features
        useAIOptimization BIT DEFAULT 0,
        adjustForWeekends BIT DEFAULT 0,
        adjustForHolidays BIT DEFAULT 0,
        notifyBeforeExecution BIT DEFAULT 0,
        notificationHoursBefore INT DEFAULT 24,
        
        status NVARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, COMPLETED, CANCELLED
        autoExecute BIT DEFAULT 1,
        executionError NVARCHAR(MAX),
        notes NVARCHAR(MAX),
        
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (categoryId) REFERENCES Categories(id),
        FOREIGN KEY (walletId) REFERENCES Wallets(id)
    );
    
    CREATE INDEX IX_ScheduledTransactions_UserId ON ScheduledTransactions(userId);
    CREATE INDEX IX_ScheduledTransactions_NextExecution ON ScheduledTransactions(nextExecutionDate);
    CREATE INDEX IX_ScheduledTransactions_Status ON ScheduledTransactions(status);
    PRINT 'Table ScheduledTransactions created successfully';
END
GO

-- =====================================================
-- 4. VOICE COMMANDS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VoiceCommands')
BEGIN
    CREATE TABLE VoiceCommands (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        originalText NVARCHAR(MAX) NOT NULL,
        processedText NVARCHAR(MAX),
        intent NVARCHAR(100) NOT NULL,
        entities NVARCHAR(MAX), -- JSON
        confidence DECIMAL(5,2),
        
        status NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
        actionTaken NVARCHAR(255),
        relatedEntityId INT,
        relatedEntityType NVARCHAR(50),
        response NVARCHAR(MAX),
        
        audioFilePath NVARCHAR(500),
        audioDuration INT,
        language NVARCHAR(10),
        deviceType NVARCHAR(50),
        errorMessage NVARCHAR(MAX),
        
        createdAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_VoiceCommands_UserId ON VoiceCommands(userId);
    CREATE INDEX IX_VoiceCommands_Intent ON VoiceCommands(intent);
    CREATE INDEX IX_VoiceCommands_CreatedAt ON VoiceCommands(createdAt);
    PRINT 'Table VoiceCommands created successfully';
END
GO

-- =====================================================
-- 5. RECEIPTS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Receipts')
BEGIN
    CREATE TABLE Receipts (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        transactionId INT,
        
        fileName NVARCHAR(255) NOT NULL,
        filePath NVARCHAR(MAX) NOT NULL,
        fileType NVARCHAR(50) NOT NULL, -- IMAGE, PDF
        fileSize INT NOT NULL,
        imageUrl NVARCHAR(MAX),
        thumbnailUrl NVARCHAR(MAX),
        
        -- OCR extracted data
        merchantName NVARCHAR(255),
        totalAmount DECIMAL(15,2),
        receiptDate DATE,
        currency NVARCHAR(10),
        taxAmount NVARCHAR(50),
        paymentMethod NVARCHAR(100),
        items NVARCHAR(MAX), -- JSON array
        rawText NVARCHAR(MAX),
        
        ocrStatus NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
        ocrConfidence INT DEFAULT 0,
        ocrError NVARCHAR(MAX),
        
        isVerified BIT DEFAULT 0,
        isLinked BIT DEFAULT 0,
        notes NVARCHAR(MAX),
        metadata NVARCHAR(MAX),
        
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (transactionId) REFERENCES Transactions(id)
    );
    
    CREATE INDEX IX_Receipts_UserId ON Receipts(userId);
    CREATE INDEX IX_Receipts_TransactionId ON Receipts(transactionId);
    CREATE INDEX IX_Receipts_OcrStatus ON Receipts(ocrStatus);
    CREATE INDEX IX_Receipts_IsLinked ON Receipts(isLinked);
    PRINT 'Table Receipts created successfully';
END
GO

-- =====================================================
-- 6. THIRD PARTY INTEGRATIONS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ThirdPartyIntegrations')
BEGIN
    CREATE TABLE ThirdPartyIntegrations (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        provider NVARCHAR(100) NOT NULL, -- PLAID, STRIPE, PAYPAL, GOOGLE_SHEETS, ZAPIER, IFTTT
        providerName NVARCHAR(255) NOT NULL,
        
        accessToken NVARCHAR(MAX),
        refreshToken NVARCHAR(MAX),
        tokenExpiresAt DATETIME,
        accountId NVARCHAR(255),
        accountEmail NVARCHAR(255),
        
        status NVARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ERROR, EXPIRED
        permissions NVARCHAR(MAX), -- JSON array
        settings NVARCHAR(MAX), -- JSON
        
        autoSync BIT DEFAULT 1,
        lastSyncedAt DATETIME,
        syncError NVARCHAR(MAX),
        isActive BIT DEFAULT 1,
        
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_ThirdPartyIntegrations_UserId ON ThirdPartyIntegrations(userId);
    CREATE INDEX IX_ThirdPartyIntegrations_Provider ON ThirdPartyIntegrations(provider);
    CREATE INDEX IX_ThirdPartyIntegrations_Status ON ThirdPartyIntegrations(status);
    PRINT 'Table ThirdPartyIntegrations created successfully';
END
GO

-- =====================================================
-- 7. DEVICE SESSIONS TABLE (Cross-platform support)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeviceSessions')
BEGIN
    CREATE TABLE DeviceSessions (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        deviceId NVARCHAR(255) NOT NULL,
        deviceName NVARCHAR(255),
        deviceType NVARCHAR(50) NOT NULL, -- WEB, MOBILE_IOS, MOBILE_ANDROID, DESKTOP
        platform NVARCHAR(50), -- iOS, Android, Windows, macOS, Linux, Web
        appVersion NVARCHAR(50),
        osVersion NVARCHAR(50),
        
        -- Session info
        sessionToken NVARCHAR(MAX),
        refreshToken NVARCHAR(MAX),
        ipAddress NVARCHAR(50),
        userAgent NVARCHAR(MAX),
        location NVARCHAR(255),
        
        -- Biometric
        biometricEnabled BIT DEFAULT 0,
        biometricType NVARCHAR(50), -- FINGERPRINT, FACE_ID, IRIS
        
        -- Status
        isActive BIT DEFAULT 1,
        lastActivityAt DATETIME DEFAULT GETDATE(),
        expiresAt DATETIME,
        
        createdAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_DeviceSessions_UserId ON DeviceSessions(userId);
    CREATE INDEX IX_DeviceSessions_DeviceId ON DeviceSessions(deviceId);
    CREATE INDEX IX_DeviceSessions_IsActive ON DeviceSessions(isActive);
    CREATE UNIQUE INDEX IX_DeviceSessions_Token ON DeviceSessions(sessionToken);
    PRINT 'Table DeviceSessions created successfully';
END
GO

-- =====================================================
-- 8. SYNC QUEUE TABLE (For offline sync)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SyncQueue')
BEGIN
    CREATE TABLE SyncQueue (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        deviceId NVARCHAR(255) NOT NULL,
        
        entityType NVARCHAR(100) NOT NULL, -- TRANSACTION, BUDGET, CATEGORY, etc.
        entityId INT,
        action NVARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
        data NVARCHAR(MAX), -- JSON
        
        status NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, SYNCED, FAILED, CONFLICT
        priority INT DEFAULT 0,
        retryCount INT DEFAULT 0,
        errorMessage NVARCHAR(MAX),
        
        clientTimestamp DATETIME NOT NULL,
        serverTimestamp DATETIME DEFAULT GETDATE(),
        syncedAt DATETIME,
        
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_SyncQueue_UserId ON SyncQueue(userId);
    CREATE INDEX IX_SyncQueue_DeviceId ON SyncQueue(deviceId);
    CREATE INDEX IX_SyncQueue_Status ON SyncQueue(status);
    CREATE INDEX IX_SyncQueue_Priority ON SyncQueue(priority DESC);
    PRINT 'Table SyncQueue created successfully';
END
GO

-- =====================================================
-- 9. NOTIFICATIONS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE Notifications (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        
        type NVARCHAR(100) NOT NULL, -- BUDGET_ALERT, BILL_REMINDER, GOAL_MILESTONE, etc.
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        data NVARCHAR(MAX), -- JSON
        
        -- Delivery channels
        channels NVARCHAR(MAX), -- JSON array: ["PUSH", "EMAIL", "SMS", "IN_APP"]
        
        -- Status
        status NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, SENT, DELIVERED, READ, FAILED
        isRead BIT DEFAULT 0,
        readAt DATETIME,
        
        -- Scheduling
        scheduledFor DATETIME,
        sentAt DATETIME,
        deliveredAt DATETIME,
        
        -- Related entity
        relatedEntityType NVARCHAR(100),
        relatedEntityId INT,
        
        priority NVARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
        expiresAt DATETIME,
        
        createdAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_Notifications_UserId ON Notifications(userId);
    CREATE INDEX IX_Notifications_Status ON Notifications(status);
    CREATE INDEX IX_Notifications_IsRead ON Notifications(isRead);
    CREATE INDEX IX_Notifications_ScheduledFor ON Notifications(scheduledFor);
    PRINT 'Table Notifications created successfully';
END
GO

-- =====================================================
-- 10. APP SETTINGS TABLE (Cross-platform preferences)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AppSettings')
BEGIN
    CREATE TABLE AppSettings (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        deviceId NVARCHAR(255),
        
        -- General settings
        language NVARCHAR(10) DEFAULT 'vi',
        currency NVARCHAR(10) DEFAULT 'VND',
        timezone NVARCHAR(100) DEFAULT 'Asia/Ho_Chi_Minh',
        dateFormat NVARCHAR(50) DEFAULT 'DD/MM/YYYY',
        timeFormat NVARCHAR(50) DEFAULT '24h',
        
        -- Display settings
        theme NVARCHAR(50) DEFAULT 'LIGHT', -- LIGHT, DARK, AUTO
        primaryColor NVARCHAR(50),
        fontSize NVARCHAR(20) DEFAULT 'MEDIUM',
        
        -- Notification settings
        pushNotifications BIT DEFAULT 1,
        emailNotifications BIT DEFAULT 1,
        smsNotifications BIT DEFAULT 0,
        notificationSound BIT DEFAULT 1,
        vibration BIT DEFAULT 1,
        
        -- Privacy settings
        biometricAuth BIT DEFAULT 0,
        autoLock BIT DEFAULT 1,
        autoLockTimeout INT DEFAULT 5, -- minutes
        requirePinForTransactions BIT DEFAULT 0,
        
        -- Sync settings
        autoSync BIT DEFAULT 1,
        syncOnWifiOnly BIT DEFAULT 0,
        syncFrequency NVARCHAR(50) DEFAULT 'REALTIME',
        
        -- Feature flags
        enableVoiceCommands BIT DEFAULT 1,
        enableOCR BIT DEFAULT 1,
        enableBankSync BIT DEFAULT 1,
        enableAIInsights BIT DEFAULT 1,
        
        -- Other preferences
        preferences NVARCHAR(MAX), -- JSON for additional settings
        
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_AppSettings_UserId ON AppSettings(userId);
    CREATE INDEX IX_AppSettings_DeviceId ON AppSettings(deviceId);
    PRINT 'Table AppSettings created successfully';
END
GO

-- =====================================================
-- SEED DATA FOR TESTING
-- =====================================================

PRINT '';
PRINT '=====================================================';
PRINT 'MIGRATION COMPLETED SUCCESSFULLY!';
PRINT '=====================================================';
PRINT 'Tables created:';
PRINT '  1. BankAccounts';
PRINT '  2. BankTransactions';
PRINT '  3. ScheduledTransactions';
PRINT '  4. VoiceCommands';
PRINT '  5. Receipts';
PRINT '  6. ThirdPartyIntegrations';
PRINT '  7. DeviceSessions';
PRINT '  8. SyncQueue';
PRINT '  9. Notifications';
PRINT ' 10. AppSettings';
PRINT '=====================================================';
GO
