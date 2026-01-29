import { NextResponse } from 'next/server';
import { getAllCohorts } from '@/features/cohorts/service';

export async function GET() {
  const result = await getAllCohorts();

  if (!result.success) {
    switch (result.error.type) {
      case 'unauthorized':
        return NextResponse.json(
          { message: 'Unauthorized' },
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      case 'forbidden':
        return NextResponse.json(
          { message: 'Forbidden' },
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      default:
        return NextResponse.json(
          { message: 'Internal server error' },
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        );
    }
  }

  return NextResponse.json({ cohorts: result.data });
}
