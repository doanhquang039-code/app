-- Migration for Advanced Features
-- Export/Import, Gamification, Social Features
-- Created: 2026-04-27

USE ExpenseTrackerDB;
GO

-- ========================================
-- EXPORT/IMPORT FEATURE
-- ========================================

-- Export History Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ExportHistory')
BEGIN
    CREATE TABLE ExportHistory (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        exportType NVARCHAR(100) NOT NULL,
        fileName NVARCHAR(255) NOT NULL,
        filePath NVARCHAR(500) NOT NULL,
        dataType NVARCHAR(100) NOT NULL,
        startDate DATETIME2 NULL,
        endDate DATETIME2 NULL,
        recordCount INT NOT NULL DEFAULT 0,
        fileSize BIGINT NOT NULL DEFAULT 0,
        status NVARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
        errorMessage NVARCHAR(1000) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        expiresAt DATETIME2 NULL,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_ExportHistory_UserId ON ExportHistory(userId);
    CREATE INDEX IX_ExportHistory_Status ON ExportHistory(status);
    CREATE INDEX IX_ExportHistory_CreatedAt ON ExportHistory(createdAt DESC);
    
    PRINT 'Created ExportHistory table';
END
GO

-- ========================================
-- GAMIFICATION FEATURE
-- ========================================

-- Achievements Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Achievements')
BEGIN
    CREATE TABLE Achievements (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(255) NOT NULL UNIQUE,
        description NVARCHAR(1000) NOT NULL,
        category NVARCHAR(100) NOT NULL,
        icon NVARCHAR(255) NOT NULL,
        rarity NVARCHAR(50) NOT NULL,
        points INT NOT NULL DEFAULT 0,
        criteria NVARCHAR(MAX) NOT NULL,
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_Achievements_Category ON Achievements(category);
    CREATE INDEX IX_Achievements_Rarity ON Achievements(rarity);
    
    PRINT 'Created Achievements table';
END
GO

-- User Achievements Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserAchievements')
BEGIN
    CREATE TABLE UserAchievements (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        achievementId INT NOT NULL,
        progress INT NOT NULL DEFAULT 0,
        isUnlocked BIT NOT NULL DEFAULT 0,
        unlockedAt DATETIME2 NULL,
        isNotified BIT NOT NULL DEFAULT 0,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievementId) REFERENCES Achievements(id) ON DELETE CASCADE,
        UNIQUE(userId, achievementId)
    );

    CREATE INDEX IX_UserAchievements_UserId ON UserAchievements(userId);
    CREATE INDEX IX_UserAchievements_IsUnlocked ON UserAchievements(isUnlocked);
    
    PRINT 'Created UserAchievements table';
END
GO

-- User Points Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserPoints')
BEGIN
    CREATE TABLE UserPoints (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL UNIQUE,
        totalPoints INT NOT NULL DEFAULT 0,
        level INT NOT NULL DEFAULT 1,
        currentLevelPoints INT NOT NULL DEFAULT 0,
        nextLevelPoints INT NOT NULL DEFAULT 100,
        dailyStreak INT NOT NULL DEFAULT 0,
        longestStreak INT NOT NULL DEFAULT 0,
        lastActivityDate DATETIME2 NULL,
        rank NVARCHAR(100) NOT NULL DEFAULT N'Người mới',
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_UserPoints_TotalPoints ON UserPoints(totalPoints DESC);
    CREATE INDEX IX_UserPoints_Level ON UserPoints(level DESC);
    CREATE INDEX IX_UserPoints_Rank ON UserPoints(rank);
    
    PRINT 'Created UserPoints table';
END
GO

-- Points History Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PointsHistory')
BEGIN
    CREATE TABLE PointsHistory (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        points INT NOT NULL,
        action NVARCHAR(100) NOT NULL,
        description NVARCHAR(1000) NULL,
        metadata NVARCHAR(MAX) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_PointsHistory_UserId ON PointsHistory(userId);
    CREATE INDEX IX_PointsHistory_CreatedAt ON PointsHistory(createdAt DESC);
    CREATE INDEX IX_PointsHistory_Action ON PointsHistory(action);
    
    PRINT 'Created PointsHistory table';
END
GO

-- ========================================
-- SOCIAL FEATURES
-- ========================================

-- User Friends Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserFriends')
BEGIN
    CREATE TABLE UserFriends (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        friendId INT NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
        canViewTransactions BIT NOT NULL DEFAULT 0,
        canViewBudgets BIT NOT NULL DEFAULT 0,
        canViewGoals BIT NOT NULL DEFAULT 0,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        acceptedAt DATETIME2 NULL,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE NO ACTION,
        FOREIGN KEY (friendId) REFERENCES Users(id) ON DELETE NO ACTION,
        CHECK (userId != friendId)
    );

    CREATE INDEX IX_UserFriends_UserId ON UserFriends(userId);
    CREATE INDEX IX_UserFriends_FriendId ON UserFriends(friendId);
    CREATE INDEX IX_UserFriends_Status ON UserFriends(status);
    
    PRINT 'Created UserFriends table';
END
GO

-- Spending Challenges Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SpendingChallenges')
BEGIN
    CREATE TABLE SpendingChallenges (
        id INT PRIMARY KEY IDENTITY(1,1),
        creatorId INT NOT NULL,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(1000) NOT NULL,
        challengeType NVARCHAR(100) NOT NULL,
        targetAmount DECIMAL(18,2) NOT NULL,
        startDate DATETIME2 NOT NULL,
        endDate DATETIME2 NOT NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        isPublic BIT NOT NULL DEFAULT 0,
        participantCount INT NOT NULL DEFAULT 0,
        icon NVARCHAR(255) NULL,
        rules NVARCHAR(MAX) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (creatorId) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_SpendingChallenges_CreatorId ON SpendingChallenges(creatorId);
    CREATE INDEX IX_SpendingChallenges_Status ON SpendingChallenges(status);
    CREATE INDEX IX_SpendingChallenges_IsPublic ON SpendingChallenges(isPublic);
    CREATE INDEX IX_SpendingChallenges_StartDate ON SpendingChallenges(startDate);
    
    PRINT 'Created SpendingChallenges table';
END
GO

-- Challenge Participants Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChallengeParticipants')
BEGIN
    CREATE TABLE ChallengeParticipants (
        id INT PRIMARY KEY IDENTITY(1,1),
        challengeId INT NOT NULL,
        userId INT NOT NULL,
        currentAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
        progress INT NOT NULL DEFAULT 0,
        status NVARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
        completedAt DATETIME2 NULL,
        rank INT NOT NULL DEFAULT 0,
        joinedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (challengeId) REFERENCES SpendingChallenges(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        UNIQUE(challengeId, userId)
    );

    CREATE INDEX IX_ChallengeParticipants_ChallengeId ON ChallengeParticipants(challengeId);
    CREATE INDEX IX_ChallengeParticipants_UserId ON ChallengeParticipants(userId);
    CREATE INDEX IX_ChallengeParticipants_Progress ON ChallengeParticipants(progress DESC);
    
    PRINT 'Created ChallengeParticipants table';
END
GO

PRINT '========================================';
PRINT 'Migration completed successfully!';
PRINT 'Created tables:';
PRINT '  - ExportHistory';
PRINT '  - Achievements';
PRINT '  - UserAchievements';
PRINT '  - UserPoints';
PRINT '  - PointsHistory';
PRINT '  - UserFriends';
PRINT '  - SpendingChallenges';
PRINT '  - ChallengeParticipants';
PRINT '========================================';
GO
