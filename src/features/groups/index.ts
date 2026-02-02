/**
 * Groups Feature - Public API
 *
 * This is the main entry point for the groups feature.
 * All exports are organized by layer for clean imports.
 */

// Service layer (for server components and actions)
export {
  getGroupById,
  getGroups,
  createGroup,
  addStudentToGroup,
  removeStudentFromGroup,
} from './service';

// Server Actions (for client components)
export {
  createGroupAction,
  addStudentToGroupAction,
  removeStudentFromGroupAction,
} from './actions';

// Components
export {
  // Admin
  CreateGroupSheet,
  AddStudentDialog,
  StudentActions,
  // Shared
  GroupTabsNav,
  GroupInfoSection,
  GroupStudentsTable,
  CohortNavigator,
  CohortNavigatorWrapper,
  GroupsListSection,
  type GroupStudent,
  // Progress
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
  // Student (my-group)
  StudentGroupInfoSection,
  SupervisorSection,
  GroupStudentsSection,
} from './components';

// Types
export type {
  CreateGroupData,
  AddStudentToGroupData,
  RemoveStudentFromGroupData,
  GroupDetailDTO,
  GroupListItemDTO,
  GroupSupervisorDTO,
  GroupStudentDTO,
  CreateGroupResult,
  AddStudentResult,
  RemoveStudentResult,
  GetGroupsOptions,
  // Progress types
  AssignmentStatus,
  StudentProgressStatus,
  StudentProgress,
  StudentAssignmentDetail,
  ProgressViewProps,
  ViewMode,
  AssignmentProgressStatus,
  AssignmentProgress,
  OptimisticAction,
} from './types';
