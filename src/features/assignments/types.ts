/**
 * Assignment Feature Types
 *
 * Contains all DTOs and type definitions for the assignments feature.
 * Separated from Prisma types to maintain a clean boundary between
 * the database layer and the application layer.
 */

import {
  Assignment,
  AssignmentAttachment,
  AssignmentTypes,
  AttachmentType,
  StudentAssignment,
} from '@prisma/client';
import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Schema for link attachments in assignment forms
 */
export const linkSchema = z.object({
  id: z.string().optional(),
  url: z.url('يرجى إدخال رابط صالح'),
  type: z.literal(AttachmentType.LINK),
});

/**
 * Schema for creating a new assignment
 */
export const createAssignmentSchema = z.object({
  levelSlug: z.string().min(1),
  weekId: z.string().min(1),
  programSlug: z.string().min(1),
  assignment: z.object({
    name: z.string().min(1),
    description: z.string().nullable(),
    type: z.enum(AssignmentTypes),
    fileKeys: z.array(z.string()).optional(),
    links: z.array(linkSchema).optional(),
    allowFileSubmission: z.boolean(),
    allowTextSubmission: z.boolean(),
  }),
});

/**
 * Schema for updating an existing assignment
 */
export const updateAssignmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  type: z.enum(AssignmentTypes),
  fileKeys: z.array(z.string()),
  links: z.array(linkSchema).optional(),
  allowFileSubmission: z.boolean(),
  allowTextSubmission: z.boolean(),
});

// ============================================================================
// Inferred Types from Schemas
// ============================================================================

export type LinkData = z.infer<typeof linkSchema>;
export type CreateAssignmentData = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentData = z.infer<typeof updateAssignmentSchema>;

// ============================================================================
// Assignment DTOs
// ============================================================================

/**
 * Basic assignment without relations
 */
export type AssignmentDTO = Assignment;

/**
 * Attachment with a temporary signed URL for access
 */
export type AttachmentWithTempUrl = AssignmentAttachment & {
  tempUrl: string;
};

/**
 * Assignment with its attachments (includes signed URLs)
 */
export type AssignmentWithAttachmentsDTO = Assignment & {
  attachments: AttachmentWithTempUrl[];
};

/**
 * Assignment with raw attachments (no signed URLs)
 */
export type AssignmentWithRawAttachmentsDTO = Assignment & {
  attachments: AssignmentAttachment[];
};

// ============================================================================
// Student Assignment DTOs
// ============================================================================

/**
 * Basic student assignment record
 */
export type StudentAssignmentDTO = StudentAssignment;

/**
 * Student assignment with marker information
 */
export type StudentAssignmentWithMarkerDTO = StudentAssignment & {
  isOverdue: boolean;
  markedBy: {
    firstName: string;
    middleName: string;
    lastName: string;
  } | null;
};

// ============================================================================
// Query Options Types
// ============================================================================

/**
 * Options for querying week assignments
 */
export type WeekAssignmentsOptions = {
  levelId: string;
  weekId: string;
  programSlug?: string;
  withAttachments?: boolean;
};

// ============================================================================
// Action Input/Output Types
// ============================================================================

/**
 * Input for toggling assignment completion
 */
export type ToggleCompletionInput = {
  assignmentId: string;
  isCompleted: boolean;
  studentId?: string;
};

export type UpdateStudentAssignmentInputDal = {
  assignmentId: string;
  studentId: string;
  data: {
    isCompleted: boolean;
    markedById?: string;
    gradedById?: string;
    textSubmission?: string | null;
    fileKey?: string | null;
    score?: number | null;
    comment?: string | null;
  };
};

export type UpdateStudentAssignmentInput = {
  assignmentId: string;
  studentId?: string;
  data: {
    isCompleted: boolean;
    markedById?: string;
    textSubmission?: string | null;
    fileKey?: string | null;
    score?: number | null;
    comment?: string | null;
  };
};

/**
 * Result of toggle completion action
 */
export type ToggleCompletionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Result of delete assignment action
 */
export type DeleteAssignmentResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Result of create assignment action
 */
export type CreateAssignmentResult =
  | { success: true; assignment: Assignment }
  | { success: false; error: string; validationErrors?: z.ZodError };

/**
 * Result of update assignment action
 */
export type UpdateAssignmentResult =
  | { success: true; assignment: Assignment }
  | { success: false; error: string };

// ============================================================================
// File Upload Types (for form components)
// ============================================================================

/**
 * Represents a file that has been attached to an assignment
 */
export type AttachedFile = {
  key: string;
  name: string;
  tempUrl: string;
  type: typeof AttachmentType.FILE;
  id?: string;
};

/**
 * Represents a file that is currently being uploaded
 */
export type UploadingFile = {
  id: string;
  file: File;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectURL?: string;
};

/**
 * Union type for file cards (attached or uploading)
 */
export type FileCardItem = AttachedFile | UploadingFile;

// ============================================================================
// Form Schema & Types
// ============================================================================

/**
 * Schema for link attachments in forms (alias for linkSchema)
 */
export const formLinkSchema = z.object({
  id: z.string().optional(),
  url: z.url('يرجى إدخال رابط صالح'),
  type: z.literal('LINK'),
});

export type Link = z.infer<typeof formLinkSchema>;

/**
 * Form validation schema for assignment create/edit forms
 */
export const assignmentFormSchema = z.object({
  name: z.string().min(1, 'يرجى إدخال اسم المهمة'),
  description: z.string().nullable(),
  type: z.enum(AssignmentTypes, 'يرجى اختيار نوع المهمة'),
  links: formLinkSchema.array().optional(),
  files: z.array(z.any()).optional(),
  newFileKeys: z.array(z.string()).optional(),
  allowFileSubmission: z.boolean(),
  allowTextSubmission: z.boolean(),
});

export type AssignmentFormData = z.infer<typeof assignmentFormSchema>;
