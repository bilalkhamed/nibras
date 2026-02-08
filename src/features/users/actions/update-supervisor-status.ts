'use server';

import { SupervisorStatus } from '@prisma/client';
import {
  updateMultipleSupervisorsStatus,
  updateSupervisorStatus,
} from '../service';
import { revalidatePath } from 'next/cache';

export async function updateSupervisorStatusAction({
  supervisorId,
  newStatus,
}: {
  supervisorId: string;
  newStatus: SupervisorStatus;
}): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: {
        message: string;
        statusCode: number;
      };
    }
> {
  const result = await updateSupervisorStatus({ supervisorId, newStatus });

  if (!result.success) {
    const errorType = result.error.type;
    let errorMessage: string;
    switch (errorType) {
      case 'not-found':
      case 'bad-request':
      case 'conflict':
        errorMessage =
          'فشل في تحديث المشرفة. يرجى التحقق من البيانات والمحاولة مرة أخرى.';
        break;
      case 'unauthorized':
      case 'forbidden':
        errorMessage = 'ليس لديك صلاحية لتحديث حالة المشرفة.';
        break;
      default:
        errorMessage =
          'حدث خطأ غير متوقع أثناء تحديث المشرفة. يرجى المحاولة مرة أخرى لاحقًا.';
        break;
    }

    return {
      success: false,
      error: {
        message: errorMessage,
        statusCode: result.error.statusCode,
      },
    };
  }

  revalidatePath('/dashboard/supervisors/training/info');
  return {
    success: true,
  };
}

export async function updateMultipleSupervisorsStatusAction({
  supervisorIds,
  newStatus,
}: {
  supervisorIds: string[];
  newStatus: SupervisorStatus;
}): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: {
        message: string;
        statusCode: number;
      };
    }
> {
  const result = await updateMultipleSupervisorsStatus({
    supervisorIds,
    newStatus,
  });

  if (!result.success) {
    const errorType = result.error.type;
    let errorMessage: string;
    switch (errorType) {
      case 'not-found':
      case 'bad-request':
      case 'conflict':
        errorMessage =
          'فشل في تحديث المشرفات. يرجى التحقق من البيانات والمحاولة مرة أخرى.';
        break;
      case 'unauthorized':
      case 'forbidden':
        errorMessage = 'ليس لديك صلاحية لتحديث حالة المشرفات.';
        break;
      default:
        errorMessage =
          'حدث خطأ غير متوقع أثناء تحديث المشرفات. يرجى المحاولة مرة أخرى لاحقًا.';
        break;
    }

    return {
      success: false,
      error: {
        message: errorMessage,
        statusCode: result.error.statusCode,
      },
    };
  }

  revalidatePath('/dashboard/supervisors/training/info');
  return {
    success: true,
  };
}
