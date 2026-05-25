IF COL_LENGTH('Transactions', 'createdAt') IS NULL
BEGIN
  ALTER TABLE Transactions
  ADD createdAt DATETIME2 NOT NULL CONSTRAINT DF_Transactions_createdAt DEFAULT GETDATE();
END;

IF COL_LENGTH('Wallets', 'createdAt') IS NULL
BEGIN
  ALTER TABLE Wallets
  ADD createdAt DATETIME2 NOT NULL CONSTRAINT DF_Wallets_createdAt DEFAULT GETDATE();
END;
