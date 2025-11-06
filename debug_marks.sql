-- ===================================
-- DIAGNOSTIC QUERIES TO FIND THE MISMATCH
-- ===================================

-- Query 1: Check if ANY marks exist for your tenant
SELECT COUNT(*) as total_marks_count
FROM marks
WHERE tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a';

-- Query 2: Check which exam_ids have marks in your database
SELECT DISTINCT exam_id, COUNT(*) as marks_count
FROM marks
WHERE tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
GROUP BY exam_id;

-- Query 3: Check if marks exist for the students you're querying
-- (Using the first 3 student IDs from the console log)
SELECT student_id, exam_id, subject_id, marks_obtained, max_marks
FROM marks
WHERE tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
  AND student_id IN (
    'cf365034-64ff-4fcd-b992-939bf2474d0f',  -- RIYANSH
    '90126fef-b447-4c5b-a042-31b0682136ad',  -- MOHD SHAHZAIB
    'fda0ee8b-e930-4001-8f7f-0e01e4c712b6'   -- SHAIK ARHAN
  );

-- Query 4: Check if the specific exam_id exists in marks table
SELECT COUNT(*) as marks_for_this_exam
FROM marks
WHERE tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
  AND exam_id = '41263015-7f67-4eeb-88a6-c8ae7892a0c1';

-- Query 5: If Query 4 returns 0, find what exam_ids ARE in the marks table
SELECT exam_id, e.name as exam_name, COUNT(*) as marks_count
FROM marks m
LEFT JOIN exams e ON m.exam_id = e.id
WHERE m.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
GROUP BY exam_id, e.name;

-- Query 6: Check the exam details you selected
SELECT id, name, class_id, academic_year, start_date, end_date
FROM exams
WHERE id = '41263015-7f67-4eeb-88a6-c8ae7892a0c1'
  AND tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a';

-- Query 7: Sample of marks data to see the structure
SELECT m.*, s.name as student_name, sub.name as subject_name, e.name as exam_name
FROM marks m
LEFT JOIN students s ON m.student_id = s.id
LEFT JOIN subjects sub ON m.subject_id = sub.id
LEFT JOIN exams e ON m.exam_id = e.id
WHERE m.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
LIMIT 10;

-- ===================================
-- COMMON ISSUES TO CHECK:
-- ===================================

-- Issue 1: Wrong tenant_id in marks table
-- Check if marks have a different tenant_id
SELECT DISTINCT tenant_id, COUNT(*) as count
FROM marks
GROUP BY tenant_id;

-- Issue 2: exam_id mismatch
-- Check if your marks were entered with NULL exam_id or wrong exam_id
SELECT
  exam_id,
  CASE
    WHEN exam_id IS NULL THEN 'NULL exam_id'
    WHEN exam_id = '41263015-7f67-4eeb-88a6-c8ae7892a0c1' THEN 'Matches selected exam'
    ELSE 'Different exam_id'
  END as match_status,
  COUNT(*) as count
FROM marks
WHERE tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
GROUP BY exam_id;

-- Issue 3: student_id mismatch
-- Check if the student_ids in marks match the students in your class
SELECT
  COUNT(DISTINCT m.student_id) as students_with_marks,
  COUNT(DISTINCT s.id) as students_in_class
FROM students s
LEFT JOIN marks m ON s.id = m.student_id
  AND m.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a'
WHERE s.class_id = '7fd0aaac-c788-4615-9475-b4307b307ea0'
  AND s.tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a';
