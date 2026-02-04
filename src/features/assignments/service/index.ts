/**
 * Assignment Service - Public API
 *
 * Re-exports all service functions for use in actions and server components.
 * This is the main entry point for the assignment service layer.
 */

import 'server-only';

// Query operations
export {
  getWeekAssignments,
  getStudentAssignments,
  getManyStudentAssignments,
} from './queries';

// Mutation operations
export {
  updateStudentAssignment,
  deleteAssignment,
  modifyAssignment,
  createAssignment,
} from './mutations';
