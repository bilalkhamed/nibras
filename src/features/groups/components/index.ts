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

// Progress tracking components
export {
  StudentProgressContainer,
  StudentProgressTable,
  StudentProgressAccordionView,
  STATUS_CONFIG,
  AssignmentProgressAccordion,
  ASSIGNMENT_STATUS_CONFIG,
  ViewModeToggle,
  CompletionBadgeOptimistic,
  ProgressProvider,
  useProgressContext,
} from './progress';

// Student-facing components (my-group page)
export {
  StudentGroupInfoSection,
  SupervisorSection,
  GroupStudentsSection,
} from './student';
