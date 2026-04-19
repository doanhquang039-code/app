-- Net worth snapshots for trend charts and historical wealth tracking
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NetWorthSnapshots')
BEGIN
    CREATE TABLE NetWorthSnapshots (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        snapshotDate DATE NOT NULL,
        walletTotal DECIMAL(18, 2) NOT NULL DEFAULT 0,
        bankTotal DECIMAL(18, 2) NOT NULL DEFAULT 0,
        investmentTotal DECIMAL(18, 2) NOT NULL DEFAULT 0,
        receivablesTotal DECIMAL(18, 2) NOT NULL DEFAULT 0,
        borrowingsTotal DECIMAL(18, 2) NOT NULL DEFAULT 0,
        creditCardDebtTotal DECIMAL(18, 2) NOT NULL DEFAULT 0,
        netWorth DECIMAL(18, 2) NOT NULL,
        currency NVARCHAR(10) NOT NULL DEFAULT 'VND',
        note NVARCHAR(500) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_NetWorthSnapshots_userId ON NetWorthSnapshots(userId);
    CREATE INDEX idx_NetWorthSnapshots_snapshotDate ON NetWorthSnapshots(snapshotDate);
    CREATE UNIQUE INDEX uq_NetWorthSnapshots_user_date ON NetWorthSnapshots(userId, snapshotDate);
    PRINT 'NetWorthSnapshots table created successfully';
END;
