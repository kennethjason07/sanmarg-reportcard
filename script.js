// Hall Ticket Generator JavaScript - Simplified Version

// Supabase Configuration
const SUPABASE_URL = 'https://dmagnsbdjsnzsddxqrwd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtYWduc2JkanNuenNkZHhxcndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTQ2MTEsImV4cCI6MjA2ODIzMDYxMX0.VAo64FAcg1Mo4qA22FWwC7Kdq6AAiLTNeBOjFB9XTi8';
const TENANT_ID = '1bdbed15-c261-4789-b474-11c4cfd6cf54';

// Initialize Supabase client
let supabase;
if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Global configuration object
let hallTicketConfig = {
    schoolName: "GLOBAL'S SANMARG PUBLIC SCHOOL BIDAR",
    schoolSubtitle: "English Medium School With Shiksha-E-Hind and IIT Foundation Course",
    schoolAddress: "Main Branch: Pansal Talleem  Bidar           Branch: Near City Palace", 
    examTitle: "Marks Card Annual Exam (2020-21)",
    schoolLogo: "images/logo.jpg", // Default logo path
    maxMarks: 100,
    minMarks: 35,
    subjects: {
        subject1: "Mathematics",
        subject2: "Science", 
        subject3: "Social",
        subject4: "English",
        subject5: "Kannada",
        subject6: "Hindi/Urdu",
        subject7: "Computer Science",
        subject8: "Physical Education"
    }
};

