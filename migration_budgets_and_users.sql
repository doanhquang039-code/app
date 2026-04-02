-- =============================================
-- Migration: Bổ sung bảng Budgets và cột isActive cho Users
-- Database: ExpenseTrackerDB
-- Date: 2026-04-02
-- =============================================

USE ExpenseTrackerDB;
GO

-- Thêm cột isActive vào bảng Users (soft delete)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'isActive'
)
BEGIN
    ALTER TABLE Users ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT 'Đã thêm cột isActive vào bảng Users';
END
GO

-- Tạo bảng Budgets
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Budgets')
BEGIN
    CREATE TABLE Budgets (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        categoryId INT NOT NULL,
        amount DECIMAL(18,2) NOT NULL,
        month NVARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
        createdAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id),
        FOREIGN KEY (categoryId) REFERENCES Categories(id),
        CONSTRAINT UQ_Budget_User_Category_Month UNIQUE (userId, categoryId, month)
    );
    PRINT 'Đã tạo bảng Budgets';
END
GO

-- Thêm cột note vào Transactions nếu chưa có
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Transactions' AND COLUMN_NAME = 'note'
)
BEGIN
    ALTER TABLE Transactions ADD note NVARCHAR(500) NULL;
    PRINT 'Đã thêm cột note vào bảng Transactions';
END
GO

-- Thêm cột type vào Transactions nếu chưa có
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Transactions' AND COLUMN_NAME = 'type'
)
BEGIN
    ALTER TABLE Transactions ADD type NVARCHAR(50) NOT NULL DEFAULT 'expense'
        CHECK (type IN ('income', 'expense'));
    PRINT 'Đã thêm cột type vào bảng Transactions';
END
GO

PRINT '✅ Migration hoàn tất!';
GO
