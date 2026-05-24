IF COL_LENGTH('Users', 'authProvider') IS NULL
BEGIN
  ALTER TABLE Users ADD authProvider NVARCHAR(50) NULL;
END;

IF COL_LENGTH('Users', 'socialProviderId') IS NULL
BEGIN
  ALTER TABLE Users ADD socialProviderId NVARCHAR(255) NULL;
END;

IF COL_LENGTH('Users', 'avatarUrl') IS NULL
BEGIN
  ALTER TABLE Users ADD avatarUrl NVARCHAR(1000) NULL;
END;

IF COL_LENGTH('Users', 'lastLoginAt') IS NULL
BEGIN
  ALTER TABLE Users ADD lastLoginAt DATETIME2 NULL;
END;

IF COL_LENGTH('Users', 'createdAt') IS NULL
BEGIN
  ALTER TABLE Users ADD createdAt DATETIME2 NOT NULL CONSTRAINT DF_Users_createdAt DEFAULT GETDATE();
END;

IF EXISTS (
  SELECT 1
  FROM sys.columns
  WHERE object_id = OBJECT_ID('Users')
    AND name = 'password'
    AND is_nullable = 0
)
BEGIN
  ALTER TABLE Users ALTER COLUMN password NVARCHAR(255) NULL;
END;
