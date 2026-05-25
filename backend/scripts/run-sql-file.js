const fs = require('fs');
const path = require('path');
const sql = require('mssql');

const root = path.resolve(__dirname, '..');
const fileArg = process.argv[2];

if (!fileArg) {
  console.error('Usage: node scripts/run-sql-file.js <sql-file>');
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
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

  const sqlPath = path.resolve(root, fileArg);
  await pool.request().batch(fs.readFileSync(sqlPath, 'utf8'));

  console.log(`Ran ${path.relative(root, sqlPath)}`);
  await pool.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
