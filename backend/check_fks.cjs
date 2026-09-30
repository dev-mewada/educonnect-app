const pool = require('./config/db');

async function run() {
  try {
    const [fks] = await pool.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'educonnect_pro' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.log('Existing Foreign Keys:');
    console.table(fks);

    const [indexes] = await pool.query(`
      SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = 'educonnect_pro'
    `);
    console.log('Existing Indexes:');
    console.table(indexes);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
run();
