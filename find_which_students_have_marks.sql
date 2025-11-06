-- ===================================
-- FIND WHICH STUDENTS HAVE MARKS
-- ===================================

-- Query 1: Show which classes have marks entered
SELECT
  c.id as class_id,
  c.class_name,
  c.section,
  c.academic_year,
  COUNT(DISTINCT s.id) as total_students_in_class,
  COUNT(DISTINCT m.student_id) as students_with_marks,
  COUNT(m.id) as total_marks_records
FROM classes c
INNER JOIN students s ON c.id = s.class_id AND c.tenant_id = s.tenant_id
LEFT JOIN marks m ON s.id = m.student_id AND s.tenant_id = m.tenant_id
WHERE c.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
GROUP BY c.id, c.class_name, c.section, c.academic_year
ORDER BY c.class_name, c.section;

-- Query 2: Specifically check Nursery A students
SELECT
  s.id as student_id,
  s.name as student_name,
  s.roll_no,
  s.admission_no,
  COUNT(m.id) as marks_count
FROM students s
LEFT JOIN marks m ON s.id = m.student_id AND s.tenant_id = m.tenant_id
WHERE s.class_id = '7fd0aaac-c788-4615-9475-b4307b307ea0'
  AND s.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
GROUP BY s.id, s.name, s.roll_no, s.admission_no
ORDER BY s.roll_no;

-- Query 3: Show sample marks data to see which students they belong to
SELECT
  s.name as student_name,
  s.admission_no,
  c.class_name,
  c.section,
  sub.name as subject_name,
  e.name as exam_name,
  m.marks_obtained,
  m.grade
FROM marks m
INNER JOIN students s ON m.student_id = s.id
INNER JOIN classes c ON s.class_id = c.id
INNER JOIN subjects sub ON m.subject_id = sub.id
INNER JOIN exams e ON m.exam_id = e.id
WHERE m.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
ORDER BY c.class_name, c.section, s.roll_no, sub.name
LIMIT 50;

-- Query 4: Count marks by class
SELECT
  c.class_name || ' - ' || c.section as class_section,
  COUNT(m.id) as marks_count
FROM marks m
INNER JOIN students s ON m.student_id = s.id
INNER JOIN classes c ON s.class_id = c.id
WHERE m.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
GROUP BY c.class_name, c.section
ORDER BY c.class_name, c.section;
