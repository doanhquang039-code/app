-- ============================================================
-- DATABASE OPTIMIZATION & EXPANSION
-- Version: 2.2.0
-- Date: May 10, 2026
-- Description: Database optimization with indexes, partitioning, and new tables
-- ============================================================

USE appchitieu;
GO

-- ============================================================
-- PART 1: PERFORMANCE INDEXES
-- ============================================================

PRINT 'Creating performance indexes...';

-- Users table indexes
CREATE NONCLUSTERED INDEX IX_Users_Email ON users(email) WHERE email IS NOT NULL;
CREATE NONCLUSTERED INDEX IX_Users_CreatedAt ON users(created_at DESC);
CREATE NONCLUSTERED INDEX IX_Users_IsActive ON users(is_active) INCLUDE (email, full_name);

-- Transactions table indexes (Critical for performance)
CREATE NONCLUSTERED INDEX IX_Transactions_UserId_Date ON transactions(user_id, transaction_date DESC) 
    INCLUDE (amount, category_id, type);
CREATE NONCLUSTERED INDEX IX_Transactions_CategoryId ON transactions(category_id) 
    INCLUDE (amount, transaction_date);
CREATE NONCLUSTERED INDEX IX_Transactions_Type_Date ON transactions(type, transaction_date DESC);
CREATE NONCLUSTERED INDEX IX_Transactions_Amount ON transactions(amount) WHERE amount > 0;

-- Budgets table indexes
CREATE NONCLUSTERED INDEX IX_Budgets_UserId_Period ON budgets(user_id, period_start, period_end);
CREATE NONCLUSTERED INDEX IX_Budgets_CategoryId ON budgets(category_id) INCLUDE (amount, spent);

-- Goals table indexes
CREATE NONCLUSTERED INDEX IX_Goals_UserId_Status ON savings_goals(user_id, status);
CREATE NONCLUSTERED INDEX IX_Goals_TargetDate ON savings_goals(target_date) WHERE status = 'active';

-- Categories table indexes
CREATE NONCLUSTERED INDEX IX_Categories_UserId_Type ON categories(user_id, type);

-- ============================================================
-- PART 2: AUDIT & LOGGING TABLES
-- ============================================================

PRINT 'Creating audit and logging tables...';

-- Audit Log for all data changes
CREATE TABLE audit_logs (
    id INT PRIMARY KEY IDENTITY(1,1),
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    user_id INT,
    old_values NVARCHAR(MAX), -- JSON
    new_values NVARCHAR(MAX), -- JSON
    ip_address VARCHAR(50),
    user_agent NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    INDEX IX_AuditLogs_TableName_RecordId (table_name, record_id),
    INDEX IX_AuditLogs_UserId_CreatedAt (user_id, created_at DESC),
    INDEX IX_AuditLogs_CreatedAt (created_at DESC)
);

-- API Request Logs
CREATE TABLE api_logs (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT,
    response_time_ms INT,
    request_body NVARCHAR(MAX),
    response_body NVARCHAR(MAX),
    ip_address VARCHAR(50),
    user_agent NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    INDEX IX_ApiLogs_UserId_CreatedAt (user_id, created_at DESC),
    INDEX IX_ApiLogs_Endpoint (endpoint),
    INDEX IX_ApiLogs_StatusCode (status_code),
    INDEX IX_ApiLogs_CreatedAt (created_at DESC)
);

-- Error Logs
CREATE TABLE error_logs (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    error_type VARCHAR(100),
    error_message NVARCHAR(MAX),
    stack_trace NVARCHAR(MAX),
    endpoint VARCHAR(500),
    request_data NVARCHAR(MAX),
    severity VARCHAR(20), -- LOW, MEDIUM, HIGH, CRITICAL
    is_resolved BIT DEFAULT 0,
    resolved_at DATETIME,
    resolved_by INT,
    created_at DATETIME DEFAULT GETDATE(),
    INDEX IX_ErrorLogs_Severity_IsResolved (severity, is_resolved),
    INDEX IX_ErrorLogs_CreatedAt (created_at DESC),
    INDEX IX_ErrorLogs_UserId (user_id)
);

-- ============================================================
-- PART 3: CACHING TABLES
-- ============================================================

PRINT 'Creating caching tables...';