// Database Functions - Keep the existing fetchStudentsFromDatabase and processStudentData
async function fetchStudentsFromDatabase(selectedYear, classId = null, examId = null) {
    try {
        console.log('🔄 Fetching student data from database...');
        console.log('📌 Exam ID:', examId);

        // Use the selected academic year
        const currentYear = selectedYear;

        // Build the base query
        let query = supabase
            .from('students')
            .select(`
                id,
                admission_no,
                name,
                roll_no,
                class_id,
                parent_id,
                academic_year,
                classes!inner(
                    id,
                    class_name,
                    section,
                    academic_year
                )
            `)
            .eq('tenant_id', TENANT_ID);

        // If class_id is provided, filter by it (more reliable than academic_year on students)
        if (classId) {
            query = query.eq('class_id', classId);
        } else {
            // Otherwise filter by academic_year on students table
            query = query.eq('academic_year', currentYear);
        }

        query = query.order('class_id', { ascending: true })
            .order('roll_no', { ascending: true });

        const { data: students, error: studentsError } = await query;
            
        if (studentsError) {
            console.error('Error fetching students:', studentsError);
            throw studentsError;
        }
        
        console.log('📊 Students fetched:', students?.length || 0);
        console.log('🔍 Query parameters - Tenant ID:', TENANT_ID, 'Academic Year:', currentYear);

        if (!students || students.length === 0) {
            console.warn('⚠️ No students found. Please check:');
            console.warn('1. Students exist in database with tenant_id:', TENANT_ID);
            console.warn('2. Students have academic_year:', currentYear);
            console.warn('3. Students are linked to classes');
            throw new Error(`No students found for academic year ${currentYear}. Check console for details.`);
        }
        
        // Fetch parent information using TWO methods for maximum compatibility
        let parents = [];

        // PRIMARY METHOD: Fetch by student_id (modern approach)
        const studentIdsForParents = students.map(s => s.id);
        if (studentIdsForParents.length > 0) {
            const { data: parentsData, error: parentsError } = await supabase
                .from('parents')
                .select('id, name, student_id, relation')
                .eq('tenant_id', TENANT_ID)
                .in('student_id', studentIdsForParents);

            if (parentsError) {
                console.warn('⚠️ Error fetching parents by student_id:', parentsError);
            } else {
                parents = parentsData || [];
                console.log('✅ Parents fetched by student_id:', parents.length);
            }
        }

        // FALLBACK METHOD: Fetch by parent_id (legacy approach for backward compatibility)
        const parentIds = students.filter(s => s.parent_id).map(s => s.parent_id);
        if (parentIds.length > 0) {
            const { data: parentsDataByParentId, error: parentsErrorByParentId } = await supabase
                .from('parents')
                .select('id, name, student_id, relation')
                .eq('tenant_id', TENANT_ID)
                .in('id', parentIds);

            if (parentsErrorByParentId) {
                console.warn('⚠️ Error fetching parents by parent_id:', parentsErrorByParentId);
            } else if (parentsDataByParentId && parentsDataByParentId.length > 0) {
                // Merge with existing parents (avoid duplicates)
                const existingParentIds = new Set(parents.map(p => p.id));
                const newParents = parentsDataByParentId.filter(p => !existingParentIds.has(p.id));
                parents = [...parents, ...newParents];
                console.log('✅ Additional parents fetched by parent_id:', newParents.length);
            }
        }

        console.log('📊 Total parents fetched:', parents.length);
        
        // Get class IDs for fetching exams
        const classIds = [...new Set(students.map(s => s.class_id))];
        
        // Fetch exams for these classes
        const { data: exams, error: examsError } = await supabase
            .from('exams')
            .select('id, name, class_id, academic_year, max_marks')
            .eq('tenant_id', TENANT_ID)
            .eq('academic_year', currentYear)
            .in('class_id', classIds);
            
        if (examsError) {
            console.error('Error fetching exams:', examsError);
            throw examsError;
        }
        
        console.log('📋 Exams fetched:', exams?.length || 0);
        
        // Fetch subjects for these classes
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('id, name, class_id, academic_year')
            .eq('tenant_id', TENANT_ID)
            .eq('academic_year', currentYear)
            .in('class_id', classIds);
            
        if (subjectsError) {
            console.error('Error fetching subjects:', subjectsError);
            throw subjectsError;
        }
        
        console.log('📚 Subjects fetched:', subjects?.length || 0);
        
        // Fetch marks for all students using proper Supabase JOIN syntax
        const studentIds = students.map(s => s.id);
        console.log('🔍 Querying marks for', studentIds.length, 'students');
        console.log('🔍 Sample student IDs:', studentIds.slice(0, 3));
        console.log('🔍 Tenant ID being used:', TENANT_ID);
        console.log('🔍 Exam ID being used:', examId || 'ALL EXAMS');

        // Quick check: Do ANY marks exist for this tenant?
        const { count: totalMarksCount } = await supabase
            .from('marks')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', TENANT_ID);
        console.log('📊 Total marks in database for tenant:', totalMarksCount || 0);

        // Check if ANY of these specific students have marks
        const { count: marksForTheseStudents } = await supabase
            .from('marks')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', TENANT_ID)
            .in('student_id', studentIds);
        console.log('📊 Marks for THESE 21 students:', marksForTheseStudents || 0);

        if ((totalMarksCount || 0) > 0 && (marksForTheseStudents || 0) === 0) {
            console.warn('⚠️ ISSUE FOUND: Marks exist in database but NOT for these students!');
            console.warn('⚠️ The 658 marks are for students in OTHER classes.');
            console.warn('⚠️ You need to enter marks for Nursery A students.');
        }

        // Use the SAME query pattern as your working marks entry app
        // Simple query without JOINs - fetch by exam_id and tenant_id only
        let marksQuery = supabase
            .from('marks')
            .select('id, student_id, exam_id, subject_id, marks_obtained, grade, max_marks, remarks', { count: 'exact' })
            .eq('tenant_id', TENANT_ID)
            .order('student_id');

        // Filter by exam_id if provided
        if (examId) {
            console.log('🔍 Filtering by exam_id:', examId);
            marksQuery = marksQuery.eq('exam_id', examId);
        }

        let { data: marks, error: marksError, count: marksCount } = await marksQuery;

        console.log('📊 Query returned', marksCount, 'total marks records from database');

        if (marksError) {
            console.error('❌ Error fetching marks:', marksError);
            console.error('❌ Error details:', {
                message: marksError.message,
                details: marksError.details,
                hint: marksError.hint,
                code: marksError.code
            });
            throw marksError;
        }

        // BACKWARD COMPATIBILITY: If no marks found with tenant filter, try without it
        // (Some marks may have been saved without tenant_id)
        if (examId && (!marks || marks.length === 0)) {
            console.warn('⚠️ No marks found with tenant filter. Checking without tenant filter (backward compatibility)...');

            const { data: marksWithoutTenant, error: marksWithoutTenantError } = await supabase
                .from('marks')
                .select('id, student_id, exam_id, subject_id, marks_obtained, grade, max_marks, remarks', { count: 'exact' })
                .eq('exam_id', examId)
                .order('student_id');

            if (!marksWithoutTenantError && marksWithoutTenant && marksWithoutTenant.length > 0) {
                console.warn(`📊 Found ${marksWithoutTenant.length} marks without tenant filter`);
                console.warn('✅ Using marks without tenant filter for backward compatibility');
                marks = marksWithoutTenant;
                marksCount = marksWithoutTenant.length;
            }
        }

        // Filter marks to only include students from the selected class
        // (The query fetches all marks for the exam, we need to filter by class)
        if (marks && marks.length > 0) {
            const marksBeforeFilter = marks.length;
            marks = marks.filter(mark => studentIds.includes(mark.student_id));
            console.log(`📝 Marks filtered: ${marksBeforeFilter} total for exam → ${marks.length} for this class (${studentIds.length} students)`);

            if (marks.length > 0) {
                console.log('✅ SUCCESS! Marks found and will be displayed in report cards');
                console.log(`📊 Expected marks: ${studentIds.length * subjects.length}, Found: ${marks.length}`);
            }
        }

        console.log('📝 Final marks count:', marks?.length || 0);
        console.log('📝 Query used exam_id filter:', examId ? 'YES - ' + examId : 'NO (all exams)');

        // If STILL no marks found, check what exams DO have marks for these students
        if (examId && (!marks || marks.length === 0)) {
            console.warn('⚠️ No marks found for exam_id:', examId);
            console.warn('⚠️ Checking what exams DO have marks for these students...');

            // Check without tenant_id filter for backward compatibility
            const { data: allMarks, error: allMarksError } = await supabase
                .from('marks')
                .select('id, student_id, exam_id, subject_id, marks_obtained, max_marks')
                .order('student_id');

            // Filter to only students in this class
            let filteredMarks = allMarks;
            if (allMarks && allMarks.length > 0) {
                filteredMarks = allMarks.filter(mark => studentIds.includes(mark.student_id));
            }

            if (!allMarksError && filteredMarks && filteredMarks.length > 0) {
                console.warn('⚠️ Found', allMarks.length, 'marks records total in database');
                console.warn('⚠️ Found', filteredMarks.length, 'marks for students in this class');
                const uniqueExamIds = [...new Set(filteredMarks.map(m => m.exam_id))];
                console.warn('⚠️ Exam IDs for this class:', uniqueExamIds);
                console.warn('⚠️ Selected exam_id was:', examId);

                // Fetch exam names for the found exam IDs
                if (uniqueExamIds.length > 0) {
                    const { data: examDetails } = await supabase
                        .from('exams')
                        .select('id, name')
                        .in('id', uniqueExamIds);
                    console.warn('⚠️ Available exams with marks:', examDetails);
                }

                console.warn('⚠️ Using all marks for this class (any exam)');
                marks = filteredMarks;
            } else {
                // Check if marks exist without tenant_id filter
                console.warn('⚠️ No marks found even without exam filter');
                console.warn('⚠️ Checking if marks exist without tenant_id filter...');
                const { data: anyMarks, error: anyMarksError } = await supabase
                    .from('marks')
                    .select('id, student_id, tenant_id, exam_id, marks_obtained')
                    .limit(20); // Get any marks from the database

                if (!anyMarksError && anyMarks && anyMarks.length > 0) {
                    console.warn('⚠️ Found marks with different tenant_id!');
                    console.warn('⚠️ Sample marks tenant_ids:', [...new Set(anyMarks.map(m => m.tenant_id))]);
                    console.warn('⚠️ Your tenant_id:', TENANT_ID);
                } else {
                    console.warn('⚠️ No marks found in database at all for these students');
                    console.warn('⚠️ Please check if marks data exists in the database');
                }
            }
        }

        console.log('📝 Final marks records:', marks?.length || 0);
        if (marks && marks.length > 0) {
            console.log('📝 Sample marks (first 3):', marks.slice(0, 3));
            console.log('📝 All marks data structure:', marks.map(m => ({
                student_id: m.student_id,
                subject_id: m.subject_id,
                marks_obtained: m.marks_obtained,
                max_marks: m.max_marks,
                marks_type: typeof m.marks_obtained
            })));
        } else {
            console.warn('⚠️ NO MARKS FOUND! This is why all marks show as 0.');
        }
        
        // Process and format the data
        const processedData = processStudentData(students, parents, exams, subjects, marks, currentYear);
        return processedData;
        
    } catch (error) {
        console.error('❌ Database fetch error:', error);
        throw error;
    }
}

