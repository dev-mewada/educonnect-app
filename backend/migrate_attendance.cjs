const pool = require('./config/db');

async function migrate() {
  console.log('🔄 Checking database schema for Live Classes and Attendance...');
  try {
    // 1. Check columns in live_classes
    const [cols] = await pool.query('DESCRIBE live_classes');
    const existingColNames = cols.map(c => c.Field);
    console.log('Existing live_classes columns:', existingColNames.join(', '));

    if (!existingColNames.includes('description')) {
      console.log('Adding column description to live_classes...');
      await pool.query('ALTER TABLE live_classes ADD COLUMN description TEXT NULL AFTER title');
    }
    if (!existingColNames.includes('session_code')) {
      console.log('Adding column session_code to live_classes...');
      await pool.query('ALTER TABLE live_classes ADD COLUMN session_code VARCHAR(20) NULL AFTER status');
    }
    if (!existingColNames.includes('actual_start_time')) {
      console.log('Adding column actual_start_time to live_classes...');
      await pool.query('ALTER TABLE live_classes ADD COLUMN actual_start_time DATETIME NULL');
    }
    if (!existingColNames.includes('actual_end_time')) {
      console.log('Adding column actual_end_time to live_classes...');
      await pool.query('ALTER TABLE live_classes ADD COLUMN actual_end_time DATETIME NULL');
    }
    if (!existingColNames.includes('recording_url')) {
      console.log('Adding column recording_url to live_classes...');
      await pool.query('ALTER TABLE live_classes ADD COLUMN recording_url VARCHAR(255) NULL');
    }

    // 2. Check if attendance table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'attendance'");
    if (tables.length === 0) {
      console.log('Creating table attendance...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          live_class_id INT NOT NULL,
          student_id INT NOT NULL,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          left_at TIMESTAMP NULL,
          status ENUM('Present', 'Late', 'Left_Early') DEFAULT 'Present',
          duration INT DEFAULT 0,
          session_code_used VARCHAR(20) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_class_student (live_class_id, student_id),
          CONSTRAINT fk_attendance_live_class FOREIGN KEY (live_class_id) REFERENCES live_classes(id) ON DELETE CASCADE,
          CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table attendance created successfully with foreign keys and unique constraint.');
    } else {
      console.log('Table attendance already exists.');
    }

    // Also check courses table for syllabus or other useful fields
    const [courseCols] = await pool.query('DESCRIBE courses');
    const existingCourseColNames = courseCols.map(c => c.Field);
    if (!existingCourseColNames.includes('syllabus')) {
      console.log('Adding column syllabus to courses...');
      await pool.query('ALTER TABLE courses ADD COLUMN syllabus TEXT NULL AFTER description');
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
