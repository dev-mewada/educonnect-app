const pool = require('./config/db');

async function seed() {
  console.log('Checking if baseline data exists in MySQL...');
  try {
    const [existingCourses] = await pool.query('SELECT COUNT(*) AS count FROM courses');
    if (existingCourses[0].count > 0) {
      console.log('Courses table already has', existingCourses[0].count, 'records. Skipping course seed.');
      process.exit(0);
    }

    console.log('Seeding real initial courses, enrollments, live classes, reviews, and messages into MySQL...');

    // 1. Ensure student_details for student 3 exists
    const [sd3] = await pool.query('SELECT * FROM student_details WHERE student_id = 3');
    if (sd3.length === 0) {
      await pool.query(
        "INSERT INTO student_details (student_id, grade_level, interests, created_at) VALUES (3, 'Computer Science Undergraduate', 'Web Development, Artificial Intelligence, Cloud', NOW())"
      );
    }

    // 2. Insert Courses
    const courses = [
      {
        teacher_id: 2,
        title: 'Full Stack Web Development (MERN)',
        description: 'Master MongoDB, Express.js, React, and Node.js with real-world production projects, CI/CD, and responsive user interfaces.',
        category: 'Web Development',
        image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=600&q=80',
        price: 3499.00,
        duration: '42 Hours',
        status: 'Published',
        syllabus: JSON.stringify([
          'Module 1: HTML5, Modern CSS3 & Responsive Layouts',
          'Module 2: JavaScript ES6+ & Asynchronous Architecture',
          'Module 3: React 18, Custom Hooks & Context API',
          'Module 4: Node.js & Express RESTful APIs',
          'Module 5: MongoDB & MySQL Database Integration',
          'Module 6: Cloud Deployment & CI/CD Pipelines'
        ])
      },
      {
        teacher_id: 2,
        title: 'Artificial Intelligence & Deep Learning',
        description: 'Learn neural networks, PyTorch, computer vision, natural language processing, and LLM fine-tuning techniques.',
        category: 'Artificial Intelligence',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
        price: 4999.00,
        duration: '38 Hours',
        status: 'Published',
        syllabus: JSON.stringify([
          'Module 1: Python for Data Science & Tensor Math',
          'Module 2: Supervised & Unsupervised Machine Learning',
          'Module 3: Deep Neural Networks with PyTorch',
          'Module 4: Computer Vision & Convolutional Networks',
          'Module 5: Transformers, Attention & Generative AI'
        ])
      },
      {
        teacher_id: 36,
        title: 'Cloud Computing & DevOps with AWS',
        description: 'Build robust cloud infrastructure using Amazon Web Services, Docker containers, Kubernetes, and GitHub Actions pipelines.',
        category: 'Cloud Computing',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        price: 2999.00,
        duration: '28 Hours',
        status: 'Published',
        syllabus: JSON.stringify([
          'Module 1: AWS Core Infrastructure (EC2, S3, RDS, VPC)',
          'Module 2: Containerization with Docker',
          'Module 3: Kubernetes Container Orchestration',
          'Module 4: Infrastructure as Code with Terraform',
          'Module 5: Continuous Integration & Deployment (CI/CD)'
        ])
      },
      {
        teacher_id: 36,
        title: 'UI/UX Design Masterclass: Figma to Product',
        description: 'Design intuitive, world-class mobile and web user experiences using modern design systems, wireframing, and Figma prototyping.',
        category: 'Design',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
        price: 2499.00,
        duration: '22 Hours',
        status: 'Published',
        syllabus: JSON.stringify([
          'Module 1: User Research & Information Architecture',
          'Module 2: Wireframing & Low-Fidelity Prototyping',
          'Module 3: Figma Design Systems & Auto-Layout',
          'Module 4: High-Fidelity UI & Micro-Interactions',
          'Module 5: Usability Testing & Developer Handoff'
        ])
      },
      {
        teacher_id: 2,
        title: 'Cybersecurity Analyst Bootcamp',
        description: 'Understand vulnerability assessment, penetration testing, network defense protocols, and incident response mitigation.',
        category: 'Security',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
        price: 3999.00,
        duration: '35 Hours',
        status: 'Published',
        syllabus: JSON.stringify([
          'Module 1: Network Fundamentals & Security Architecture',
          'Module 2: Threat Landscape & Common Vulnerabilities',
          'Module 3: Penetration Testing & Ethical Hacking',
          'Module 4: Security Operations Center (SOC) Workflows',
          'Module 5: Cryptography & Security Compliance'
        ])
      }
    ];

    const courseIds = [];
    for (const c of courses) {
      const [res] = await pool.query(
        `INSERT INTO courses (teacher_id, title, description, category, image, price, duration, status, syllabus, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [c.teacher_id, c.title, c.description, c.category, c.image, c.price, c.duration, c.status, c.syllabus]
      );
      courseIds.push(res.insertId);
    }
    console.log(`✅ Seeded ${courseIds.length} courses: IDs ${courseIds.join(', ')}`);

    // 3. Seed Enrollments
    // Student 3 enrolled in Course 1 (MERN) and Course 2 (AI)
    // Student 35 enrolled in Course 1 (MERN) and Course 3 (Cloud)
    await pool.query(
      `INSERT INTO enrollments (student_id, course_id, progress, status, enrolled_at) VALUES 
       (3, ?, 65, 'Active', DATE_SUB(NOW(), INTERVAL 14 DAY)),
       (3, ?, 30, 'Active', DATE_SUB(NOW(), INTERVAL 7 DAY)),
       (35, ?, 45, 'Active', DATE_SUB(NOW(), INTERVAL 10 DAY)),
       (35, ?, 10, 'Active', DATE_SUB(NOW(), INTERVAL 3 DAY))`,
      [courseIds[0], courseIds[1], courseIds[0], courseIds[2]]
    );
    console.log('✅ Seeded real enrollments in MySQL.');

    // 4. Seed Live Classes
    // Live class 1 for MERN (Teacher 2)
    // Live class 2 for AI (Teacher 2)
    // Live class 3 for Cloud (Teacher 36)
    await pool.query(
      `INSERT INTO live_classes (title, description, course_id, teacher_id, scheduled_at, meeting_link, status, attendees_count, created_at) VALUES 
       ('Live Workshop: Building Production React Hooks', 'Deep dive into performance optimization, useMemo, useCallback, and building high-performance custom hooks.', ?, 2, 'Today, 05:00 PM', 'https://meet.jit.si/educonnect-live-mern', 'Upcoming', 0, NOW()),
       ('Transformer Architecture & Attention Mechanisms', 'Interactive lecture on self-attention layers, encoder-decoder transformers, and multi-head attention math.', ?, 2, 'Tomorrow, 06:30 PM', 'https://meet.jit.si/educonnect-live-ai', 'Upcoming', 0, NOW()),
       ('Deploying High-Availability Kubernetes Clusters', 'Hands-on live deployment of containerized microservices to AWS EKS with load balancing.', ?, 36, 'Friday, 04:00 PM', 'https://meet.jit.si/educonnect-live-cloud', 'Upcoming', 0, NOW())`,
      [courseIds[0], courseIds[1], courseIds[2]]
    );
    console.log('✅ Seeded real live classes in MySQL.');

    // 5. Seed Reviews
    await pool.query(
      `INSERT INTO reviews (student_id, course_id, rating, review, created_at) VALUES 
       (3, ?, 5, 'Exceptional hands-on learning! The projects helped me build confidence and master the full stack.', DATE_SUB(NOW(), INTERVAL 5 DAY)),
       (3, ?, 5, 'Prof. explains complex mathematical and architectural concepts with remarkable clarity!', DATE_SUB(NOW(), INTERVAL 2 DAY)),
       (35, ?, 4, 'Very practical curriculum and clear demonstrations. Really enjoyed the coding challenges.', DATE_SUB(NOW(), INTERVAL 4 DAY))`,
      [courseIds[0], courseIds[1], courseIds[0]]
    );
    console.log('✅ Seeded real reviews in MySQL.');

    // 6. Seed Baseline Messages
    // Admin (1) <-> Teacher (2)
    // Teacher (2) <-> Student (3)
    // Admin (1) <-> Student (3)
    await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at) VALUES 
       (1, 2, 'Hello instructor, welcome to EduConnect Pro! Please make sure your upcoming live lecture schedule is set up.', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
       (2, 1, 'Thank you Admin, the syllabus and live workshops are scheduled for this week.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
       (2, 3, 'Hello! Please review chapter 3 on React Hooks before today’s live workshop session.', 1, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
       (3, 2, 'Thank you professor, I completed the assignment and look forward to the session!', 1, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
       (1, 3, 'Welcome to EduConnect Pro! Let us know if you need any assistance with course enrollment or certificates.', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR))`,
      []
    );
    console.log('✅ Seeded real baseline messages in MySQL.');

    // 7. Seed Initial Notifications
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES 
       (3, 'Welcome to EduConnect Pro', 'Explore our comprehensive courses and start learning with top educators.', 'general', 1, DATE_SUB(NOW(), INTERVAL 14 DAY)),
       (3, 'Course Enrollment Confirmed', 'You are now actively enrolled in Full Stack Web Development (MERN).', 'enrollment', 1, DATE_SUB(NOW(), INTERVAL 14 DAY)),
       (2, 'Course Published', 'Your course "Full Stack Web Development (MERN)" is published and open for enrollments.', 'course', 1, DATE_SUB(NOW(), INTERVAL 14 DAY))`,
      []
    );
    console.log('✅ Seeded real notifications in MySQL.');

    console.log('🎉 Real MySQL baseline data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
