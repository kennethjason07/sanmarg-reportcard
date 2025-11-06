-- ===================================
-- COMPREHENSIVE MARKS VERIFICATION
-- Based on your data entry workflow
-- ===================================

-- Your IDs:
-- Tenant ID: 9abe534f-1a12-474c-a387-f8795ad3ab5a
-- Class ID: 7fd0aaac-c788-4615-9475-b4307b307ea0 (Nursery A)
-- Exam ID: 41263015-7f67-4eeb-88a6-c8ae7892a0c1

-- ===================================
-- STEP 1: Check if marks exist for the selected exam
-- ===================================
SELECT COUNT(*) as marks_count
FROM marks
WHERE exam_id = '41263015-7f67-4eeb-88a6-c8ae7892a0c1'
  AND tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a';
-- Expected: Should be (number of students × number of subjects)
-- For 21 students × 5 subjects = 105 records
-- ⚠️ If this returns 0, marks haven't been entered/saved for this exam yet!


-- ===================================
-- STEP 2: Check ALL exams that have marks
-- ===================================
SELECT
  e.id as exam_id,
  e.name as exam_name,
  e.academic_year,
  c.class_name,
  c.section,
  COUNT(m.id) as marks_entered
FROM exams e
LEFT JOIN marks m ON e.id = m.exam_id AND m.tenant_id = e.tenant_id
LEFT JOIN classes c ON e.class_id = c.id
WHERE e.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
GROUP BY e.id, e.name, e.academic_year, c.class_name, c.section
ORDER BY e.academic_year DESC, c.class_name;
-- This shows which exams have marks entered


-- ===================================
-- STEP 3: View sample marks data (if any exists)
-- ===================================
SELECT
  m.id,
  s.name as student_name,
  s.roll_no,
  sub.name as subject_name,
  e.name as exam_name,
  m.marks_obtained,
  CASE
    WHEN m.marks_obtained = -1 THEN 'AB (Absent)'
    WHEN m.marks_obtained = -2 THEN 'NA (Not Applicable)'
    ELSE m.marks_obtained::text
  END as display_marks,
  m.grade,
  m.max_marks,
  m.remarks
FROM marks m
INNER JOIN students s ON m.student_id = s.id
INNER JOIN subjects sub ON m.subject_id = sub.id
INNER JOIN exams e ON m.exam_id = e.id
WHERE m.exam_id = '41263015-7f67-4eeb-88a6-c8ae7892a0c1'
  AND m.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
ORDER BY s.roll_no, sub.name
LIMIT 20;
-- Shows first 20 mark records for the selected exam


-- ===================================
-- STEP 4: Check marks for specific students
-- ===================================
SELECT
  s.name as student_name,
  s.roll_no,
  COUNT(m.id) as marks_entered
FROM students s
LEFT JOIN marks m ON s.id = m.student_id
  AND m.exam_id = '41263015-7f67-4eeb-88a6-c8ae7892a0c1'
  AND m.tenant_id = s.tenant_id
WHERE s.class_id = '7fd0aaac-c788-4615-9475-b4307b307ea0'
  AND s.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
GROUP BY s.id, s.name, s.roll_no
ORDER BY s.roll_no;
-- Shows which students have marks entered
-- Expected: Each student should have 5 marks (one per subject)
-- If marks_entered = 0, no marks saved for that student


-- ===================================
-- STEP 5: Verify data integrity
-- ===================================
-- Check for orphaned marks (marks with invalid references)
SELECT
  'Invalid student_id' as issue,
  COUNT(*) as count
FROM marks m
WHERE m.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
  AND NOT EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = m.student_id AND s.tenant_id = m.tenant_id
  )

UNION ALL

SELECT
  'Invalid subject_id' as issue,
  COUNT(*) as count
FROM marks m
WHERE m.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
  AND NOT EXISTS (
    SELECT 1 FROM subjects s
    WHERE s.id = m.subject_id AND s.tenant_id = m.tenant_id
  )

UNION ALL

SELECT
  'Invalid exam_id' as issue,
  COUNT(*) as count
FROM marks m
WHERE m.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
  AND NOT EXISTS (
    SELECT 1 FROM exams e
    WHERE e.id = m.exam_id AND e.tenant_id = m.tenant_id
  );
-- All counts should be 0


-- ===================================
-- STEP 6: Summary Report
-- ===================================
SELECT
  'Total Students' as metric,
  COUNT(*) as value
FROM students
WHERE class_id = '7fd0aaac-c788-4615-9475-b4307b307ea0'
  AND tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'

UNION ALL

SELECT
  'Total Subjects' as metric,
  COUNT(*) as value
FROM subjects
WHERE class_id = '7fd0aaac-c788-4615-9475-b4307b307ea0'
  AND tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'

UNION ALL

SELECT
  'Marks Entered for Selected Exam' as metric,
  COUNT(*) as value
FROM marks
WHERE exam_id = '41263015-7f67-4eeb-88a6-c8ae7892a0c1'
  AND tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'

UNION ALL

SELECT
  'Expected Marks Count (Students × Subjects)' as metric,
  s_count * sub_count as value
FROM
  (SELECT COUNT(*) as s_count FROM students
   WHERE class_id = '7fd0aaac-c788-4615-9475-b4307b307ea0'
   AND tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a') students_count,
  (SELECT COUNT(*) as sub_count FROM subjects
   WHERE class_id = '7fd0aaac-c788-4615-9475-b4307b307ea0'
   AND tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a') subjects_count;


-- ===================================
-- DIAGNOSTIC RESULTS INTERPRETATION
-- ===================================
--
-- If STEP 1 returns 0:
--   → Marks have NOT been entered/saved for this exam yet
--   → You need to go to your marks entry UI and save marks first
--
-- If STEP 2 shows no exams with marks:
--   → No marks have been entered for ANY exam
--   → Start by entering marks through your UI
--
-- If STEP 4 shows marks_entered = 0 for all students:
--   → Confirms marks haven't been saved
--   → Check your marks entry workflow
--
-- If STEP 6 shows mismatch between "Marks Entered" and "Expected":
--   → Some students/subjects missing marks
--   → Check which students are missing in STEP 4
--
-- ===================================
