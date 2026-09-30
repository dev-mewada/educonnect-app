-- ============================================================
-- EduConnect Pro — Complete Database Schema (MySQL)
-- Master Requirements Document Specification
-- ============================================================

CREATE DATABASE IF NOT EXISTS educonnect_pro;
USE educonnect_pro;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  mobile VARCHAR(20) NULL,
  dob DATE NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Student', 'Teacher', 'Admin') NOT NULL DEFAULT 'Student',
  profile_photo VARCHAR(255) NULL,
  status ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
  reset_token VARCHAR(255) NULL,
  reset_token_expiry DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Teacher Details Table
CREATE TABLE IF NOT EXISTS teacher_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  subject VARCHAR(150) NOT NULL,
  experience VARCHAR(50) NOT NULL,
  qualification VARCHAR(255) NOT NULL,
  resume VARCHAR(255) NULL,
  approval_status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Student Details Table
CREATE TABLE IF NOT EXISTS student_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  grade_level VARCHAR(50) NULL,
  interests TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  image VARCHAR(255) NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  duration VARCHAR(50) DEFAULT '30 Hours',
  status ENUM('Draft', 'Published', 'Archived') NOT NULL DEFAULT 'Published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  status ENUM('Active', 'Completed', 'Dropped') NOT NULL DEFAULT 'Active',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_course (student_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Live Classes Table
CREATE TABLE IF NOT EXISTS live_classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  scheduled_at VARCHAR(100) NOT NULL,
  meeting_link VARCHAR(255) NOT NULL,
  status ENUM('Upcoming', 'Live', 'Completed') NOT NULL DEFAULT 'Upcoming',
  attendees_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('student', 'course', 'live', 'system') NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed Demo Accounts (Password: Password123)
-- Only 3 test accounts as requested
-- ============================================================
INSERT INTO users (id, name, email, mobile, dob, password_hash, role, status) VALUES
(1, 'Admin User', 'admin@educonnect.com', '+91 9876543210', '1990-01-01', '$2a$10$gY4NTZJyNkeKsxUmRUy4OuCMCcSKZlD/HoNcW4Tm.nomDKs5eIjdq', 'Admin', 'Active'),
(2, 'Demo Teacher', 'teacher@educonnect.com', '+91 9876543211', '1985-05-15', '$2a$10$gY4NTZJyNkeKsxUmRUy4OuCMCcSKZlD/HoNcW4Tm.nomDKs5eIjdq', 'Teacher', 'Active'),
(3, 'Demo Student', 'student@educonnect.com', '+91 9876543212', '2002-08-20', '$2a$10$gY4NTZJyNkeKsxUmRUy4OuCMCcSKZlD/HoNcW4Tm.nomDKs5eIjdq', 'Student', 'Active')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO teacher_details (teacher_id, subject, experience, qualification, approval_status) VALUES
(2, 'Artificial Intelligence & Computer Science', '8 Years', 'Ph.D. in Computer Science', 'Approved')
ON DUPLICATE KEY UPDATE id=id;

