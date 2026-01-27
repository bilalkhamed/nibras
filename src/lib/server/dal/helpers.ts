import { DalReturn } from './types';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/client';

export async function runDalOperation<T>(
  operation: () => Promise<T>,
): Promise<DalReturn<T>> {
  try {
    const data = await operation();

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      return {
        success: false,
        error: {
          type: 'prisma-validation',
          error,
        },
      };
    } else if (error instanceof PrismaClientKnownRequestError) {
      return {
        success: false,
        error: {
          type: 'prisma-client',
          error,
        },
      };
    }

    return {
      success: false,
      error: {
        type: 'unknown',
        error,
      },
    };
  }
}
