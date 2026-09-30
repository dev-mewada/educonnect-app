const db = require('./config/db');

(async () => {
  try {
    const [tables] = await db.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('All Tables in Database:', tableNames);

    for (const name of tableNames) {
      const [cols] = await db.query(`DESCRIBE \`${name}\``);
      const [rows] = await db.query(`SELECT COUNT(*) as count FROM \`${name}\``);
      console.log(`\n=== Table: ${name} (Row count: ${rows[0].count}) ===`);
      console.table(cols.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key, Default: c.Default })));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