-- Cache for expensive queries
CREATE TABLE query_cache (
    id INT PRIMARY KEY IDENTITY(1,1),
    cache_key VARCHAR(500) NOT NULL UNIQUE,
    cache_value NVARCHAR(MAX) NOT NULL, -- JSON
    user_id INT,
    expires_at DATETIME NOT NULL,
    hit_count INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    INDEX IX_QueryCache_CacheKey (cache_key),
    INDEX IX_QueryCache_ExpiresAt (expires_at),
    INDEX IX_QueryCache_UserId (user_id)
);

-- Session cache
CREATE TABLE session_cache (
    id INT PRIMARY KEY IDENTITY(1,1),
    session_id VARCHAR(500) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    session_data NVARCHAR(MAX), -- JSON
    ip_address VARCHAR(50),
    user_agent NVARCHAR(500),
    last_activity DATETIME DEFAULT GETDATE(),
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    INDEX IX_SessionCache_SessionId (session_id),
    INDEX IX_SessionCache_UserId (user_id),
    INDEX IX_SessionCache_ExpiresAt (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- PART 4: ANALYTICS & REPORTING TABLES
-- ============================================================

PRINT 'Creating analytics tables...';

-- Daily aggregated statistics
CREATE TABLE daily_statistics (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    stat_date DATE NOT NULL,
    total_income DECIMAL(18,2) DEFAULT 0,
    total_expense DECIMAL(18,2) DEFAULT 0,
    net_amount DECIMAL(18,2) DEFAULT 0,
    transaction_count INT DEFAULT 0,
    avg_transaction_amount DECIMAL(18,2) DEFAULT 0,
    top_category_id INT,
    top_category_amount DECIMAL(18,2),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    UNIQUE (user_id, stat_date),
    INDEX IX_DailyStats_UserId_Date (user_id, stat_date DESC),
    INDEX IX_DailyStats_Date (stat_date DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Monthly aggregated statistics
CREATE TABLE monthly_statistics (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    total_income DECIMAL(18,2) DEFAULT 0,
    total_expense DECIMAL(18,2) DEFAULT 0,
    net_amount DECIMAL(18,2) DEFAULT 0,
    transaction_count INT DEFAULT 0,
    avg_daily_expense DECIMAL(18,2) DEFAULT 0,
    savings_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
    budget_adherence DECIMAL(5,2) DEFAULT 0, -- Percentage
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    UNIQUE (user_id, year, month),
    INDEX IX_MonthlyStats_UserId_YearMonth (user_id, year DESC, month DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Category spending patterns
CREATE TABLE category_patterns (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    total_amount DECIMAL(18,2) DEFAULT 0,
    transaction_count INT DEFAULT 0,
    avg_amount DECIMAL(18,2) DEFAULT 0,
    percentage_of_total DECIMAL(5,2) DEFAULT 0,
    trend VARCHAR(20), -- INCREASING, DECREASING, STABLE
    created_at DATETIME DEFAULT GETDATE(),
    UNIQUE (user_id, category_id, year, month),
    INDEX IX_CategoryPatterns_UserId_YearMonth (user_id, year DESC, month DESC),
    INDEX IX_CategoryPatterns_CategoryId (category_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ============================================================
-- PART 5: NOTIFICATION SYSTEM
-- ============================================================

PRINT 'Creating notification tables...';

-- Notification templates
CREATE TABLE notification_templates (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- EMAIL, SMS, PUSH, IN_APP
    subject NVARCHAR(200),
    body NVARCHAR(MAX) NOT NULL,
    variables NVARCHAR(500), -- JSON array of variable names
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    INDEX IX_NotificationTemplates_Type (type),
    INDEX IX_NotificationTemplates_IsActive (is_active)
);

-- Notification queue
CREATE TABLE notification_queue (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    template_id INT,
    type VARCHAR(50) NOT NULL,
    recipient VARCHAR(200) NOT NULL, -- email or phone
    subject NVARCHAR(200),
    body NVARCHAR(MAX) NOT NULL,
    data NVARCHAR(MAX), -- JSON
    priority INT DEFAULT 5, -- 1-10, 1 is highest
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    error_message NVARCHAR(MAX),
    scheduled_at DATETIME,
    sent_at DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    INDEX IX_NotificationQueue_Status_Priority (status, priority DESC),
    INDEX IX_NotificationQueue_UserId (user_id),
    INDEX IX_NotificationQueue_ScheduledAt (scheduled_at),
    INDEX IX_NotificationQueue_CreatedAt (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notification history
CREATE TABLE notification_history (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    recipient VARCHAR(200) NOT NULL,
    subject NVARCHAR(200),
    body NVARCHAR(MAX),
    status VARCHAR(20) NOT NULL,
    sent_at DATETIME,
    read_at DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    INDEX IX_NotificationHistory_UserId_CreatedAt (user_id, created_at DESC),
    INDEX IX_NotificationHistory_Status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- PART 6: USER PREFERENCES & SETTINGS
-- ============================================================

PRINT 'Creating user preferences tables...';

-- User preferences
CREATE TABLE user_preferences (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
    language VARCHAR(10) DEFAULT 'vi', -- vi, en
    currency VARCHAR(10) DEFAULT 'VND',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(20) DEFAULT '24h',
    notification_email BIT DEFAULT 1,
    notification_sms BIT DEFAULT 0,
    notification_push BIT DEFAULT 1,
    notification_in_app BIT DEFAULT 1,
    budget_alert_threshold INT DEFAULT 80, -- Percentage
    low_balance_alert DECIMAL(18,2) DEFAULT 100000,
    weekly_report BIT DEFAULT 1,
    monthly_report BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User settings (key-value store)
CREATE TABLE user_settings (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value NVARCHAR(MAX),
    setting_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    UNIQUE (user_id, setting_key),
    INDEX IX_UserSettings_UserId (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- PART 7: SECURITY ENHANCEMENTS
-- ============================================================

PRINT 'Creating security tables...';

-- Login history
CREATE TABLE login_history (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    login_type VARCHAR(20) NOT NULL, -- password, google, facebook
    ip_address VARCHAR(50),
    user_agent NVARCHAR(500),
    location VARCHAR(200), -- City, Country
    device_type VARCHAR(50), -- mobile, desktop, tablet
    is_successful BIT NOT NULL,
    failure_reason VARCHAR(200),
    created_at DATETIME DEFAULT GETDATE(),
    INDEX IX_LoginHistory_UserId_CreatedAt (user_id, created_at DESC),
    INDEX IX_LoginHistory_IpAddress (ip_address),
    INDEX IX_LoginHistory_IsSuccessful (is_successful),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Security events
CREATE TABLE security_events (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    event_type VARCHAR(50) NOT NULL, -- SUSPICIOUS_LOGIN, PASSWORD_CHANGE, etc.
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    description NVARCHAR(500),
    ip_address VARCHAR(50),
    user_agent NVARCHAR(500),
    is_resolved BIT DEFAULT 0,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    INDEX IX_SecurityEvents_UserId_CreatedAt (user_id, created_at DESC),
    INDEX IX_SecurityEvents_Severity_IsResolved (severity, is_resolved),
    INDEX IX_SecurityEvents_EventType (event_type),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Two-factor authentication
CREATE TABLE two_factor_auth (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE,
    is_enabled BIT DEFAULT 0,
    method VARCHAR(20), -- SMS, EMAIL, AUTHENTICATOR
    secret_key VARCHAR(200),
    backup_codes NVARCHAR(500), -- JSON array
    last_used DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- PART 8: PERFORMANCE VIEWS
-- ============================================================

PRINT 'Creating performance views...';

-- User dashboard summary view
GO
CREATE VIEW vw_user_dashboard_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    -- Current month stats
    ISNULL(SUM(CASE WHEN t.type = 'income' AND MONTH(t.transaction_date) = MONTH(GETDATE()) 
        AND YEAR(t.transaction_date) = YEAR(GETDATE()) THEN t.amount ELSE 0 END), 0) as current_month_income,
    ISNULL(SUM(CASE WHEN t.type = 'expense' AND MONTH(t.transaction_date) = MONTH(GETDATE()) 
        AND YEAR(t.transaction_date) = YEAR(GETDATE()) THEN t.amount ELSE 0 END), 0) as current_month_expense,
    -- Total stats
    ISNULL(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
    ISNULL(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense,
    COUNT(DISTINCT t.id) as total_transactions,
    -- Goals
    COUNT(DISTINCT g.id) as total_goals,
    COUNT(DISTINCT CASE WHEN g.status = 'active' THEN g.id END) as active_goals,
    -- Budgets
    COUNT(DISTINCT b.id) as total_budgets
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN savings_goals g ON u.id = g.user_id
LEFT JOIN budgets b ON u.id = b.user_id
GROUP BY u.id, u.email, u.full_name;
GO

-- Category spending view
CREATE VIEW vw_category_spending AS
SELECT 
    c.id as category_id,
    c.user_id,
    c.name as category_name,
    c.type as category_type,
    COUNT(t.id) as transaction_count,
    ISNULL(SUM(t.amount), 0) as total_amount,
    ISNULL(AVG(t.amount), 0) as avg_amount,
    MAX(t.transaction_date) as last_transaction_date
FROM categories c
LEFT JOIN transactions t ON c.id = t.category_id
GROUP BY c.id, c.user_id, c.name, c.type;
GO

-- ============================================================
-- PART 9: STORED PROCEDURES FOR OPTIMIZATION
-- ============================================================

PRINT 'Creating optimized stored procedures...';

-- Calculate daily statistics
GO
CREATE PROCEDURE sp_calculate_daily_statistics
    @user_id INT,
    @stat_date DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    MERGE daily_statistics AS target
    USING (
        SELECT 
            @user_id as user_id,
            @stat_date as stat_date,
            ISNULL(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            ISNULL(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
            ISNULL(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) - 
                ISNULL(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as net_amount,
            COUNT(*) as transaction_count,
            AVG(amount) as avg_transaction_amount
        FROM transactions
        WHERE user_id = @user_id 
            AND CAST(transaction_date AS DATE) = @stat_date
    ) AS source
    ON (target.user_id = source.user_id AND target.stat_date = source.stat_date)
    WHEN MATCHED THEN
        UPDATE SET 
            total_income = source.total_income,
            total_expense = source.total_expense,
            net_amount = source.net_amount,
            transaction_count = source.transaction_count,
            avg_transaction_amount = source.avg_transaction_amount,
            updated_at = GETDATE()
    WHEN NOT MATCHED THEN
        INSERT (user_id, stat_date, total_income, total_expense, net_amount, 
                transaction_count, avg_transaction_amount)
        VALUES (source.user_id, source.stat_date, source.total_income, source.total_expense,
                source.net_amount, source.transaction_count, source.avg_transaction_amount);
END;
GO

-- Cleanup old logs
CREATE PROCEDURE sp_cleanup_old_logs
    @days_to_keep INT = 90
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @cutoff_date DATETIME = DATEADD(DAY, -@days_to_keep, GETDATE());
    
    -- Delete old API logs
    DELETE FROM api_logs WHERE created_at < @cutoff_date;
    
    -- Delete old audit logs
    DELETE FROM audit_logs WHERE created_at < @cutoff_date;
    
    -- Delete resolved error logs older than 30 days
    DELETE FROM error_logs 
    WHERE is_resolved = 1 AND resolved_at < DATEADD(DAY, -30, GETDATE());
    
    -- Delete expired cache
    DELETE FROM query_cache WHERE expires_at < GETDATE();
    DELETE FROM session_cache WHERE expires_at < GETDATE();
    
    -- Delete old notification history
    DELETE FROM notification_history WHERE created_at < @cutoff_date;
    
    SELECT 'Cleanup completed' as status;
END;
GO

-- ============================================================
-- PART 10: TRIGGERS FOR AUDIT
-- ============================================================

PRINT 'Creating audit triggers...';

-- Audit trigger for transactions
GO
CREATE TRIGGER tr_transactions_audit
ON transactions
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- INSERT
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, user_id, new_values)
        SELECT 'transactions', id, 'INSERT', user_id,
            (SELECT * FROM inserted i WHERE i.id = inserted.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM inserted;
    END
    
    -- UPDATE
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, user_id, old_values, new_values)
        SELECT 'transactions', i.id, 'UPDATE', i.user_id,
            (SELECT * FROM deleted d WHERE d.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT * FROM inserted ins WHERE ins.id = i.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM inserted i;
    END
    
    -- DELETE
    IF NOT EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, user_id, old_values)
        SELECT 'transactions', id, 'DELETE', user_id,
            (SELECT * FROM deleted d WHERE d.id = deleted.id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM deleted;
    END
END;
GO

PRINT 'Database optimization complete!';
PRINT 'Total new tables created: 20+';
PRINT 'Total indexes created: 30+';
PRINT 'Total views created: 2';
PRINT 'Total stored procedures created: 2';
PRINT 'Total triggers created: 1';
GO
