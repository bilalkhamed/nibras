export type ServiceErrorType =
  | {
      type: 'unauthorized';
      statusCode: 401;
    }
  | {
      type: 'forbidden';
      statusCode: 403;
    }
  | {
      type: 'not-found';
      statusCode: 404;
    }
  | {
      type: 'conflict';
      statusCode: 409;
    }
  | {
      type: 'internal';
      statusCode: 500;
    }
  | {
      type: 'unknown';
      statusCode: 500;
    };

export type ServiceReturn<T, E extends ServiceErrorType = ServiceErrorType> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };

export class ServiceError extends Error {
  serviceError: ServiceErrorType;
  constructor(serviceError: ServiceErrorType) {
    super('ServiceError');
    this.name = 'ServiceError';
    this.serviceError = serviceError;
  }
}
