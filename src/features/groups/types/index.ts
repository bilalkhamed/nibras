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
  groupManager: z.string().optional(),
});

/**
 * Schema for updating an existing group
 */
export const updateGroupSchema = z.object({
  name: z.string().min(1, 'اسم المجموعة مطلوب'),
  cohortId: z.string().min(1, 'الدفعة مطلوبة'),
  supervisors: z.array(z.string()).min(1, 'المشرفة مطلوبة'),
  groupManager: z.string().optional(),
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
export type UpdateGroupData = z.infer<typeof updateGroupSchema>;
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
const selectGroupSupervisor = {
  id: true,
  firstName: true,
  middleName: true,
  lastName: true,
  email: true,
  phone: true,
} satisfies Prisma.UserSelect;

// 2. Generate the Type automatically 🪄
export type GroupSupervisorDTO = Prisma.UserGetPayload<{
  select: typeof selectGroupSupervisor;
}>;

const selectGroupStudentInfo = {
  student: {
    select: {
      firstName: true,
      middleName: true,
      lastName: true,
      id: true,
    },
  },
  joinedAt: true,
} satisfies Prisma.GroupStudentSelect;
export type GroupStudentInfoDTO = Prisma.GroupStudentGetPayload<{
  select: typeof selectGroupStudentInfo;
}>;

/**
 * Group with full details (for info page)
 */

export const selectGroupDetail = {
  id: true,
  name: true,
  cohortId: true,
  createdAt: true,
  supervisors: {
    select: selectGroupSupervisor,
  },
  students: {
    where: { isActive: true },
    select: selectGroupStudentInfo,
  },
  managers: {
    select: {
      user: {
        select: selectGroupSupervisor,
      },
    },
  },
  cohort: {
    select: {
      id: true,
      name: true,
      currentLevelId: true,
      currentLevel: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  },
} satisfies Prisma.GroupSelect;

export type GroupDetailDTO = Omit<
  Prisma.GroupGetPayload<{
    select: typeof selectGroupDetail;
  }>,
  'managers'
> & {
  managers: GroupSupervisorDTO[];
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

export type UpdateGroupResult =
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
  managerId?: string;
};

// ============================================================================
// Progress Types
// ============================================================================

import type { Assignment, Prisma } from '@prisma/client';

export type AssignmentStatus = {
  isCompleted: boolean;
  completedAt: Date | null;
  isOverdue: boolean;
  markedBy: {
    firstName: string;
    middleName: string | null;
    lastName: string;
  } | null;
  fileKey?: string | null;
  fileUrl?: string | null;
  textSubmission?: string | null;
  score?: number | null;
  comment?: string | null;
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