function processStudentData(students, parents, exams, subjects, marks, currentYear) {
    console.log('🔄 Processing student data...');

    // Create lookup maps for better performance
    // Map parents by BOTH student_id AND parent.id for maximum compatibility
    const parentsByStudentId = {};
    const parentsById = {};

    parents.forEach(parent => {
        // Map by student_id (for parents.student_id → students.id relationship)
        if (parent.student_id) {
            if (!parentsByStudentId[parent.student_id]) {
                parentsByStudentId[parent.student_id] = [];
            }
            parentsByStudentId[parent.student_id].push(parent);
        }

        // Map by parent.id (for students.parent_id → parents.id relationship)
        if (parent.id) {
            if (!parentsById[parent.id]) {
                parentsById[parent.id] = [];
            }
            parentsById[parent.id].push(parent);
        }
    });
    
    const subjectsMap = {};
    subjects.forEach(subject => {
        subjectsMap[subject.id] = subject;
    });
    
    const examsMap = {};
    exams.forEach(exam => {
        examsMap[exam.id] = exam;
    });
    
    console.log('📊 Processing data for', students.length, 'students');
    console.log('📚 Subjects available:', subjects.length);
    console.log('📋 Exams available:', exams.length);
    console.log('📝 Marks records available:', marks.length);
    
    const processedStudents = students.map(student => {
        // Get marks for this student
        const studentMarks = marks.filter(mark => mark.student_id === student.id);
        
        console.log(`Processing ${student.name}: Found ${studentMarks.length} marks records`);
        
        // Group marks by subject - store both marks and max_marks
        const subjectMarks = {};
        const subjectNames = [];
        const subjectMaxMarks = {};

        // Get all subjects for this student's class to ensure we have all subjects even with 0 marks
        const classSubjects = subjects.filter(subject => subject.class_id === student.class_id);

        // Initialize all subjects with 0 marks and default max marks of 100
        classSubjects.forEach(subject => {
            subjectMarks[subject.name] = 0;
            subjectMaxMarks[subject.name] = 100; // default
            if (!subjectNames.includes(subject.name)) {
                subjectNames.push(subject.name);
            }
        });

        // Update with actual marks and max_marks from database
        console.log(`📝 Processing ${studentMarks.length} mark records for ${student.name}`);
        studentMarks.forEach(mark => {
            console.log(`  🔍 Mark record:`, {
                subject_id: mark.subject_id,
                marks_obtained: mark.marks_obtained,
                max_marks: mark.max_marks
            });

            const subject = subjectsMap[mark.subject_id];
            if (subject) {
                const subjectName = subject.name;
                // Preserve 'ab' (absent) as string, otherwise use marks or default to 0
                let marksValue;
                if (mark.marks_obtained === null || mark.marks_obtained === undefined) {
                    marksValue = 0;
                } else if (typeof mark.marks_obtained === 'string') {
                    // Handle string marks like 'ab', 'na', or numeric strings
                    const lowerMark = mark.marks_obtained.toLowerCase();
                    if (lowerMark === 'ab') {
                        marksValue = -1; // Represent absent as -1
                    } else if (lowerMark === 'na') {
                        marksValue = -2; // Represent not applicable as -2
                    } else {
                        // Try to parse as number
                        marksValue = parseFloat(mark.marks_obtained) || 0;
                    }
                } else {
                    // It's already a number
                    marksValue = mark.marks_obtained;
                }

                console.log(`  ✅ Matched subject: ${subjectName}, marks_obtained (from DB): ${mark.marks_obtained}, marksValue (processed): ${marksValue}, type: ${typeof marksValue}`);

                // Debug log for special marks
                const isAbsent = (typeof marksValue === 'string' && marksValue.toLowerCase() === 'ab') || marksValue === -1;
                const isNotApplicable = (typeof marksValue === 'string' && marksValue.toLowerCase() === 'na') || marksValue === -2;

                if (isAbsent) {
                    console.log(`🔴 Found absent mark for ${student.name} - ${subjectName}: ${marksValue}`);
                }
                if (isNotApplicable) {
                    console.log(`⚪ Found N/A mark for ${student.name} - ${subjectName}: ${marksValue}`);
                }

                subjectMarks[subjectName] = marksValue;
                subjectMaxMarks[subjectName] = mark.max_marks || 100;

                if (!subjectNames.includes(subjectName)) {
                    subjectNames.push(subjectName);
                }
            } else {
                console.warn(`  ❌ No subject found for subject_id: ${mark.subject_id}`);
                console.warn(`  ❌ Available subject IDs:`, Object.keys(subjectsMap));
            }
        });
        
        // Get parent name using BOTH linking methods (prioritize father, then any parent)
        let fatherName = '';
        let studentParents = [];

        // PRIMARY: Try to get parents by student_id (parents.student_id → students.id)
        if (parentsByStudentId[student.id]) {
            studentParents = parentsByStudentId[student.id];
        }
        // FALLBACK: Try to get parents by parent_id (students.parent_id → parents.id)
        else if (student.parent_id && parentsById[student.parent_id]) {
            studentParents = parentsById[student.parent_id];
        }

        // Now find the father from the student's parents
        if (studentParents.length > 0) {
            // Look for father first
            const father = studentParents.find(p => p.relation === 'Father');
            if (father) {
                fatherName = father.name;
            } else {
                // Use any available parent (Mother/Guardian)
                fatherName = studentParents[0].name;
            }
        }

        if (fatherName) {
            console.log(`✅ ${student.name}: Found father/parent - ${fatherName}`);
        } else {
            console.warn(`⚠️ ${student.name}: No parent found in database`);
        }
        
        console.log(`${student.name}: ${subjectNames.length} subjects, Father: ${fatherName}`);
        console.log(`  📊 Final marks for ${student.name}:`, subjectMarks);

        return {
            rollNumber: student.roll_no || student.admission_no || '',
            studentName: student.name || '',
            fatherName: fatherName,
            class: student.classes ? student.classes.class_name : '',
            section: student.classes ? student.classes.section : '',
            subjects: subjectMarks,
            subjectMaxMarks: subjectMaxMarks,
            subjectNames: subjectNames,
            // Additional data for context
            studentId: student.id,
            classId: student.class_id,
            academicYear: currentYear
        };
    });
    
    console.log('✅ Processed students:', processedStudents.length);
    if (processedStudents.length > 0) {
        console.log('📊 Sample student data:', processedStudents[0]);
    }
    
    return processedStudents;
}

