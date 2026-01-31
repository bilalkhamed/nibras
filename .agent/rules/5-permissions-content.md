CONTENT PERMISSIONS AND AUTHORIZATION

OVERVIEW
Role-based access control RBAC Five distinct roles specific permissions data access levels All authorization enforced at service layer

USER ROLES

1 ADMIN Full System Authority
Permissions Full CRUD all entities users cohorts groups programs levels weeks assignments Create suspend delete accounts Manage system-wide curriculum View cross-cohort analytics Access all groups students Configure settings Import export data Generate reports
Data Access All data no restrictions
Tasks Create cohorts Upload curriculum Assign supervisors Monitor platform-wide Generate reports Troubleshoot issues

2 COHORT MANAGER Manages Specific Cohort
Permissions Create student supervisor accounts cohort only Create manage groups cohort only Assign supervisors Move students between groups View all student progress cohort Generate cohort reports Suspend reactivate users cohort CANNOT modify curriculum CANNOT access other cohorts CANNOT create admins
Data Access Full access one cohort and all groups students Cannot view other cohorts
Implementation cohortId field in user record Service filters by cohort

3 GROUP MANAGER Read-Only Groups
Permissions View assigned groups students View student progress Generate group reports CANNOT create edit accounts CANNOT mark tasks CANNOT modify groups CANNOT access other groups
Data Access Read-only specific groups many-to-many Cannot view other groups
Use Case Assistant supervisors volunteers monitor progress no marking authority

4 SUPERVISOR Manages Groups
Permissions View students in assigned groups View progress assignment details Mark tasks complete on behalf students for low-internet Upload submissions on behalf students Generate group reports View curriculum for group level CANNOT create delete accounts CANNOT modify curriculum CANNOT access other groups CANNOT change assignments
Data Access Full access assigned groups only
Why Mark Tasks Many students Syria Yemen limited internet Complete offline report via WhatsApp Supervisors mark on behalf
Implementation StudentAssignment.markedById tracks who marked

5 STUDENT Own Assignments Only
Permissions View weekly assignments for group level Mark reading complete self Upload text photo submissions View own progress history View curriculum PDFs Zoom links CANNOT view other students progress CANNOT modify assignments CANNOT access admin features
Data Access Read-only curriculum for level Full access own assignments submissions CANNOT view others data
Privacy Students cannot see others completion to avoid comparison

PROGRAMS AND CURRICULUM

Programs Four programs

1 Reading Program All Students
Weekly reading PDFs Optional discussion points activities Completion student or supervisor marks Attachments PDF books

2 Lecture Program All Students
Weekly Zoom lectures Optional post-lecture questions activities Completion student or supervisor marks Attachments Zoom links recording links

3 Heart Reassurance Program All Students
Zoom spiritual motivational sessions Same mechanics as Lecture Attachments Zoom links

4 Supervisor Training Program New Supervisors Only
Visible to role supervisor status invited or first-time Training videos guides best practices Completion self-marked or auto-graded quizzes Phase 2

ASSIGNMENTS

Organization Program x Level x Week unique

Assignment Types

1 Reading
Type AssignmentTypes.reading Content PDF attachment Task Read pages chapters Submission Checkbox mark complete Attachments PDF files

2 Lecture
Type AssignmentTypes.lecture Content Zoom link recording Task Attend live or watch recording Submission Optional text response Attachments Zoom YouTube links

3 Exercise Submission
Type AssignmentTypes.exercise Content Activity description Task Complete activity craft reflection Submission Photo upload or text Attachments Activity instructions PDF LINK

4 Quiz Phase 2
Type AssignmentTypes.quiz Content Multiple-choice questions Task Answer questions Submission Auto-graded Attachments None questions in DB

ATTACHMENTS AND FILE STORAGE

AWS S3-compatible API Tigris Object Storage

Attachment Types
FILE Uploaded file PDF image
LINK External URL Zoom YouTube Google Drive

File Upload Flow
1 Admin Manager uploads PDF image via dashboard
2 File to S3 with unique key
3 AssignmentAttachment record type FILE fileKey
4 Student supervisor accesses Generate presigned URL valid 1 hour Return URL Client downloads from S3 reduces server load

Supported Types PDFs books guides Images JPEG PNG submissions Size Limit 10MB configurable

Low-Bandwidth Optimization Presigned URLs direct S3 download PDF compression Image thumbnails Progressive loading

AUTHORIZATION IMPLEMENTATION

Service Layer Enforcement All authorization in service Never in DAL or presentation

Pattern 1 Role-Based
if session.role not admin return forbidden
dalResult await find
return mapDalToService

Pattern 2 Cohort-Scoped
if admin dalResult cohort
if cohort_manager if session.cohortId not cohortId return forbidden

Pattern 3 Group-Scoped
if admin dalResult group
if supervisor hasAccess await verify if not return forbidden

Pattern 4 Student Self
if role not student return forbidden
dalResult own assignments only

SECURITY

Session Validation runServiceOperation validates JWT extracts session ensures authenticated

Data Filtering Never trust client IDs use session data Filter by user permissions

Sensitive Data Never return hashedPassword Never expose other students data Log authorization failures

Input Validation Zod schemas in Server Actions Sanitize user content Prisma prevents SQL injection

PERFORMANCE

Database Indexing
User role role status cohortId role
Group cohortId supervisorId
StudentAssignment assignmentId isCompleted studentId isCompleted

Efficient Queries Prisma select only needed Use include avoid N+1 Pagination for large datasets

Caching DAL use cache cacheTag Invalidate after mutations revalidateTag

ACCESS MATRIX

Feature Admin Cohort Manager Group Manager Supervisor Student
View all cohorts Y N N N N
View own cohort Y Y N N N
Create users Y Y cohort N N N
Manage groups Y Y cohort N N N
View group students Y Y cohort Y assigned Y assigned N
Mark tasks Y Y N Y for students Y self
Upload submissions Y Y N Y behalf Y own
View curriculum Y Y Y Y Y level
Edit curriculum Y N N N N
Generate reports Y Y cohort Y groups Y groups Y self

AUTHORIZATION CHECKLIST

Define permissions each role
Implement in service layer
Never bypass service
Use session for user ID
Filter queries by permissions
Validate inputs Zod
Test each role access control
Log authorization failures audit