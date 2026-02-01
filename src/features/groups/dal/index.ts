/**
 * Groups DAL - Public API
 *
 * Re-exports all DAL functions for use in the service layer.
 * This is the only entry point for DAL functions.
 */

import 'server-only';

// Query operations
export {
  findGroupById,
  findGroups,
  findGroupsBySupervisor,
  findStudentActiveGroup,
} from './queries';

// Mutation operations
export {
  insertGroup,
  updateGroup,
  deleteGroup,
  insertGroupStudent,
  findActiveGroupStudent,
  deactivateGroupStudent,
} from './mutations';
