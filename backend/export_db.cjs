const fs = require('fs');
const path = require('path');
const db = require('./config/db');

(async () => {
  try {
    const [tables] = await db.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    let sqlOutput = `-- EduConnect Pro MySQL Database Export\n-- Generated on: ${new Date().toISOString()}\n\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

    for (const table of tableNames) {
      const [[createTable]] = await db.query(`SHOW CREATE TABLE \`${table}\``);
      sqlOutput += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      sqlOutput += `${createTable['Create Table']};\n\n`;

      const [rows] = await db.query(`SELECT * FROM \`${table}\``);
      if (rows.length > 0) {
        for (const row of rows) {
          const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (typeof val === 'boolean') return val ? 1 : 0;
            return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
          }).join(', ');
          sqlOutput += `INSERT INTO \`${table}\` (${keys}) VALUES (${values});\n`;
        }
        sqlOutput += `\n`;
      }
    }

    sqlOutput += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    const outPath = path.resolve(__dirname, 'database_dump.sql');
    fs.writeFileSync(outPath, sqlOutput, 'utf8');
    console.log(`✅ Database dump created successfully at: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(2)} KB)`);
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  }
})();
