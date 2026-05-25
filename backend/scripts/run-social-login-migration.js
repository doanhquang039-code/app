const fs = require('fs');
const path = require('path');
const sql = require('mssql');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');
const migrationPath = path.join(root, 'migrations', '20260523_AddSocialLoginToUsers.sql');

const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2];
}

async function main() {
  const pool = await sql.connect({
    server: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT || 1433),
    user: env.DB_USERNAME || 'sa',
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE || 'ExpenseTrackerDB',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  });

  await pool.request().batch(fs.readFileSync(migrationPath, 'utf8'));

  const result = await pool.request().query(`
    SELECT name
    FROM sys.columns
    WHERE object_id = OBJECT_ID('Users')
      AND name IN ('authProvider', 'socialProviderId', 'avatarUrl', 'lastLoginAt', 'createdAt', 'password')
    ORDER BY name
  `);

  console.log(result.recordset.map((row) => row.name).join(','));
  await pool.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
