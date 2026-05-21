import { AccessTokenPayload } from '@/types/types';
import { ServiceReturn } from './types';
import getAuthSession from '../auth-session';
import { DalReturn } from '../dal/types';
import { redirect } from 'next/navigation';

//todo: implement function overloads
export async function runServiceOperation<T extends object | null>(
  serviceOperation: (
    session: AccessTokenPayload | null,
  ) => Promise<ServiceReturn<T>>,
  options?: {
    requireAuth?: boolean;
  },
): Promise<ServiceReturn<T>> {
  const session = await getAuthSession();

  const { requireAuth = true } = options || {};

  if (requireAuth && !session) {
    return {
      success: false,
      error: { type: 'unauthorized', statusCode: 401 },
    };
  }

  try {
    return await serviceOperation(session);
  } catch (error) {
    console.error(
      'Unhandled service error:',
      error instanceof Error ? error.stack : error,
    );
    return {
      success: false,
      error: { type: 'internal', statusCode: 500 },
    };
  }
}

export function mapDalToService<T extends object | null>(
  dalReturn: DalReturn<T>,
): ServiceReturn<T> {
  if (dalReturn.success) {
    return {
      success: true,
      data: dalReturn.data,
    };
  } else {
    const dalError = dalReturn.error;

    switch (dalError.type) {
      case 'no-user':
        return {
          success: false,
          error: { type: 'unauthorized', statusCode: 401 },
        };
      case 'no-access':
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      case 'prisma-client':
        if (dalError.error.code === 'P2002') {
          return {
            success: false,
            error: { type: 'conflict', statusCode: 409 },
          };
        } else if (dalError.error.code === 'P2003') {
          return {
            success: false,
            error: { type: 'conflict', statusCode: 409 },
          };
        }

        return {
          success: false,
          error: { type: 'internal', statusCode: 500 },
        };
      default:
        console.error('Unhandled DAL error in service layer:', dalError);
        return {
          success: false,
          error: { type: 'internal', statusCode: 500 },
        };
    }
  }
}

export async function runServiceOrRedirect<T>(
  service: () => Promise<ServiceReturn<T>>,
  routes = {
    onUnauthorized: '/login',
    onForbidden: '/forbidden',
  },
) {
  const result = await service();

  if (!result?.success) {
    if (result.error.type === 'unauthorized') {
      return redirect(routes.onUnauthorized);
    } else if (result.error.type === 'forbidden') {
      return redirect(routes.onForbidden);
    }

    return result;
  }

  return result;
}