// Global variables
let selectedAcademicYear = null;
let selectedClass = null;
let selectedExam = null;
let academicYears = [];
let classes = [];
let exams = [];
let students = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('Initializing Report Card Generator...');
    
    // Check if html2pdf is loaded
    if (typeof html2pdf !== 'undefined') {
        console.log('✅ html2pdf library loaded successfully');
    } else {
        console.error('❌ html2pdf library not loaded!');
    }
    
    // Initialize Supabase if not already done
    if (!supabase && typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully');
    } else if (!supabase) {
        console.error('❌ Supabase client not available - cannot proceed');
        showError('Database connection failed. Please refresh the page.');
        return;
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadAcademicYears();

    console.log('Report Card Generator initialized successfully');
}

function setupEventListeners() {
    // Tab navigation
    document.getElementById('selectionTab').addEventListener('click', () => showTab('selection'));
    document.getElementById('studentsTab').addEventListener('click', () => showTab('students'));

    // Form controls
    document.getElementById('academicYearSelect').addEventListener('change', handleAcademicYearChange);
    document.getElementById('classSelect').addEventListener('change', handleClassChange);
    document.getElementById('examSelect').addEventListener('change', handleExamChange);
    document.getElementById('viewStudentsBtn').addEventListener('click', loadStudents);
    document.getElementById('backToSelectionBtn').addEventListener('click', () => showTab('selection'));
}

// Tab Management
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Content').classList.add('active');
}

