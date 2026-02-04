/**
 * Programs DAL - Public API
 *
 * Re-exports all DAL functions for use in the service layer.
 * This is the only entry point for DAL functions.
 */

import 'server-only';

// Query operations
export * from './queries';

// Mutation operations
export { insertProgram, updateCalendarWeeks } from './mutations';
