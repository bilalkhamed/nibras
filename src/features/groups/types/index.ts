/**
 * Groups Feature Types
 *
 * Contains all DTOs and type definitions for the groups feature.
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Schema for creating a new group
 */
export const createGroupSchema = z.object({
  name: z.string().min(1, 'اسم المجموعة مطلوب'),
  cohortId: z.string().min(1, 'الدفعة مطلوبة'),
  supervisors: z.array(z.string()).min(1, 'المشرفة مطلوبة'),
});

/**
 * Schema for adding a student to a group
 */
export const addStudentToGroupSchema = z.object({
  groupId: z.string().min(1),
  studentId: z.string().min(1),
});

/**
 * Schema for removing a student from a group
 */
export const removeStudentFromGroupSchema = z.object({
  groupId: z.string().min(1),
  studentId: z.string().min(1),
});

// ============================================================================
// Inferred Types from Schemas
// ============================================================================

export type CreateGroupData = z.infer<typeof createGroupSchema>;
export type AddStudentToGroupData = z.infer<typeof addStudentToGroupSchema>;
export type RemoveStudentFromGroupData = z.infer<
  typeof removeStudentFromGroupSchema
>;

// ============================================================================
// Group DTOs
// ============================================================================

/**
 * Basic group supervisor info
 */
export type GroupSupervisorDTO = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

export type GroupStudentInfoDTO = {
  student: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
  joinedAt: Date;
};

/**
 * Group with full details (for info page)
 */
export type GroupDetailDTO = {
  id: string;
  name: string;
  code: string;
  cohortId: string;
  createdAt: Date;
  supervisors: GroupSupervisorDTO[];
  students: GroupStudentInfoDTO[];
  cohort: {
    id: string;
    name: string;
    currentLevelId: string;
    currentLevel: {
      id: string;
      title: string;
    };
  };
};

/**
 * Group for list view (with counts)
 */
export type GroupListItemDTO = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  cohort: {
    id: string;
    name: string;
    currentLevel: {
      id: string;
      title: string;
    } | null;
  };
  supervisors: GroupSupervisorDTO[];
  _count: {
    students: number;
  };
};

/**
 * Group student entry in junction table
 */
export const selectGroupStudent = {
  id: true,
  groupId: true,
  studentId: true,
  isActive: true,
  joinedAt: true,
  leftAt: true,
} satisfies Prisma.GroupStudentSelect;

export type GroupStudentEntryDTO = Prisma.GroupStudentGetPayload<{
  select: typeof selectGroupStudent;
}>;

export const selectGroupStudentWithCohortId = {
  id: true,
  groupId: true,
  studentId: true,
  isActive: true,
  joinedAt: true,
  leftAt: true,
  group: {
    select: {
      cohortId: true,
    },
  },
} satisfies Prisma.GroupStudentSelect;

export type GroupStudentWithCohortIdDTO = Prisma.GroupStudentGetPayload<{
  select: typeof selectGroupStudentWithCohortId;
}>;

// ============================================================================
// Action Results
// ============================================================================

export type CreateGroupResult =
  | { success: true; groupId: string }
  | { success: false; error: string };

export type AddStudentResult =
  | { success: true }
  | { success: false; error: string };

export type RemoveStudentResult =
  | { success: true }
  | { success: false; error: string };

// ============================================================================
// Filter Options
// ============================================================================

export type GetGroupsOptions = {
  supervisorId?: string;
  cohortId?: string;
};

// ============================================================================
// Progress Types
// ============================================================================

import type { Assignment, Prisma } from '@prisma/client';

export type AssignmentStatus = {
  isCompleted: boolean;
  completedAt: Date | null;
  markedBy: {
    firstName: string;
    middleName: string | null;
    lastName: string;
  } | null;
};

export type StudentProgressStatus = 'warning' | 'pending' | 'done';

export type StudentProgress = {
  id: string;
  name: string;
  completedCount: number;
  totalAssignments: number;
  status: StudentProgressStatus;
  assignmentStatuses: Record<string, AssignmentStatus>;
};

export type StudentAssignmentDetail = {
  assignmentId: string;
  assignmentName: string;
  isCompleted: boolean;
  completedAt: Date | null;
  markedByName: string | null;
  markedBySelf: boolean;
};

export type ProgressViewProps = {
  assignments: Assignment[];
  students: StudentProgress[];
};

export type ViewMode = 'student' | 'assignment';

export type AssignmentProgressStatus = 'none' | 'partial' | 'complete';

export type AssignmentProgress = {
  id: string;
  name: string;
  completedCount: number;
  totalStudents: number;
  status: AssignmentProgressStatus;
  studentStatuses: Record<string, AssignmentStatus & { studentName: string }>;
};

// Optimistic update types
export type OptimisticAction = {
  type: 'toggle';
  studentId: string;
  assignmentId: string;
  newCompleted: boolean;
  markerName: string;
};

// GroupStudent

export const myGroupStudentSelect = {
  joinedAt: true,
  isActive: true,
  leftAt: true,
  group: {
    select: {
      id: true,
      name: true,
      cohort: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          students: true,
        },
      },
      supervisors: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.GroupStudentSelect;

// 2. Generate the Type automatically 🪄
export type GroupStudentDTO = Prisma.GroupStudentGetPayload<{
  select: typeof myGroupStudentSelect;
}>;