// Data Loading Functions
async function loadAcademicYears() {
    try {
        console.log('📅 Loading academic years...');
        showLoading(true);

        // Fetch distinct academic years from classes table
        const { data, error } = await supabase
            .from('classes')
            .select('academic_year')
            .eq('tenant_id', TENANT_ID)
            .order('academic_year', { ascending: false });

        if (error) throw error;

        // Get unique academic years
        const uniqueYears = [...new Set(data.map(item => item.academic_year))];
        academicYears = uniqueYears.filter(year => year); // Remove null/undefined

        console.log('📅 Academic years found:', academicYears);

        if (academicYears.length === 0) {
            showError('No academic years found in the database.');
        }

        populateAcademicYearSelect();

    } catch (error) {
        console.error('Error loading academic years:', error);
        showError('Failed to load academic years. Please refresh the page.');
    } finally {
        showLoading(false);
    }
}

function populateAcademicYearSelect() {
    const academicYearSelect = document.getElementById('academicYearSelect');
    academicYearSelect.innerHTML = '<option value="">Select academic year</option>';

    academicYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        academicYearSelect.appendChild(option);
    });
}

function handleAcademicYearChange(event) {
    selectedAcademicYear = event.target.value;

    // Reset dependent selections
    selectedClass = null;
    selectedExam = null;
    document.getElementById('classSelect').innerHTML = '<option value="">Loading classes...</option>';
    document.getElementById('classSelect').disabled = true;
    document.getElementById('examSelect').innerHTML = '<option value="">Select class first</option>';
    document.getElementById('examSelect').disabled = true;
    document.getElementById('viewStudentsBtn').disabled = true;

    if (!selectedAcademicYear) {
        document.getElementById('classSelect').innerHTML = '<option value="">Select academic year first</option>';
        return;
    }

    loadClasses();
}

async function loadClasses() {
    try {
        console.log('🏫 Loading classes for academic year:', selectedAcademicYear);
        showLoading(true);

        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('tenant_id', TENANT_ID)
            .eq('academic_year', selectedAcademicYear)
            .order('class_name', { ascending: true });

        if (error) throw error;

        classes = data || [];
        console.log('🏫 Classes found:', classes.length);
        populateClassSelect();

    } catch (error) {
        console.error('Error loading classes:', error);
        showError('Failed to load classes for selected academic year.');
    } finally {
        showLoading(false);
    }
}

function populateClassSelect() {
    const classSelect = document.getElementById('classSelect');
    classSelect.innerHTML = '<option value="">Select a class</option>';
    classSelect.disabled = false;

    if (classes.length === 0) {
        classSelect.innerHTML = '<option value="">No classes found for this academic year</option>';
        classSelect.disabled = true;
        return;
    }

    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = `${cls.class_name} - ${cls.section}`;
        classSelect.appendChild(option);
    });
}

async function handleClassChange(event) {
    const classId = event.target.value;
    selectedClass = classId;
    
    // Reset exam selection
    selectedExam = null;
    document.getElementById('examSelect').innerHTML = '<option value="">Loading exams...</option>';
    document.getElementById('examSelect').disabled = true;
    document.getElementById('viewStudentsBtn').disabled = true;
    
    if (!classId) {
        document.getElementById('examSelect').innerHTML = '<option value="">Select class first</option>';
        return;
    }
    
    try {
        console.log('📋 Loading exams for class:', classId);
        
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .eq('class_id', classId)
            .eq('tenant_id', TENANT_ID)
            .order('start_date', { ascending: false });
            
        if (error) throw error;
        
        exams = data || [];
        populateExamSelect();
        
    } catch (error) {
        console.error('Error loading exams:', error);
        showError('Failed to load exams for selected class.');
        document.getElementById('examSelect').innerHTML = '<option value="">Error loading exams</option>';
    }
}

function populateExamSelect() {
    const examSelect = document.getElementById('examSelect');
    examSelect.innerHTML = '<option value="">Select an exam</option>';
    examSelect.disabled = false;
    
    exams.forEach(exam => {
        const option = document.createElement('option');
        option.value = exam.id;
        option.textContent = exam.name;
        examSelect.appendChild(option);
    });
}

function handleExamChange(event) {
    selectedExam = event.target.value;
    document.getElementById('viewStudentsBtn').disabled = !selectedExam;
}

async function loadStudents() {
    if (!selectedClass || !selectedExam || !selectedAcademicYear) return;

    try {
        console.log('👥 Loading students for class:', selectedClass, 'exam:', selectedExam, 'academic year:', selectedAcademicYear);
        showLoading(true);

        // Get class and exam info for display
        const selectedClassInfo = classes.find(c => c.id === selectedClass);
        const selectedExamInfo = exams.find(e => e.id === selectedExam);

        // Update students tab title
        document.getElementById('studentsTitle').textContent =
            `👥 Students - ${selectedClassInfo.class_name} ${selectedClassInfo.section} - ${selectedExamInfo.name} (${selectedAcademicYear})`;

        // Fetch students with their marks for the selected class and exam
        const studentsData = await fetchStudentsFromDatabase(selectedAcademicYear, selectedClass, selectedExam);

        // Since we're already filtering by class_id in the query, no need to filter again
        // Also add exam info to each student
        students = studentsData.map(student => ({
            ...student,
            examName: selectedExamInfo.name,
            examAcademicYear: selectedAcademicYear
        }));
        
        if (students.length === 0) {
            showNoStudents();
        } else {
            displayStudents();
        }
        
        // Enable students tab and switch to it
        document.getElementById('studentsTab').disabled = false;
        showTab('students');
        
    } catch (error) {
        console.error('Error loading students:', error);
        showError('Failed to load students. Please try again.');
    } finally {
        showLoading(false);
    }
}

