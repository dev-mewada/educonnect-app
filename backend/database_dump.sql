-- EduConnect Pro MySQL Database Export
-- Generated on: 2026-09-30T09:57:13.272Z

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `live_class_id` int NOT NULL,
  `student_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` timestamp NULL DEFAULT NULL,
  `status` enum('Present','Late','Left_Early') COLLATE utf8mb4_unicode_ci DEFAULT 'Present',
  `duration` int DEFAULT '0',
  `session_code_used` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_student` (`live_class_id`,`student_id`),
  KEY `fk_attendance_student` (`student_id`),
  CONSTRAINT `fk_attendance_live_class` FOREIGN KEY (`live_class_id`) REFERENCES `live_classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `attendance` (`id`, `live_class_id`, `student_id`, `joined_at`, `left_at`, `status`, `duration`, `session_code_used`, `created_at`) VALUES (1, 4, 3, '2026-09-29 11:55:09', NULL, 'Present', 0, 'LIVE-5EFT', '2026-09-29 11:55:09');
INSERT INTO `attendance` (`id`, `live_class_id`, `student_id`, `joined_at`, `left_at`, `status`, `duration`, `session_code_used`, `created_at`) VALUES (2, 5, 3, '2026-09-29 11:57:07', NULL, 'Present', 0, 'LIVE-Z596', '2026-09-29 11:57:07');
INSERT INTO `attendance` (`id`, `live_class_id`, `student_id`, `joined_at`, `left_at`, `status`, `duration`, `session_code_used`, `created_at`) VALUES (3, 6, 3, '2026-09-29 11:58:05', NULL, 'Present', 0, 'LIVE-GZZM', '2026-09-29 11:58:05');
INSERT INTO `attendance` (`id`, `live_class_id`, `student_id`, `joined_at`, `left_at`, `status`, `duration`, `session_code_used`, `created_at`) VALUES (4, 7, 3, '2026-09-29 11:58:36', NULL, 'Present', 0, 'LIVE-KPT3', '2026-09-29 11:58:36');

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `syllabus` text,
  `category` varchar(100) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `duration` varchar(50) DEFAULT '30 Hours',
  `status` enum('Draft','Published','Archived') NOT NULL DEFAULT 'Published',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `courses` (`id`, `teacher_id`, `title`, `description`, `syllabus`, `category`, `image`, `price`, `duration`, `status`, `created_at`, `updated_at`) VALUES (2, 2, 'Artificial Intelligence & Deep Learning', 'Learn neural networks, PyTorch, computer vision, natural language processing, and LLM fine-tuning techniques.', '["Module 1: Python for Data Science & Tensor Math","Module 2: Supervised & Unsupervised Machine Learning","Module 3: Deep Neural Networks with PyTorch","Module 4: Computer Vision & Convolutional Networks","Module 5: Transformers, Attention & Generative AI"]', 'Artificial Intelligence', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80', '4999.00', '38 Hours', 'Published', '2026-09-29 10:55:38', '2026-09-29 10:55:38');
INSERT INTO `courses` (`id`, `teacher_id`, `title`, `description`, `syllabus`, `category`, `image`, `price`, `duration`, `status`, `created_at`, `updated_at`) VALUES (3, 36, 'Cloud Computing & DevOps with AWS', 'Build robust cloud infrastructure using Amazon Web Services, Docker containers, Kubernetes, and GitHub Actions pipelines.', '["Module 1: AWS Core Infrastructure (EC2, S3, RDS, VPC)","Module 2: Containerization with Docker","Module 3: Kubernetes Container Orchestration","Module 4: Infrastructure as Code with Terraform","Module 5: Continuous Integration & Deployment (CI/CD)"]', 'Cloud Computing', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', '2999.00', '28 Hours', 'Published', '2026-09-29 10:55:38', '2026-09-29 10:55:38');
INSERT INTO `courses` (`id`, `teacher_id`, `title`, `description`, `syllabus`, `category`, `image`, `price`, `duration`, `status`, `created_at`, `updated_at`) VALUES (4, 36, 'UI/UX Design Masterclass: Figma to Product', 'Design intuitive, world-class mobile and web user experiences using modern design systems, wireframing, and Figma prototyping.', '["Module 1: User Research & Information Architecture","Module 2: Wireframing & Low-Fidelity Prototyping","Module 3: Figma Design Systems & Auto-Layout","Module 4: High-Fidelity UI & Micro-Interactions","Module 5: Usability Testing & Developer Handoff"]', 'Design', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80', '2499.00', '22 Hours', 'Published', '2026-09-29 10:55:38', '2026-09-29 10:55:38');
INSERT INTO `courses` (`id`, `teacher_id`, `title`, `description`, `syllabus`, `category`, `image`, `price`, `duration`, `status`, `created_at`, `updated_at`) VALUES (5, 2, 'Cybersecurity Analyst Bootcamp', 'Understand vulnerability assessment, penetration testing, network defense protocols, and incident response mitigation.', '["Module 1: Network Fundamentals & Security Architecture","Module 2: Threat Landscape & Common Vulnerabilities","Module 3: Penetration Testing & Ethical Hacking","Module 4: Security Operations Center (SOC) Workflows","Module 5: Cryptography & Security Compliance"]', 'Security', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80', '3999.00', '35 Hours', 'Published', '2026-09-29 10:55:38', '2026-09-29 10:55:38');
INSERT INTO `courses` (`id`, `teacher_id`, `title`, `description`, `syllabus`, `category`, `image`, `price`, `duration`, `status`, `created_at`, `updated_at`) VALUES (7, 2, 'E2E Automated Course - 1790682564528', 'End to end automated verification course with live sessions and real attendance.', '[]', 'Computer Science', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', '1499.00', '6 Weeks', 'Published', '2026-09-29 11:49:24', '2026-09-29 11:49:24');
INSERT INTO `courses` (`id`, `teacher_id`, `title`, `description`, `syllabus`, `category`, `image`, `price`, `duration`, `status`, `created_at`, `updated_at`) VALUES (8, 2, 'E2E Automated Course - 1790682909197', 'End to end automated verification course with live sessions and real attendance.', '[]', 'Computer Science', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', '1499.00', '6 Weeks', 'Published', '2026-09-29 11:55:09', '2026-09-29 11:55:09');
INSERT INTO `courses` (`id`, `teacher_id`, `title`, `description`, `syllabus`, `category`, `image`, `price`, `duration`, `status`, `created_at`, `updated_at`) VALUES (9, 2, 'E2E Automated Course - 1790683027414', 'End to end automated verification course with live sessions and real attendance.', '[]', 'Computer Science', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', '1499.00', '6 Weeks', 'Published', '2026-09-29 11:57:07', '2026-09-29 11:57:07');
INSERT INTO `courses` (`id`, `teacher_id`, `title`, `description`, `syllabus`, `category`, `image`, `price`, `duration`, `status`, `created_at`, `updated_at`) VALUES (10, 2, 'E2E Automated Course - 1790683085661', 'End to end automated verification course with live sessions and real attendance.', '[]', 'Computer Science', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', '1499.00', '6 Weeks', 'Published', '2026-09-29 11:58:05', '2026-09-29 11:58:05');
INSERT INTO `courses` (`id`, `teacher_id`, `title`, `description`, `syllabus`, `category`, `image`, `price`, `duration`, `status`, `created_at`, `updated_at`) VALUES (11, 2, 'E2E Automated Course - 1790683116132', 'End to end automated verification course with live sessions and real attendance.', '[]', 'Computer Science', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', '1499.00', '6 Weeks', 'Published', '2026-09-29 11:58:36', '2026-09-29 11:58:36');

DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `progress` int NOT NULL DEFAULT '0',
  `status` enum('Active','Completed','Dropped') NOT NULL DEFAULT 'Active',
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_course` (`student_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `progress`, `status`, `enrolled_at`) VALUES (2, 3, 2, 30, 'Active', '2026-09-22 10:55:38');
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `progress`, `status`, `enrolled_at`) VALUES (4, 35, 3, 10, 'Active', '2026-09-26 10:55:38');
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `progress`, `status`, `enrolled_at`) VALUES (5, 3, 8, 0, 'Active', '2026-09-29 11:55:09');
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `progress`, `status`, `enrolled_at`) VALUES (6, 3, 9, 0, 'Active', '2026-09-29 11:57:07');
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `progress`, `status`, `enrolled_at`) VALUES (7, 3, 10, 0, 'Active', '2026-09-29 11:58:05');
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `progress`, `status`, `enrolled_at`) VALUES (8, 3, 11, 0, 'Active', '2026-09-29 11:58:36');

DROP TABLE IF EXISTS `live_classes`;
CREATE TABLE `live_classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `scheduled_at` varchar(100) NOT NULL,
  `meeting_link` varchar(255) NOT NULL,
  `status` enum('Upcoming','Live','Completed') NOT NULL DEFAULT 'Upcoming',
  `session_code` varchar(20) DEFAULT NULL,
  `attendees_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actual_start_time` datetime DEFAULT NULL,
  `actual_end_time` datetime DEFAULT NULL,
  `recording_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `live_classes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `live_classes_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `live_classes` (`id`, `course_id`, `teacher_id`, `title`, `description`, `scheduled_at`, `meeting_link`, `status`, `session_code`, `attendees_count`, `created_at`, `actual_start_time`, `actual_end_time`, `recording_url`) VALUES (2, 2, 2, 'Transformer Architecture & Attention Mechanisms', 'Interactive lecture on self-attention layers, encoder-decoder transformers, and multi-head attention math.', 'Tomorrow, 06:30 PM', 'https://meet.jit.si/educonnect-live-ai', 'Live', 'LIVE-6PBP', 0, '2026-09-29 10:55:38', '2026-09-30 09:41:23', NULL, NULL);
INSERT INTO `live_classes` (`id`, `course_id`, `teacher_id`, `title`, `description`, `scheduled_at`, `meeting_link`, `status`, `session_code`, `attendees_count`, `created_at`, `actual_start_time`, `actual_end_time`, `recording_url`) VALUES (3, 3, 36, 'Deploying High-Availability Kubernetes Clusters', 'Hands-on live deployment of containerized microservices to AWS EKS with load balancing.', 'Friday, 04:00 PM', 'https://meet.jit.si/educonnect-live-cloud', 'Upcoming', NULL, 0, '2026-09-29 10:55:38', NULL, NULL, NULL);
INSERT INTO `live_classes` (`id`, `course_id`, `teacher_id`, `title`, `description`, `scheduled_at`, `meeting_link`, `status`, `session_code`, `attendees_count`, `created_at`, `actual_start_time`, `actual_end_time`, `recording_url`) VALUES (4, 8, 2, 'E2E Hands-on Live Lab', 'Interactive session with real session code attendance verification', '2026-09-29 12:55:09', 'https://meet.google.com/edu-e2e-test', 'Completed', 'LIVE-5EFT', 1, '2026-09-29 11:55:09', '2026-09-29 11:55:09', '2026-09-29 11:55:09', NULL);
INSERT INTO `live_classes` (`id`, `course_id`, `teacher_id`, `title`, `description`, `scheduled_at`, `meeting_link`, `status`, `session_code`, `attendees_count`, `created_at`, `actual_start_time`, `actual_end_time`, `recording_url`) VALUES (5, 9, 2, 'E2E Hands-on Live Lab', 'Interactive session with real session code attendance verification', '2026-09-29 12:57:07', 'https://meet.google.com/edu-e2e-test', 'Completed', 'LIVE-Z596', 1, '2026-09-29 11:57:07', '2026-09-29 11:57:07', '2026-09-29 11:57:07', NULL);
INSERT INTO `live_classes` (`id`, `course_id`, `teacher_id`, `title`, `description`, `scheduled_at`, `meeting_link`, `status`, `session_code`, `attendees_count`, `created_at`, `actual_start_time`, `actual_end_time`, `recording_url`) VALUES (6, 10, 2, 'E2E Hands-on Live Lab', 'Interactive session with real session code attendance verification', '2026-09-29 12:58:05', 'https://meet.google.com/edu-e2e-test', 'Completed', 'LIVE-GZZM', 1, '2026-09-29 11:58:05', '2026-09-29 11:58:05', '2026-09-29 11:58:05', NULL);
INSERT INTO `live_classes` (`id`, `course_id`, `teacher_id`, `title`, `description`, `scheduled_at`, `meeting_link`, `status`, `session_code`, `attendees_count`, `created_at`, `actual_start_time`, `actual_end_time`, `recording_url`) VALUES (7, 11, 2, 'E2E Hands-on Live Lab', 'Interactive session with real session code attendance verification', '2026-09-29 12:58:36', 'https://meet.google.com/edu-e2e-test', 'Completed', 'LIVE-KPT3', 1, '2026-09-29 11:58:36', '2026-09-29 11:58:36', '2026-09-29 11:58:36', NULL);

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (1, 1, 2, 'Hello instructor, welcome to EduConnect Pro! Please make sure your upcoming live lecture schedule is set up.', 1, '2026-09-27 10:55:38');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (2, 2, 1, 'Thank you Admin, the syllabus and live workshops are scheduled for this week.', 1, '2026-09-28 10:55:38');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (3, 2, 3, 'Hello! Please review chapter 3 on React Hooks before today’s live workshop session.', 1, '2026-09-29 05:55:38');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (4, 3, 2, 'Thank you professor, I completed the assignment and look forward to the session!', 1, '2026-09-29 06:55:38');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (5, 1, 3, 'Welcome to EduConnect Pro! Let us know if you need any assistance with course enrollment or certificates.', 1, '2026-09-29 09:55:38');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (6, 1, 3, 'hi', 1, '2026-09-29 11:26:56');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (7, 3, 1, 'how are you', 1, '2026-09-29 11:29:46');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (8, 1, 3, 'how can i help you', 1, '2026-09-29 11:30:26');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (9, 3, 1, 'ok  nothing', 1, '2026-09-29 11:31:12');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (10, 3, 1, 'hi', 1, '2026-09-29 11:32:33');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (11, 1, 2, 'Hello Teacher! Automated admin message.', 1, '2026-09-29 11:57:07');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (12, 2, 1, 'Thank you Admin! Teacher replying.', 0, '2026-09-29 11:57:07');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (13, 2, 3, 'Welcome to the course, Student!', 1, '2026-09-29 11:57:07');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (14, 3, 2, 'Thank you Professor! Excited for the live classes.', 1, '2026-09-29 11:57:07');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (15, 1, 3, 'Welcome to EduConnect Pro platform, Student!', 1, '2026-09-29 11:57:07');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (16, 3, 1, 'Thank you Admin for the welcome!', 0, '2026-09-29 11:57:07');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (17, 1, 2, 'Hello Teacher! Automated admin message.', 1, '2026-09-29 11:58:05');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (18, 2, 1, 'Thank you Admin! Teacher replying.', 0, '2026-09-29 11:58:05');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (19, 2, 3, 'Welcome to the course, Student!', 1, '2026-09-29 11:58:05');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (20, 3, 2, 'Thank you Professor! Excited for the live classes.', 1, '2026-09-29 11:58:05');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (21, 1, 3, 'Welcome to EduConnect Pro platform, Student!', 1, '2026-09-29 11:58:05');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (22, 3, 1, 'Thank you Admin for the welcome!', 0, '2026-09-29 11:58:06');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (23, 1, 2, 'Hello Teacher! Automated admin message.', 1, '2026-09-29 11:58:36');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (24, 2, 1, 'Thank you Admin! Teacher replying.', 0, '2026-09-29 11:58:36');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (25, 2, 3, 'Welcome to the course, Student!', 1, '2026-09-29 11:58:36');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (26, 3, 2, 'Thank you Professor! Excited for the live classes.', 1, '2026-09-29 11:58:36');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (27, 1, 3, 'Welcome to EduConnect Pro platform, Student!', 1, '2026-09-29 11:58:36');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (28, 3, 1, 'Thank you Admin for the welcome!', 0, '2026-09-29 11:58:36');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (29, 3, 2, 'hi', 1, '2026-09-30 09:24:51');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (30, 3, 42, 'hi', 1, '2026-09-30 09:26:10');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (31, 42, 3, 'how are you', 1, '2026-09-30 09:29:59');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (32, 42, 3, 'hi', 1, '2026-09-30 09:32:24');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES (33, 3, 42, 'good', 0, '2026-09-30 09:33:04');

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'system',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `applicant_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (31, 1, 'New Student Registration Request', 'Hojito Student has requested registration as a Student.', 'registration', 1, 35, '2026-09-28 12:23:04');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (32, 1, 'New Teacher Registration Request', 'Pejaro Teacher has requested registration as a Teacher.', 'registration', 1, 36, '2026-09-28 12:23:04');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (33, 35, 'Registration Approved', 'Your registration request has been approved. A 6-digit OTP has been sent to your registered email.', 'registration_approval', 1, 35, '2026-09-29 05:13:56');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (34, 36, 'Registration Approved', 'Your registration request has been approved. A 6-digit OTP has been sent to your registered email.', 'registration_approval', 1, 36, '2026-09-29 05:14:01');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (35, 1, 'New Student Registration Request', 'Vijendra has requested registration as a Student.', 'registration', 1, 37, '2026-09-29 05:36:41');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (36, 37, 'Registration Approved', 'Your registration request has been approved. A 6-digit OTP has been sent to your registered email.', 'registration_approval', 0, 37, '2026-09-29 05:36:57');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (42, 1, 'New Student Registration Request', 'vijendra has requested registration as a Student.', 'registration', 1, 41, '2026-09-29 09:10:49');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (43, 41, 'Registration Approved', 'Your registration request has been approved. A 6-digit OTP has been sent to your registered email.', 'registration_approval', 1, 41, '2026-09-29 09:11:21');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (44, 1, 'New Teacher Registration Request', 'Sohab ganda baccha has requested registration as a Teacher.', 'registration', 1, 42, '2026-09-29 09:22:34');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (45, 42, 'Registration Approved', 'Your registration request has been approved. A 6-digit OTP has been sent to your registered email.', 'registration_approval', 1, 42, '2026-09-29 09:23:15');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (48, 3, 'Welcome to EduConnect Pro', 'Explore our comprehensive courses and start learning with top educators.', 'general', 1, NULL, '2026-09-15 10:55:38');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (49, 3, 'Course Enrollment Confirmed', 'You are now actively enrolled in Full Stack Web Development (MERN).', 'enrollment', 1, NULL, '2026-09-15 10:55:38');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (50, 2, 'Course Published', 'Your course "Full Stack Web Development (MERN)" is published and open for enrollments.', 'course', 1, NULL, '2026-09-15 10:55:38');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (51, 3, 'New Message', 'You received a new message from Admin User: "hi"', 'message', 1, NULL, '2026-09-29 11:26:56');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (52, 1, 'New Message', 'You received a new message from Demo Student: "how are you"', 'message', 0, NULL, '2026-09-29 11:29:46');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (53, 3, 'New Message', 'You received a new message from Admin User: "how can i help you"', 'message', 1, NULL, '2026-09-29 11:30:26');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (54, 1, 'New Message', 'You received a new message from Demo Student: "ok  nothing"', 'message', 0, NULL, '2026-09-29 11:31:12');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (55, 1, 'New Message', 'You received a new message from Demo Student: "hi"', 'message', 0, NULL, '2026-09-29 11:32:33');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (56, 3, 'Enrollment Confirmed', 'You have successfully enrolled in "E2E Automated Course - 1790682909197". Start learning today!', 'enrollment', 0, NULL, '2026-09-29 11:55:09');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (57, 2, 'New Student Enrolled', 'Demo Student has enrolled in your course "E2E Automated Course - 1790682909197".', 'course_enrollment', 0, NULL, '2026-09-29 11:55:09');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (58, 3, 'New Live Class Scheduled', '"E2E Hands-on Live Lab" for your course "E2E Automated Course - 1790682909197" has been scheduled for 2026-09-29 12:55:09.', 'live_class_scheduled', 0, NULL, '2026-09-29 11:55:09');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (59, 3, 'Live Class is LIVE Now!', '"E2E Hands-on Live Lab" is now active. Join the class and check in!', 'live_class_started', 0, NULL, '2026-09-29 11:55:09');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (60, 3, 'Attendance Recorded', 'Your attendance for "E2E Hands-on Live Lab" has been successfully recorded as Present.', 'attendance_confirmed', 0, NULL, '2026-09-29 11:55:09');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (61, 3, 'Enrollment Confirmed', 'You have successfully enrolled in "E2E Automated Course - 1790683027414". Start learning today!', 'enrollment', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (62, 2, 'New Student Enrolled', 'Demo Student has enrolled in your course "E2E Automated Course - 1790683027414".', 'course_enrollment', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (63, 3, 'New Live Class Scheduled', '"E2E Hands-on Live Lab" for your course "E2E Automated Course - 1790683027414" has been scheduled for 2026-09-29 12:57:07.', 'live_class_scheduled', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (64, 3, 'Live Class is LIVE Now!', '"E2E Hands-on Live Lab" is now active. Join the class and check in!', 'live_class_started', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (65, 3, 'Attendance Recorded', 'Your attendance for "E2E Hands-on Live Lab" has been successfully recorded as Present.', 'attendance_confirmed', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (66, 2, 'New Message', 'You received a new message from Admin User: "Hello Teacher! Automated admin message."', 'message', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (67, 1, 'New Message', 'You received a new message from Demo Teacher: "Thank you Admin! Teacher replying."', 'message', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (68, 3, 'New Message', 'You received a new message from Demo Teacher: "Welcome to the course, Student!"', 'message', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (69, 2, 'New Message', 'You received a new message from Demo Student: "Thank you Professor! Excited for the live classes."', 'message', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (70, 3, 'New Message', 'You received a new message from Admin User: "Welcome to EduConnect Pro platform, Student!"', 'message', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (71, 1, 'New Message', 'You received a new message from Demo Student: "Thank you Admin for the welcome!"', 'message', 0, NULL, '2026-09-29 11:57:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (72, 3, 'Enrollment Confirmed', 'You have successfully enrolled in "E2E Automated Course - 1790683085661". Start learning today!', 'enrollment', 0, NULL, '2026-09-29 11:58:05');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (73, 2, 'New Student Enrolled', 'Demo Student has enrolled in your course "E2E Automated Course - 1790683085661".', 'course_enrollment', 0, NULL, '2026-09-29 11:58:05');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (74, 3, 'New Live Class Scheduled', '"E2E Hands-on Live Lab" for your course "E2E Automated Course - 1790683085661" has been scheduled for 2026-09-29 12:58:05.', 'live_class_scheduled', 0, NULL, '2026-09-29 11:58:05');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (75, 3, 'Live Class is LIVE Now!', '"E2E Hands-on Live Lab" is now active. Join the class and check in!', 'live_class_started', 0, NULL, '2026-09-29 11:58:05');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (76, 3, 'Attendance Recorded', 'Your attendance for "E2E Hands-on Live Lab" has been successfully recorded as Present.', 'attendance_confirmed', 0, NULL, '2026-09-29 11:58:05');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (77, 2, 'New Message', 'You received a new message from Admin User: "Hello Teacher! Automated admin message."', 'message', 0, NULL, '2026-09-29 11:58:05');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (78, 1, 'New Message', 'You received a new message from Demo Teacher: "Thank you Admin! Teacher replying."', 'message', 0, NULL, '2026-09-29 11:58:05');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (79, 3, 'New Message', 'You received a new message from Demo Teacher: "Welcome to the course, Student!"', 'message', 0, NULL, '2026-09-29 11:58:05');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (80, 2, 'New Message', 'You received a new message from Demo Student: "Thank you Professor! Excited for the live classes."', 'message', 0, NULL, '2026-09-29 11:58:05');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (81, 3, 'New Message', 'You received a new message from Admin User: "Welcome to EduConnect Pro platform, Student!"', 'message', 0, NULL, '2026-09-29 11:58:05');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (82, 1, 'New Message', 'You received a new message from Demo Student: "Thank you Admin for the welcome!"', 'message', 0, NULL, '2026-09-29 11:58:06');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (83, 3, 'Enrollment Confirmed', 'You have successfully enrolled in "E2E Automated Course - 1790683116132". Start learning today!', 'enrollment', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (84, 2, 'New Student Enrolled', 'Demo Student has enrolled in your course "E2E Automated Course - 1790683116132".', 'course_enrollment', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (85, 3, 'New Live Class Scheduled', '"E2E Hands-on Live Lab" for your course "E2E Automated Course - 1790683116132" has been scheduled for 2026-09-29 12:58:36.', 'live_class_scheduled', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (86, 3, 'Live Class is LIVE Now!', '"E2E Hands-on Live Lab" is now active. Join the class and check in!', 'live_class_started', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (87, 3, 'Attendance Recorded', 'Your attendance for "E2E Hands-on Live Lab" has been successfully recorded as Present.', 'attendance_confirmed', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (88, 2, 'New Message', 'You received a new message from Admin User: "Hello Teacher! Automated admin message."', 'message', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (89, 1, 'New Message', 'You received a new message from Demo Teacher: "Thank you Admin! Teacher replying."', 'message', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (90, 3, 'New Message', 'You received a new message from Demo Teacher: "Welcome to the course, Student!"', 'message', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (91, 2, 'New Message', 'You received a new message from Demo Student: "Thank you Professor! Excited for the live classes."', 'message', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (92, 3, 'New Message', 'You received a new message from Admin User: "Welcome to EduConnect Pro platform, Student!"', 'message', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (93, 1, 'New Message', 'You received a new message from Demo Student: "Thank you Admin for the welcome!"', 'message', 0, NULL, '2026-09-29 11:58:36');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (94, 2, 'New Message', 'You received a new message from Demo Student: "hi"', 'message', 0, NULL, '2026-09-30 09:24:51');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (95, 42, 'New Message', 'You received a new message from Demo Student: "hi"', 'message', 0, NULL, '2026-09-30 09:26:10');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (96, 3, 'New Message', 'You received a new message from Sohab ganda baccha: "how are you"', 'message', 0, NULL, '2026-09-30 09:29:59');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (97, 3, 'New Message', 'You received a new message from Sohab ganda baccha: "hi"', 'message', 0, NULL, '2026-09-30 09:32:24');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (98, 42, 'New Message', 'You received a new message from Demo Student: "good"', 'message', 0, NULL, '2026-09-30 09:33:04');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `applicant_id`, `created_at`) VALUES (99, 3, 'Live Class is LIVE Now!', '"Transformer Architecture & Attention Mechanisms" is now active. Join the class and check in!', 'live_class_started', 0, NULL, '2026-09-30 09:41:23');

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `rating` int NOT NULL,
  `review` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `reviews` (`id`, `student_id`, `course_id`, `rating`, `review`, `created_at`) VALUES (2, 3, 2, 5, 'Prof. explains complex mathematical and architectural concepts with remarkable clarity!', '2026-09-27 10:55:38');

DROP TABLE IF EXISTS `student_details`;
CREATE TABLE `student_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `grade_level` varchar(50) DEFAULT NULL,
  `interests` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_details_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `student_details` (`id`, `student_id`, `grade_level`, `interests`, `created_at`) VALUES (23, 35, 'Grade 12', 'Science, Technology', '2026-09-28 12:23:04');
INSERT INTO `student_details` (`id`, `student_id`, `grade_level`, `interests`, `created_at`) VALUES (24, 37, NULL, NULL, '2026-09-29 05:36:41');
INSERT INTO `student_details` (`id`, `student_id`, `grade_level`, `interests`, `created_at`) VALUES (28, 41, NULL, NULL, '2026-09-29 09:10:49');
INSERT INTO `student_details` (`id`, `student_id`, `grade_level`, `interests`, `created_at`) VALUES (30, 3, 'Computer Science Undergraduate', 'Web Development, Artificial Intelligence, Cloud', '2026-09-29 10:55:38');

DROP TABLE IF EXISTS `teacher_details`;
CREATE TABLE `teacher_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int NOT NULL,
  `subject` varchar(150) NOT NULL,
  `experience` varchar(50) NOT NULL,
  `qualification` varchar(255) NOT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `approval_status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Approved',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `teacher_details_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `teacher_details` (`id`, `teacher_id`, `subject`, `experience`, `qualification`, `resume`, `approval_status`, `created_at`) VALUES (1, 2, 'Artificial Intelligence & Computer Science', '8 Years', 'Ph.D. in Computer Science', NULL, 'Approved', '2026-09-26 10:48:25');
INSERT INTO `teacher_details` (`id`, `teacher_id`, `subject`, `experience`, `qualification`, `resume`, `approval_status`, `created_at`) VALUES (11, 36, 'Computer Science', '7 Years', 'Master of Science', NULL, 'Approved', '2026-09-28 12:23:04');
INSERT INTO `teacher_details` (`id`, `teacher_id`, `subject`, `experience`, `qualification`, `resume`, `approval_status`, `created_at`) VALUES (12, 42, 'Auto matic Tester', '0', '0', NULL, 'Approved', '2026-09-29 09:22:34');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(191) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Student','Teacher','Admin') NOT NULL DEFAULT 'Student',
  `profile_photo` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected','Active','Inactive','Suspended') NOT NULL DEFAULT 'Pending',
  `verification_otp` varchar(255) DEFAULT NULL,
  `verification_otp_expiry` datetime DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `otp_attempts` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `dob`, `password_hash`, `role`, `profile_photo`, `status`, `verification_otp`, `verification_otp_expiry`, `is_verified`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`, `otp_attempts`) VALUES (1, 'Admin User', 'admin@educonnect.com', '+91 9876543210', '1989-12-31 18:30:00', '$2a$10$elQE33hZAo8MinQDHBtcyueRKAqMU1HwLpX0lvfK7.KzXbTG4fIvq', 'Admin', NULL, 'Active', NULL, NULL, 1, NULL, NULL, '2026-09-26 10:48:25', '2026-09-28 12:11:01', 0);
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `dob`, `password_hash`, `role`, `profile_photo`, `status`, `verification_otp`, `verification_otp_expiry`, `is_verified`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`, `otp_attempts`) VALUES (2, 'Demo Teacher', 'teacher@educonnect.com', '+91 9876543211', '1985-05-14 18:30:00', '$2a$10$gY4NTZJyNkeKsxUmRUy4OuCMCcSKZlD/HoNcW4Tm.nomDKs5eIjdq', 'Teacher', NULL, 'Active', NULL, NULL, 1, NULL, NULL, '2026-09-26 10:48:25', '2026-09-28 09:29:33', 0);
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `dob`, `password_hash`, `role`, `profile_photo`, `status`, `verification_otp`, `verification_otp_expiry`, `is_verified`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`, `otp_attempts`) VALUES (3, 'vijendra', 'student@educonnect.com', '7894556120', '2000-01-30 18:30:00', '$2a$10$thdJq.UM2nEL35iTb1RuEO/s200pF7ucUASAvnC20NBcix2SUOeTG', 'Student', NULL, 'Active', NULL, NULL, 1, NULL, NULL, '2026-09-26 10:48:25', '2026-09-30 09:39:54', 0);
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `dob`, `password_hash`, `role`, `profile_photo`, `status`, `verification_otp`, `verification_otp_expiry`, `is_verified`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`, `otp_attempts`) VALUES (35, 'Hojito Student', 'hojito2245@hiredify.com', '9876543220', '2004-03-14 18:30:00', '$2a$10$1ngL8zDCHWtpZN4nKhh.Delj87V53g7CCddYxNZ3FJIm0Bbnp46si', 'Student', NULL, 'Active', NULL, NULL, 1, '938582', '2026-09-29 05:41:11', '2026-09-28 12:23:04', '2026-09-29 05:26:11', 0);
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `dob`, `password_hash`, `role`, `profile_photo`, `status`, `verification_otp`, `verification_otp_expiry`, `is_verified`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`, `otp_attempts`) VALUES (36, 'Pejaro Teacher', 'pejaro4376@hiredify.com', '9876543221', '1988-11-19 18:30:00', '$2a$10$v74eOctM9Aq.njVyZTYLu.YxJofwNYZywaOWhS9AGX9A/8i/9LZ/O', 'Teacher', NULL, 'Active', NULL, NULL, 1, NULL, NULL, '2026-09-28 12:23:04', '2026-09-29 06:07:44', 0);
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `dob`, `password_hash`, `role`, `profile_photo`, `status`, `verification_otp`, `verification_otp_expiry`, `is_verified`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`, `otp_attempts`) VALUES (37, 'Vijendra', 'roxoyax597@pumpoly.com', '7418529635', '2004-02-04 18:30:00', '$2a$10$vzhgrwU1x9jXxtCuHg.7CewS5UO3pCo1EzGdfZUlz6lAx5TdPZJxy', 'Student', NULL, 'Approved', '864938', '2026-09-29 08:46:08', 0, NULL, NULL, '2026-09-29 05:36:41', '2026-09-29 08:36:08', 0);
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `dob`, `password_hash`, `role`, `profile_photo`, `status`, `verification_otp`, `verification_otp_expiry`, `is_verified`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`, `otp_attempts`) VALUES (41, 'vijendra', 'toxocik851@hiredify.com', '7418529632', '2004-02-21 18:30:00', '$2a$10$O5b1e0ZlozLzgZz74.kOou/JCkojwF7t0lKwybSAieMnaPtYXOsx6', 'Student', NULL, 'Active', NULL, NULL, 1, NULL, NULL, '2026-09-29 09:10:49', '2026-09-29 09:15:04', 0);
INSERT INTO `users` (`id`, `name`, `email`, `mobile`, `dob`, `password_hash`, `role`, `profile_photo`, `status`, `verification_otp`, `verification_otp_expiry`, `is_verified`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`, `otp_attempts`) VALUES (42, 'Demo Student', 'tohin81905@hiredify.com', '+91 9876543212', '2002-08-18 18:30:00', '$2a$10$cwlds/MNNA2fdPwG/yhmWeoUArltDIG1o1OpHLS7JD3SfIuCk8BJa', 'Teacher', NULL, 'Active', NULL, NULL, 1, NULL, NULL, '2026-09-29 09:22:34', '2026-09-30 09:32:39', 0);

SET FOREIGN_KEY_CHECKS = 1;
