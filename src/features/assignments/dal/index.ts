/**
 * Assignment DAL - Public API
 *
 * Re-exports all DAL functions for use in the service layer.
 * This is the only entry point for DAL functions.
 */

import 'server-only';

// Query operations
export {
  findWeekAssignments,
  findStudentAssignments,
  findManyStudentAssignments,
  findAssignmentById,
  findAssignmentAttachments,
} from './queries';

// Mutation operations
export {
  upsertStudentAssignment,
  deleteAssignmentById,
  updateAssignmentBasic,
  updateAssignmentLinks,
  updateAssignmentFiles,
  insertAssignment,
} from './mutations';