function displayStudents() {
    const studentsGrid = document.getElementById('studentsGrid');
    const noStudents = document.getElementById('noStudents');
    
    noStudents.style.display = 'none';
    studentsGrid.innerHTML = '';
    
    students.forEach((student, index) => {
        const studentCard = createStudentCard(student, index);
        studentsGrid.appendChild(studentCard);
    });
}

function createStudentCard(student, index) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.innerHTML = `
        <div class="student-info">
            <div class="student-name">${student.studentName}</div>
            <div class="student-details">
                <span class="roll-number">Roll: ${student.rollNumber || 'N/A'}</span>
                <span class="father-name">Father: ${student.fatherName || 'N/A'}</span>
            </div>
        </div>
        <div class="student-actions">
            <button class="print-btn" onclick="printReportCard(${index})">
                🖨️ Print
            </button>
            <button class="download-btn" onclick="downloadReportCard(${index})">
                💾 Download PDF
            </button>
        </div>
    `;
    return card;
}

function showNoStudents() {
    document.getElementById('studentsGrid').innerHTML = '';
    document.getElementById('noStudents').style.display = 'block';
}

// Report Card Generation
function printReportCard(studentIndex) {
    const student = students[studentIndex];
    if (!student) {
        alert('Student not found.');
        return;
    }
    
    console.log('🖨️ Printing report card for:', student.studentName);
    
    // Create a temporary container for the report card
    const container = document.createElement('div');
    container.innerHTML = generateHallTicketHTML(student, studentIndex);
    document.body.appendChild(container);
    
    // Get the hall ticket element
    const hallTicket = container.querySelector('.hall-ticket');
    
    // Open print dialog
    printHallTicketDirect(hallTicket, student);
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(container);
    }, 1000);
}

function downloadReportCard(studentIndex) {
    const student = students[studentIndex];
    if (!student) {
        alert('Student not found.');
        return;
    }
    
    console.log('📋 Downloading report card for:', student.studentName);
    
    // Create a temporary container for the report card
    const container = document.createElement('div');
    container.innerHTML = generateHallTicketHTML(student, studentIndex);
    document.body.appendChild(container);
    
    // Get the hall ticket element
    const hallTicket = container.querySelector('.hall-ticket');
    
    // Generate and download PDF
    downloadHallTicketDirect(hallTicket, student);
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(container);
    }, 1000);
}

function printHallTicketDirect(hallTicket, student) {
    const studentName = student.studentName || 'Student';

    console.log('Opening print dialog for:', studentName);

    // Clone the hall ticket to avoid modifying the original
    const ticketClone = hallTicket.cloneNode(true);

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    const printContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Report Card - ${studentName}</title>
                <meta charset="UTF-8">
                <link rel="stylesheet" href="simplified-styles.css">
                <style>
                    * {
                        box-sizing: border-box;
                    }

                    html, body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        font-family: 'Times New Roman', serif;
                        background: white;
                    }

                    body {
                        padding: 10px;
                    }

                    .hall-ticket {
                        page-break-inside: avoid;
                        page-break-after: avoid;
                        break-inside: avoid;
                        max-width: 100%;
                        width: 700px;
                        margin: 0 auto;
                    }

                    @media print {
                        @page {
                            size: A4;
                            margin: 0.4in;
                        }

                        html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            overflow: hidden;
                        }

                        body {
                            padding: 0;
                            transform: scale(0.95);
                            transform-origin: top center;
                        }

                        .hall-ticket {
                            margin: 0;
                            box-shadow: none;
                            page-break-inside: avoid !important;
                            page-break-after: avoid !important;
                            break-inside: avoid !important;
                            max-height: none;
                            overflow: visible;
                            width: 100% !important;
                            max-width: 100% !important;
                        }

                        .diamond-border-frame {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                            margin: 8px !important;
                            padding: 18px !important;
                        }

                        /* Prevent any element from creating page breaks */
                        * {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }

                        /* Ensure single page */
                        .hall-ticket::after {
                            content: '';
                            display: block;
                            page-break-after: avoid !important;
                        }
                    }
                </style>
            </head>
            <body>
                ${ticketClone.outerHTML}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                    window.onafterprint = function() {
                        window.close();
                    };
                </script>
            </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
}

