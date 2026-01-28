/**
 * Groups Service - Public API
 *
 * Re-exports all service functions for use in actions and server components.
 * This is the main entry point for the groups service layer.
 */

import 'server-only';

// Query operations
export { getGroupById, getGroups } from './queries';

// Mutation operations
export {
  createGroup,
  addStudentToGroup,
  removeStudentFromGroup,
} from './mutations';
