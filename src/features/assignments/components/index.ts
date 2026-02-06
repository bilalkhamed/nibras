/**
 * Assignment Components - Public API
 *
 * Re-exports all assignment components for easy importing.
 * Components are organized by usage:
 * - student/: Components for student dashboard
 * - admin/: Components for admin assignment management
 * - shared/: Components used by both student and admin
 */

// Student-facing components
export {
  WeekHero,
  ProgramFilter,
  AttachmentsPreview,
  AssignmentsGrid,
} from './student';

// Admin components
export {
  AssignmentFormContent,
  CreateAssignmentSheet,
  EditAssignmentSheet,
  DeleteAssignmentButton,
  AssignmentsTableWithActions,
} from './admin';
export type { AssignmentFormData, Link } from './admin';
export { formLinkSchema as linkSchema } from '../types';
export { FileUploader, FilesCardsList, LinkManager } from './admin';
export type { AttachedFile, UploadingFile, FileCardItem } from './admin';

// Shared components
export {
  AssignmentsTable,
  AttachmentsCell,
  SubmissionViewerSheet,
} from './shared';