function downloadHallTicketDirect(hallTicket, student) {
    const studentName = student.studentName || 'Student';
    const rollNumber = student.rollNumber || 'RollNo';
    
    // Hide download section if present
    const downloadSection = hallTicket.querySelector('.download-section');
    if (downloadSection) {
        downloadSection.style.display = 'none';
    }
    
    console.log('Generating PDF for:', studentName);
    
    const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `ReportCard_${studentName.replace(/\s+/g, '_')}_${rollNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            scrollY: 0,
            scrollX: 0
        },
        jsPDF: {
            unit: 'in',
            format: 'a4',
            orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    html2pdf().set(opt).from(hallTicket).save().then(() => {
        console.log('✅ Report card generated successfully for:', studentName);
    }).catch((error) => {
        console.error('❌ Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    });
}

// Utility Functions
function showLoading(show) {
    const indicator = document.getElementById('loadingIndicator');
    indicator.style.display = show ? 'block' : 'none';
}

function showError(message) {
    alert('Error: ' + message);
}

// Report Card Generation Functions - Keep existing generateHallTicketHTML function
function generateHallTicketHTML(student, index) {
    // Debug: Log student data to see what we're working with
    console.log('📊 Generating report card for:', student.studentName);
    console.log('📊 Subject Names:', student.subjectNames);
    console.log('📊 Subjects Data:', student.subjects);
    console.log('📊 Subject Max Marks:', student.subjectMaxMarks);

    // Get student's subjects dynamically
    const studentSubjects = [];

    if (student.subjectNames && student.subjects) {
        // Use dynamic subjects from Database
        student.subjectNames.forEach(subjectName => {
            if (student.subjects[subjectName] !== undefined) {
                const marks = student.subjects[subjectName];
                console.log(`  📝 Subject: ${subjectName}, Marks: ${marks}, Type: ${typeof marks}`);

                // Skip subjects marked as 'NA' (not applicable) - both 'na' string and -2
                const isNotApplicable = (typeof marks === 'string' && marks.toLowerCase() === 'na') || marks === -2;
                if (isNotApplicable) {
                    console.log(`⚪ Skipping N/A subject for ${student.studentName} - ${subjectName}`);
                    return; // Skip this subject entirely
                }

                const maxMarks = student.subjectMaxMarks && student.subjectMaxMarks[subjectName]
                    ? student.subjectMaxMarks[subjectName]
                    : hallTicketConfig.maxMarks;

                studentSubjects.push({
                    name: subjectName,
                    marks: marks || 0,
                    maxMarks: maxMarks,
                    className: subjectName.toLowerCase().replace(/[^a-z0-9]/g, '')
                });
                console.log(`  ✅ Added to report: ${subjectName} = ${marks}`);
            }
        });
    } else {
        // Fallback to configured subjects if no dynamic data
        for (let i = 1; i <= 8; i++) {
            const subjectName = hallTicketConfig.subjects[`subject${i}`];
            if (subjectName && subjectName.trim() !== '') {
                studentSubjects.push({
                    name: subjectName,
                    marks: 0, // Default marks if no data
                    maxMarks: hallTicketConfig.maxMarks,
                    className: ['math', 'science', 'social', 'english', 'kannada', 'hindi', 'computer', 'physical'][i-1]
                });
            }
        }
    }

    console.log('📊 Final studentSubjects array:', studentSubjects);
    console.log('📊 Number of subjects:', studentSubjects.length);

    // Calculate totals based on student's subjects
    const totalObtained = studentSubjects.reduce((sum, subject) => {
        // Skip absent marks in total calculation (both 'ab' and -1)
        const isAbsent = (typeof subject.marks === 'string' && subject.marks.toLowerCase() === 'ab') || subject.marks === -1;
        return sum + (isAbsent ? 0 : (subject.marks || 0));
    }, 0);
    const actualMaxMarks = studentSubjects.reduce((sum, subject) => sum + (subject.maxMarks || 0), 0);
    // Calculate actual minimum marks based on each subject's max marks
    const actualMinMarks = studentSubjects.reduce((sum, subject) => {
        const minMarks = getMinMarks(subject.maxMarks || hallTicketConfig.maxMarks);
        return sum + minMarks;
    }, 0);
    
    const percentage = actualMaxMarks > 0 ? ((totalObtained / actualMaxMarks) * 100).toFixed(1) : '0.0';
    const grade = getGrade(percentage);
    
    // Generate subject rows dynamically with inline bold styling for marks
    const subjectRows = studentSubjects.map(subject => {
        // Check if marks is 'ab' (absent) or -1
        const isAbsent = (typeof subject.marks === 'string' && subject.marks.toLowerCase() === 'ab') || subject.marks === -1;

        // Calculate min marks based on max marks for this subject
        const subjectMinMarks = getMinMarks(subject.maxMarks || hallTicketConfig.maxMarks);

        let marksDisplay, remark, remarkClass;

        if (isAbsent) {
            marksDisplay = '<span style="color: red; font-weight: bold;">Absent</span>';
            remark = 'Absent';
            remarkClass = 'fail-remark';
        } else {
            marksDisplay = subject.marks || 0;
            // Use subject-specific min marks for remark calculation
            remark = getRemark(subject.marks || 0, subjectMinMarks);
            remarkClass = remark === 'Pass' ? 'pass-remark' : 'fail-remark';
        }

        return `
        <tr>
            <td>${subject.name}</td>
            <td>${subject.maxMarks || hallTicketConfig.maxMarks}</td>
            <td>${subjectMinMarks}</td>
            <td class="${subject.className}-marks" style="font-weight: bold;">${marksDisplay}</td>
            <td class="${subject.className}-remark ${remarkClass}">${remark}</td>
        </tr>`;
    }).join('');
    
    // Also apply inline bold styling to total marks
    return `
        <div class="hall-ticket">
            <div class="diamond-border-frame">
                <!-- Watermark Background -->
                <div class="watermark-container">
                    <img src="${hallTicketConfig.schoolLogo}" alt="School Logo" class="watermark-logo">
                </div>
                
                <!-- Header Section -->
                <div class="hall-ticket-header">
                    <div class="school-logo">
                        <img src="${hallTicketConfig.schoolLogo}" alt="School Logo" class="logo-img" onerror="this.style.display='none'">
                    </div>
                    <div class="school-info">
                        <h1 class="school-name">${hallTicketConfig.schoolName}</h1>
                        <p class="school-subtitle">${hallTicketConfig.schoolSubtitle}</p>
                        <p class="school-address">${hallTicketConfig.schoolAddress}</p>
                        <h2 class="exam-title">Marks Card ${student.examName || 'Annual Exam'} (${student.examAcademicYear || student.academicYear || '2020-21'})</h2>
                    </div>
                </div>

                <!-- Student Information -->
                <div class="student-info">
                    <div class="student-left">
                        <div class="student-field">
                            <span class="field-label">STUDENT NAME:</span>
                            <span class="field-value">${student.studentName || 'SYEDA WANIYA MAHAM'}</span>
                        </div>
                        <div class="student-field">
                            <span class="field-label">CLASS:</span>
                            <span class="field-value">${student.class || '5th'}</span>
                        </div>
                        <div class="student-field">
                            <span class="field-label">ROLL NO:</span>
                            <span class="field-value">${student.rollNumber || '16'}</span>
                        </div>
                    </div>
                    <div class="student-right">
                        <div class="student-field">
                            <span class="field-label">FATHER NAME:</span>
                            <span class="field-value">${student.fatherName || '____________'}</span>
                        </div>
                        <div class="student-field">
                            <span class="field-label">SECTION:</span>
                            <span class="field-value">${student.section || 'A'}</span>
                        </div>
                    </div>
                </div>

                <!-- Marks Table -->
                <div class="marks-section">
                    <table class="marks-table">
                        <thead>
                            <tr>
                                <th>Subjects</th>
                                <th>Max.Marks</th>
                                <th>Min.Marks</th>
                                <th>Marks Obt.</th>
                                <th>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectRows}
                            <tr class="total-row">
                                <td><strong>Total</strong></td>
                                <td><strong>${actualMaxMarks}</strong></td>
                                <td><strong>${actualMinMarks}</strong></td>
                                <td class="total-marks" style="font-weight: bold;"><strong>${totalObtained}</strong></td>
                                <td></td>
                            </tr>
                            <tr class="percentage-row">
                                <td><strong>Percentage</strong></td>
                                <td colspan="3" class="percentage" style="font-weight: bold;">${percentage}%</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><strong>Grade</strong></td>
                                <td colspan="3" class="grade" style="font-weight: bold;">${grade}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Attendance Section -->
                <div class="attendance-section">
                    <h3 class="attendance-title">Attendance</h3>
                    <div class="attendance-single-line">
                        <span class="attendance-label">Total Days:</span>
                        <span class="attendance-value">______</span>
                        <span class="attendance-label">Present:</span>
                        <span class="attendance-value">______</span>
                        <span class="attendance-label">Absent:</span>
                        <span class="attendance-value">______</span>
                    </div>
                </div>

                <!-- Co-Scholastic Areas -->
                <div class="co-scholastic">
                    <h3>Co-Scholastic Areas</h3>
                    <div class="co-scholastic-grid">
                        <div class="co-item">
                            <span>1. Discipline in the classroom :</span>
                            <div class="grade-options">[ A / B / C ]</div>
                        </div>
                        <div class="co-item">
                            <span>2. Behavior / Conduct with teachers & classmates :</span>
                            <div class="grade-options">[ A / B / C ]</div>
                        </div>
                        <div class="co-item">
                            <span>3. Regularity & Neatness in doing HW/CW :</span>
                            <div class="grade-options">[ A / B / C ]</div>
                        </div>
                        <div class="co-item">
                            <span>4. Comes to School :</span>
                            <div class="school-timing-options">
                                <span class="timing-option">[ &nbsp; ] On time</span>
                                <span class="timing-option">[ &nbsp; ] Sometimes Late</span>
                                <span class="timing-option">[ &nbsp; ] Always Late</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Signatures -->
                <div class="signatures">
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <strong>Parent Sign</strong>
                    </div>
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <strong>Class Teacher</strong>
                    </div>
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <strong>Academic Head</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getMinMarks(maxMarks) {
    // Calculate minimum marks based on max marks
    // For 50 max marks → 18 min marks (36%)
    // For 100 max marks → 35 min marks (35%)
    const max = parseInt(maxMarks) || 100;
    if (max === 50) {
        return 18;
    } else if (max === 100) {
        return 35;
    } else {
        // For other max marks, use 35% as minimum
        return Math.ceil(max * 0.35);
    }
}

function getRemark(obtained, minimum) {
    const obtainedNum = parseInt(obtained) || 0;
    const minimumNum = parseInt(minimum) || 35;
    console.log(`Checking remark: obtained=${obtainedNum}, minimum=${minimumNum}, result=${obtainedNum >= minimumNum ? 'Pass' : 'Fail'}`);
    return obtainedNum >= minimumNum ? 'Pass' : 'Fail';
}

function getGrade(percentage) {
    const p = parseFloat(percentage);
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B+';
    if (p >= 60) return 'B';
    if (p >= 50) return 'C+';
    if (p >= 40) return 'C';
    if (p >= 35) return 'D';
    return 'F';
}

// End of simplified report card generator