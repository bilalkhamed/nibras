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
  CreateGroupDialog,
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
} from './types';
