# Progress Page Documentation

This document explains the architecture and components of the student progress tracking page.

## Overview

The progress page allows supervisors to track student assignment completion with:

- **Two view modes**: View by student or view by assignment
- **Full optimistic UI**: All changes reflect instantly before server confirmation
- **Mobile responsive**: Accordion view on mobile, table view on desktop
- **Dark mode support**: All components properly styled for both themes
- **Filtering & Search**: Filter by completion status and search by name

---

## File Structure

```
progress/
├── page.tsx                          # Server component, data fetching
├── progress-context.tsx              # Optimistic state management
├── student-progress-container.tsx    # Main client component with filtering
├── student-progress-table.tsx        # Desktop table view (md+)
├── student-progress-accordion-view.tsx # Mobile accordion for students
├── assignment-progress-accordion.tsx # Accordion view by assignments
├── completion-badge-optimistic.tsx   # Completion toggle badge
├── view-mode-toggle.tsx              # Toggle between view modes
└── README.md                         # This file
```

---

## Components

### `page.tsx` (Server Component)

**Purpose**: Entry point, fetches all data server-side.

**Responsibilities**:

- Fetches group, students, assignments, and student assignments
- Gets current user session for tracking who marked completions
- Computes initial `StudentProgress[]` with statuses
- Renders `StudentProgressContainer` with all props

**Key Data**:

- `assignments`: Week's assignments for the cohort's level
- `studentsProgress`: Array of students with their completion statuses
- `currentUserName`: Name of logged-in user for "marked by" tracking

---

### `progress-context.tsx` (Client Component)

**Purpose**: Central state management for optimistic UI updates.

**Exports**:

- `ProgressProvider`: Context provider component
- `useProgressContext()`: Hook to access context

**State Managed**:

- `students`: Optimistic student progress array
- `assignmentProgress`: Computed assignment-centric view
- `toggleCompletion()`: Function to toggle with optimistic update

**How Optimistic Updates Work**:

1. User clicks toggle button
2. `startTransition` wraps the update
3. `useOptimistic` immediately updates local state
4. UI reflects new status, count, colors instantly
5. Server action runs in background
6. On completion, `revalidatePath` syncs server state

**Computed Values**:

- Student status: `warning` | `pending` | `done`
- Assignment status: `none` | `partial` | `complete`
- Completion counts update automatically

---

### `student-progress-container.tsx` (Client Component)

**Purpose**: Main container with filtering, view mode toggle, and responsive layout.

**Features**:

- **View Mode Toggle**: Switch between student/assignment views
- **TanStack Table**: Powers filtering and search
- **Responsive**: Shows table on md+, accordion on mobile

**Filtering (Student View)**:

- Search by student name (global filter)
- Filter by status: all, done, pending, warning

**Filtering (Assignment View)**:

- Search by assignment name
- Filter by status: all, complete, partial, none

**Layout**:

```jsx
<ProgressProvider>
  <ViewModeToggle />
  <FilterControls /> {/* Different per view mode */}
  <ResultsCount />
  {viewMode === 'student' ? (
    <>
      <StudentProgressTable /> {/* hidden on mobile */}
      <StudentProgressAccordionView /> {/* hidden on desktop */}
    </>
  ) : (
    <AssignmentProgressAccordion />
  )}
</ProgressProvider>
```

---

### `student-progress-table.tsx` (Client Component)

**Purpose**: Desktop table view for student progress.

**Features**:

- Status icon with tooltip showing label
- Student name column
- One column per assignment with completion badge
- Completed count column
- Uses `CompletionBadgeOptimistic` for each cell

**Styling**:

- Alternating row colors (light/dark mode)
- Status icon with background color matching status
- Horizontal scroll on overflow

---

### `student-progress-accordion-view.tsx` (Client Component)

**Purpose**: Mobile-friendly accordion for viewing by student.

**Features**:

- Each student is an accordion item
- Header shows: status icon (with tooltip), name, completion count
- Expanded content shows all assignments with toggle buttons
- Shows completion date and "marked by" when applicable

**STATUS_CONFIG** (exported):

```typescript
{
  warning: { icon, className, bgClassName, label: 'لم تُنجز أي مهمة بعد' },
  pending: { icon, className, bgClassName, label: 'أنجزت بعض المهام' },
  done:    { icon, className, bgClassName, label: 'أنجزت جميع المهام' },
}
```

---

### `assignment-progress-accordion.tsx` (Client Component)

**Purpose**: View progress organized by assignment instead of student.

**Features**:

- Each assignment is an accordion item
- Header shows: status icon (with tooltip), name, completion count
- Expanded content shows all students with their completion status
- Toggle buttons for each student

**ASSIGNMENT_STATUS_CONFIG** (exported):

