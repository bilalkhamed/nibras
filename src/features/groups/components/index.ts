/**
 * Groups Components - Public API
 *
 * Re-exports all components organized by user role.
 */

// Admin-only components
export { CreateGroupDialog, AddStudentDialog, StudentActions } from './admin';

// Shared components
export {
  GroupTabsNav,
  GroupInfoSection,
  GroupStudentsTable,
  CohortNavigator,
  CohortNavigatorWrapper,
  GroupsListSection,
  type GroupStudent,
} from './shared';
