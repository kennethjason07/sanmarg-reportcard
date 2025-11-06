-- Insert Marks for Nursery A Students
-- Academic Year: 2025-26
-- Class ID: 7fd0aaac-c788-4615-9475-b4307b307ea0
-- Exam ID: 41263015-7f67-4eeb-88a6-c8ae7892a0c1
-- Tenant ID: 9abe534f-1a12-474c-a387-f8795ad3ab5a

-- Subject IDs:
-- Maths: 9921b2ef-12a0-486d-a81d-e264ce22bc82
-- Evs: cb74de28-9389-4d56-8022-7a8a86b66c13
-- Rhym & Con: 08d760f5-bc6e-452c-9bfa-4e8c2c10ca94
-- English: e85096fb-4fde-4fd7-ad16-f33209cd74de
-- Moral: e0fb10ae-fcac-4cd5-b8e3-0324e9acec4c

-- Student IDs (from your database):
-- RIYANSH: cf365034-64ff-4fcd-b992-939bf2474d0f
-- MOHD SHAHZAIB: 90126fef-b447-4c5b-a042-31b0682136ad
-- SHAIK ARHAN: fda0ee8b-e930-4001-8f7f-0e01e4c712b6
-- ... (add more as needed)

-- ===================================
-- EXAMPLE: Insert marks for RIYANSH
-- ===================================
-- Replace the marks values (85, 78, etc.) with actual marks

INSERT INTO marks (student_id, exam_id, subject_id, marks_obtained, max_marks, tenant_id) VALUES
-- RIYANSH's marks
('cf365034-64ff-4fcd-b992-939bf2474d0f', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', '9921b2ef-12a0-486d-a81d-e264ce22bc82', 85, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Maths
('cf365034-64ff-4fcd-b992-939bf2474d0f', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', 'cb74de28-9389-4d56-8022-7a8a86b66c13', 78, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Evs
('cf365034-64ff-4fcd-b992-939bf2474d0f', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', '08d760f5-bc6e-452c-9bfa-4e8c2c10ca94', 92, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Rhym & Con
('cf365034-64ff-4fcd-b992-939bf2474d0f', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', 'e85096fb-4fde-4fd7-ad16-f33209cd74de', 88, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- English
('cf365034-64ff-4fcd-b992-939bf2474d0f', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', 'e0fb10ae-fcac-4cd5-b8e3-0324e9acec4c', 95, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Moral

-- MOHD SHAHZAIB's marks
('90126fef-b447-4c5b-a042-31b0682136ad', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', '9921b2ef-12a0-486d-a81d-e264ce22bc82', 72, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Maths
('90126fef-b447-4c5b-a042-31b0682136ad', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', 'cb74de28-9389-4d56-8022-7a8a86b66c13', 68, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Evs
('90126fef-b447-4c5b-a042-31b0682136ad', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', '08d760f5-bc6e-452c-9bfa-4e8c2c10ca94', 75, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Rhym & Con
('90126fef-b447-4c5b-a042-31b0682136ad', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', 'e85096fb-4fde-4fd7-ad16-f33209cd74de', 80, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- English
('90126fef-b447-4c5b-a042-31b0682136ad', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', 'e0fb10ae-fcac-4cd5-b8e3-0324e9acec4c', 77, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Moral

-- SHAIK ARHAN's marks
('fda0ee8b-e930-4001-8f7f-0e01e4c712b6', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', '9921b2ef-12a0-486d-a81d-e264ce22bc82', 90, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Maths
('fda0ee8b-e930-4001-8f7f-0e01e4c712b6', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', 'cb74de28-9389-4d56-8022-7a8a86b66c13', 85, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Evs
('fda0ee8b-e930-4001-8f7f-0e01e4c712b6', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', '08d760f5-bc6e-452c-9bfa-4e8c2c10ca94', 88, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- Rhym & Con
('fda0ee8b-e930-4001-8f7f-0e01e4c712b6', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', 'e85096fb-4fde-4fd7-ad16-f33209cd74de', 92, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'), -- English
('fda0ee8b-e930-4001-8f7f-0e01e4c712b6', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', 'e0fb10ae-fcac-4cd5-b8e3-0324e9acec4c', 87, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'); -- Moral

-- ===================================
-- Continue adding marks for remaining students...
-- ===================================
-- Student IDs and names:
-- MOHD HAMZA ALI: Add student_id here
-- SHIFA FATIMA: Add student_id here
-- SHAIK RUMAISA FATIMA: Add student_id here
-- ABDUL MUQTADIR: Add student_id here
-- SYEDA IZZA ALISHFA: Add student_id here
-- ABDUL TAYYAB SHAH: Add student_id here
-- SHAIK ADIYAN: Add student_id here
-- SHAIK SHAIZAN: Add student_id here
-- AYESHA MARYAM: Add student_id here
-- PARVEZ ANSARI: Add student_id here
-- IRHA NAIZIL: Add student_id here
-- ABDUL RAB AAHIL: Add student_id here
-- SYED TALHA HUSSAIN: Add student_id here
-- ABDUL RAFAY ZAID: Add student_id here
-- ALISHBA FATIMA: Add student_id here
-- MD HUSSAIN: Add student_id here
-- ABUBAKAR ALVI: Add student_id here
-- ZUNAISHA ALI KHAN: Add student_id here


-- ===================================
-- SPECIAL MARKS EXAMPLES
-- ===================================

-- For ABSENT students, you can use NULL or store -1
-- INSERT INTO marks (student_id, exam_id, subject_id, marks_obtained, max_marks, tenant_id) VALUES
-- ('student-id-here', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', '9921b2ef-12a0-486d-a81d-e264ce22bc82', -1, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'); -- Absent in Maths

-- For NOT APPLICABLE subjects, use -2
-- INSERT INTO marks (student_id, exam_id, subject_id, marks_obtained, max_marks, tenant_id) VALUES
-- ('student-id-here', '41263015-7f67-4eeb-88a6-c8ae7892a0c1', '9921b2ef-12a0-486d-a81d-e264ce22bc82', -2, 100, '9abe534f-1a12-474c-a387-f8795ad3ab5a'); -- N/A for Maths


-- ===================================
-- VERIFICATION QUERY
-- ===================================
-- After inserting, run this to verify:
-- SELECT COUNT(*) FROM marks WHERE exam_id = '41263015-7f67-4eeb-88a6-c8ae7892a0c1' AND tenant_id = '9abe534f-1a12-474c-a387-f8795ad3ab5a';
-- Should return: 21 students × 5 subjects = 105 records
