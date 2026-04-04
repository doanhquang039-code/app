-- Create RecurringTransactions table
CREATE TABLE RecurringTransactions (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    walletId INT NOT NULL,
    categoryId INT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    type NVARCHAR(50) NOT NULL CHECK(type IN ('income', 'expense')),
    note NVARCHAR(500),
    frequency NVARCHAR(50) NOT NULL CHECK(frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    frequencyDay NVARCHAR(50),
    startDate DATETIME2 NOT NULL,
    endDate DATETIME2,
    isActive BIT DEFAULT 1,
    lastExecutedDate DATETIME2,
    nextExecutionDate DATETIME2,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (walletId) REFERENCES Wallets(id),
    FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- Create SavingsGoals table
CREATE TABLE SavingsGoals (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    walletId INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(1000),
    targetAmount DECIMAL(18,2) NOT NULL,
    currentAmount DECIMAL(18,2) DEFAULT 0,
    icon NVARCHAR(255),
    startDate DATETIME2 NOT NULL,
    targetDate DATETIME2,
    status NVARCHAR(50) DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused', 'cancelled')),
    progressPercentage DECIMAL(5,2),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (walletId) REFERENCES Wallets(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_recurring_userId ON RecurringTransactions(userId);
CREATE INDEX idx_recurring_isActive ON RecurringTransactions(isActive);
CREATE INDEX idx_recurring_nextExecution ON RecurringTransactions(nextExecutionDate);
CREATE INDEX idx_savingsGoals_userId ON SavingsGoals(userId);
CREATE INDEX idx_savingsGoals_status ON SavingsGoals(status);
