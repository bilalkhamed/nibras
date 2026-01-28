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
  supervisorId: z.string().min(1, 'المشرفة مطلوبة'),
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

/**
 * Basic group student info
 */
export type GroupStudentDTO = {
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
  supervisor: GroupSupervisorDTO;
  students: GroupStudentDTO[];
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
  supervisor: {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
  };
  _count: {
    students: number;
  };
};

/**
 * Group student entry in junction table
 */
export type GroupStudentEntryDTO = {
  id: string;
  groupId: string;
  studentId: string;
  isActive: boolean;
  joinedAt: Date;
  leftAt: Date | null;
};

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
