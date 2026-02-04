'use server';

import { ServiceReturn } from '@/lib/server/service/types';
import { CalendarWeekInput } from '../types';
import { updateCalendarWeeks } from '../service/mutations';
import { revalidatePath } from 'next/cache';

export async function updateCalendarWeeksAction(
  newWeeks: CalendarWeekInput[],
): Promise<ServiceReturn<null>> {
  try {
    const result = await updateCalendarWeeks(newWeeks);

    if (result.success) {
      revalidatePath('/dashboard/calendar');
    }
    return result;
  } catch (error) {
    console.error('Error in updateCalendarWeeksAction:', error);
    return {
      success: false,
      error: { type: 'unknown', statusCode: 500 },
    };
  }
}
