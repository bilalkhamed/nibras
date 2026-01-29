/**
 * Cohorts Service - Public API
 *
 * Re-exports all service functions for use in server actions.
 */

import 'server-only';

// Query operations
export { getAllCohorts } from './queries';

// Mutation operations
export { createCohort } from './mutations';
