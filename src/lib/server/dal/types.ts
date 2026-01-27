import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/client';

export type DalReturn<T, E extends DalErrorType = DalErrorType> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };

export type DalErrorType =
  | {
      type: 'no-user';
    }
  | {
      type: 'no-access';
    }
  | {
      type: 'prisma-validation';
      error: PrismaClientValidationError;
    }
  | {
      type: 'prisma-client';
      error: PrismaClientKnownRequestError;
    }
  | {
      type: 'unknown';
      error: unknown;
    };

export class DalError extends Error {
  dalError: DalErrorType;
  constructor(dalError: DalErrorType) {
    super('DalError');
    this.name = 'DalError';
    this.dalError = dalError;
  }
}
