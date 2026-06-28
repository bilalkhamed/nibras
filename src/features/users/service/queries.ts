import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import {
  countUsers,
  countUsersByRole,
  findManyUsers,
  findRecentUsers,
  findStudentBasicInfo,
  findStudentsBySupervisorWithAssignments,
  findUserByIdentifier,
  findUserById,
  findUserForInvite,
  findUsersBasic,
  findUsersNameOnly,
  findUserWithRoleAndCohortAndGroup,
} from '../dal';
import {
  RecentUserDTO,
  StudentBasicInfoDTO,
  StudentWithAssignmentsDTO,
  UserBasicDTO,
  UserByEmail,
  UserDTO,
  UserInviteStatusDTO,
  UserNameDTO,
  UserWithCohortAndStudentProfileDTO,
  UserWithRoleAndCohortAndGroupDTO,
} from '../types';
import { Role } from '@prisma/client';

// ============================================================================
// Basic Query Services
// ============================================================================

/** Get all users - admin only */
export async function getAllUsers() {
  return runServiceOperation(
    async (session) => {
      if (
        session!.role !== 'admin' &&
        session!.role !== 'director' &&
        session!.role !== 'cohort_manager'
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }
      let filter;
      if (session!.role === 'cohort_manager') {
        filter = { cohortId: session?.managedCohortId || undefined };
      }

      const dalResult = await findManyUsers(filter);

      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

/** Get user by ID - admin only */
export async function getUserById(id: string) {
  return runServiceOperation<UserWithCohortAndStudentProfileDTO>(
    async (session) => {
      if (
        session!.role !== 'admin' &&
        session!.role !== 'director' &&
        session!.role !== 'cohort_manager'
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      let filter;

      if (session!.role === 'cohort_manager') {
        filter = { cohortId: session?.managedCohortId || undefined };
      }
      const dalResult = await findUserById(id, filter);

      if (!dalResult.success) {
        return mapDalToService<UserWithCohortAndStudentProfileDTO>(dalResult);
      }

      if (!dalResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      return { success: true, data: dalResult.data };
    },
    { requireAuth: true },
  );
}

/** Get current user info from session */
export async function getCurrentUserData() {
  return runServiceOperation<UserDTO>(
    async (session) => {
      if (!session) {
        return {
          success: false,
          error: { type: 'unauthorized', statusCode: 401 },
        };
      }

      const dalResult = await findUserById(session.userId);

      if (!dalResult.success) {
        return mapDalToService<UserDTO>(dalResult);
      }

      if (!dalResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      return { success: true, data: dalResult.data };
    },
    { requireAuth: true },
  );
}

/** Get user by email - no auth required (for login) */
export async function getUserByIdentifier(identifier: string) {
  return runServiceOperation<UserByEmail>(
    async () => {
      const dalResult = await findUserByIdentifier(identifier);

      if (!dalResult.success) {
        return mapDalToService<UserByEmail>(dalResult);
      }

      if (!dalResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      return { success: true, data: dalResult.data };
    },
    { requireAuth: false },
  );
}

// ============================================================================
// Filtered Query Services
// ============================================================================

export type UserFilters = {
  role?: Role;
  groupStatus?: 'inactive';
  cohortId?: string;
  isTraining?: boolean;
};

/** Get users with name only (for dropdowns) - admin only */
export async function getUsersNameOnly(filters?: UserFilters) {
  return runServiceOperation<UserNameDTO[]>(
    async (session) => {
      if (
        session!.role !== 'admin' &&
        session!.role !== 'director' &&
        session!.role !== 'cohort_manager'
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      if (session!.role === 'cohort_manager') {
        filters = { ...filters, cohortId: session!.managedCohortId! };
      }

      const dalResult = await findUsersNameOnly(filters);
      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

/** Get users with basic info - admin only */
export async function getUsersBasic(filters?: UserFilters) {
  return runServiceOperation<UserBasicDTO[]>(
    async (session) => {
      if (
        session!.role !== 'admin' &&
        session!.role !== 'director' &&
        session!.role !== 'cohort_manager'
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      if (session!.role === 'cohort_manager') {
        filters = { ...filters, cohortId: session!.managedCohortId! };
      }
      const dalResult = await findUsersBasic(filters);
      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Dashboard Query Services
// ============================================================================

/** Get user counts by role - admin and cohort manager */
export async function getUsersRoleCounts(filters?: { cohortId?: string }) {
  return runServiceOperation<{ [key in Role]: number }>(
    async (session) => {
      // Allow admin and cohort manager
      if (
        session!.role !== 'admin' &&
        session!.role !== 'director' &&
        session!.role !== 'cohort_manager'
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      let cohortIdFilter = filters?.cohortId;

      // Force cohort manager to their cohort
      if (session!.role === 'cohort_manager') {
        const managedCohortId = session!.managedCohortId;
        cohortIdFilter = managedCohortId || undefined;
      }

      const dalResult = await countUsersByRole({ cohortId: cohortIdFilter });

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      // Transform array to object
      const counts: { [key in Role]: number } = {
        admin: 0,
        cohort_manager: 0,
        supervisor: 0,
        student: 0,
        group_manager: 0,
        program_manager: 0,
        director: 0,
        media_team: 0,
      };

      dalResult.data.forEach((item) => {
        counts[item.role] = item._count;
      });

      return {
        success: true,
        data: counts,
      };
    },
    { requireAuth: true },
  );
}

/** Get total users count with filters */
export async function getUsersCount(filters?: { cohortId?: string }) {
  return runServiceOperation<{ count: number }>(
    async (session) => {
      if (
        session!.role !== 'admin' &&
        session!.role !== 'director' &&
        session!.role !== 'cohort_manager'
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      let cohortIdFilter = filters?.cohortId;

      if (session!.role === 'cohort_manager') {
        const managedCohortId = session!.managedCohortId;
        if (cohortIdFilter && cohortIdFilter !== managedCohortId) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
        cohortIdFilter = managedCohortId || undefined;
      }

      return mapDalToService(await countUsers({ cohortId: cohortIdFilter }));
    },
    { requireAuth: true },
  );
}

/** Get recent users - admin only */
export async function getRecentUsers(limit: number = 5) {
  return runServiceOperation<RecentUserDTO[]>(
    async (session) => {
      if (session!.role !== 'admin' && session!.role !== 'director') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findRecentUsers(limit);
      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

/** Get student basic info - for student's own dashboard */
export async function getStudentBasicInfo() {
  return runServiceOperation<StudentBasicInfoDTO>(
    async (session) => {
      const dalResult = await findStudentBasicInfo(session!.userId);

      if (!dalResult.success) {
        return mapDalToService<StudentBasicInfoDTO>(dalResult);
      }

      if (!dalResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      return { success: true, data: dalResult.data };
    },
    { requireAuth: true },
  );
}

/** Get students with assignments for supervisor dashboard */
export async function getStudentsWithAssignments(limit: number = 100) {
  return runServiceOperation<StudentWithAssignmentsDTO[]>(
    async (session) => {
      if (session!.role !== 'supervisor') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findStudentsBySupervisorWithAssignments(
        session!.userId,
        limit,
      );
      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Validation Query Services
// ============================================================================

/** Get user for invite validation - admin only */
export async function getUserForInvite(userId: string) {
  return runServiceOperation<UserInviteStatusDTO>(
    async (session) => {
      if (
        ![
          'admin',
          'director',
          'cohort_manager',
          'supervisor',
          'group_manager',
        ].includes(session!.role)
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findUserForInvite(userId);

      if (!dalResult.success) {
        return mapDalToService<UserInviteStatusDTO>(dalResult);
      }

      if (!dalResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      return { success: true, data: dalResult.data };
    },
    { requireAuth: true },
  );
}

/** Get user with role and cohort for validation - admin/supervisor only */
export async function getUserWithRoleAndCohortAndGroup(userId: string) {
  return runServiceOperation<UserWithRoleAndCohortAndGroupDTO>(
    async (session) => {
      if (
        !['admin', 'director', 'cohort_manager', 'supervisor'].includes(
          session!.role,
        )
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findUserWithRoleAndCohortAndGroup(userId);

      if (!dalResult.success) {
        return mapDalToService<UserWithRoleAndCohortAndGroupDTO>(dalResult);
      }

      if (!dalResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      return { success: true, data: dalResult.data };
    },
    { requireAuth: true },
  );
}
