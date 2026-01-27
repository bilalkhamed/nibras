import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import { findManyUsers, findUserByEmail, findUserById } from '../dal';
import { UserByEmail, UserDTO } from '../types';
import { ServiceReturn } from '@/lib/server/service/types';

export async function getAllUsers() {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== 'admin') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }
      const dalResult = await findManyUsers();
      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

export async function getUserById(id: string) {
  // 1. Explicitly tell TS: "This function returns a UserDTO, NOT UserDTO | null"
  return runServiceOperation<UserDTO>(
    async (session) => {
      if (session!.role !== 'admin') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findUserById(id);

      // 2. Handle the DAL Failure (DB Error)
      if (!dalResult.success) {
        // We cast this because we know it's an error, so it fits both types.
        return mapDalToService(dalResult) as ServiceReturn<UserDTO>;
      }

      // 3. Handle the "Not Found" Case (Business Logic)
      if (!dalResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      // 4. Success Case (TS now knows dalResult.data is UserDTO)
      return {
        success: true,
        data: dalResult.data,
      };
    },
    { requireAuth: true },
  );
}

export async function getUserByEmail(email: string) {
  // 1. Explicitly tell TS: "This function returns a UserDTO, NOT UserDTO | null"
  return runServiceOperation<UserByEmail>(
    async () => {
      const dalResult = await findUserByEmail(email);

      // 2. Handle the DAL Failure (DB Error)
      if (!dalResult.success) {
        // We cast this because we know it's an error, so it fits both types.
        return mapDalToService(dalResult) as ServiceReturn<UserByEmail>;
      }

      // 3. Handle the "Not Found" Case (Business Logic)
      if (!dalResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      // 4. Success Case (TS now knows dalResult.data is UserDTO)
      return {
        success: true,
        data: dalResult.data,
      };
    },
    { requireAuth: false },
  );
}