```typescript
{
  none:     { icon, className, bgClassName, label: 'لم يسلم أي طالب' },
  partial:  { icon, className, bgClassName, label: 'سلم بعض الطلاب' },
  complete: { icon, className, bgClassName, label: 'سلم جميع الطلاب' },
}
```

---

### `completion-badge-optimistic.tsx` (Client Component)

**Purpose**: Clickable badge showing completion status with optimistic updates.

**Props**:

- `assignmentId`: ID of the assignment
- `studentId`: ID of the student
- `studentName`: Name for "marked by self" detection

**Features**:

- Uses `useProgressContext()` for state
- Shows checkmark icon when complete
- Shows completion date below badge
- Tooltip with full date/time and "marked by" info
- Click toggles completion state

---

### `view-mode-toggle.tsx` (Client Component)

**Purpose**: Toggle buttons for switching between view modes.

**Props**:

- `viewMode`: Current mode ('student' | 'assignment')
- `onViewModeChange`: Callback when mode changes

**Features**:

- Two buttons: Students (Users icon), Assignments (BookOpen icon)
- Active state styling
- Tooltips on mobile (labels hidden)
- Responsive: Shows labels on sm+, icons only on mobile

---

## Types (from `@/types/progress.ts`)

```typescript
// Assignment completion status
type AssignmentStatus = {
  isCompleted: boolean;
  completedAt: Date | null;
  markedBy: { firstName; middleName; lastName } | null;
};

// Student progress status
type StudentProgressStatus = 'warning' | 'pending' | 'done';

// Student with all their assignment statuses
type StudentProgress = {
  id: string;
  name: string;
  completedCount: number;
  totalAssignments: number;
  status: StudentProgressStatus;
  assignmentStatuses: Record<string, AssignmentStatus>;
};

// View mode
type ViewMode = 'student' | 'assignment';

// Assignment progress status
type AssignmentProgressStatus = 'none' | 'partial' | 'complete';

// Assignment with all student statuses
type AssignmentProgress = {
  id: string;
  name: string;
  completedCount: number;
  totalStudents: number;
  status: AssignmentProgressStatus;
  studentStatuses: Record<string, AssignmentStatus & { studentName: string }>;
};
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        page.tsx                              │
│  (Server: fetches data, computes initial state)             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 StudentProgressContainer                     │
│  (Client: wraps with ProgressProvider)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    ProgressProvider                          │
│  (Context: manages optimistic state)                        │
│                                                             │
│  students[] ◄──────── useOptimistic ────────► Server Action │
│       │                                                     │
│       └──► assignmentProgress[] (computed)                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌────────────┐  ┌────────────┐  ┌────────────────────┐
   │   Table    │  │  Student   │  │    Assignment      │
   │  (desktop) │  │  Accordion │  │    Accordion       │
   │            │  │  (mobile)  │  │  (assignment view) │
   └────────────┘  └────────────┘  └────────────────────┘
```

---

## Optimistic UI Details

The key to instant UI updates is the `useOptimistic` hook in `progress-context.tsx`:

```typescript
const [optimisticStudents, updateOptimisticStudents] = useOptimistic(
  initialStudents,
  (state, action) => applyOptimisticUpdate(state, action, currentUserName),
);
```

When `toggleCompletion` is called:

1. **Immediately**: The `applyOptimisticUpdate` function runs synchronously
2. It updates the specific student's assignment status
3. It recalculates `completedCount` and `status`
4. All dependent computed values (like `assignmentProgress`) update via `useMemo`
5. **In background**: The server action runs
6. **On completion**: `revalidatePath` triggers a refresh with real server state

This ensures:

- ✅ Status icons change instantly
- ✅ Completion counts update instantly
- ✅ Row/card colors change instantly
- ✅ "Marked by" shows current user immediately
- ✅ Completion date shows current time immediately

---

## Server Action

Located in `@/lib/server/actions.ts`:

```typescript
export async function toggleAssignmentCompletion(
  assignmentId: string,
  isCompleted: boolean,
  studentId: string,
) {
  // Upsert StudentAssignment record
  // Set completedAt, markedById
  // revalidatePath('/dashboard', 'layout')
}
```

The `revalidatePath` call ensures the page re-fetches after the optimistic update resolves.

---

## Styling Notes

### Dark Mode

All components use Tailwind's `dark:` variants:

- Backgrounds: `bg-card dark:bg-card`, `bg-muted/40 dark:bg-muted/25`
- Status colors: `bg-emerald-50 dark:bg-emerald-500/20`
- Text: Uses semantic colors like `text-foreground`, `text-muted-foreground`

### Responsive

- **Mobile (< md)**: Accordion views, stacked filters
- **Desktop (≥ md)**: Table view, inline filters
- View mode toggle shows labels on sm+, icons only on xs

### RTL Support

- All text alignment uses `text-right` where appropriate
- Icons positioned correctly for RTL
- Select components use `dir="rtl"`
