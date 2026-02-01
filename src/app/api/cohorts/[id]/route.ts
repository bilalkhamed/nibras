import { NextResponse } from 'next/server';
import { getCohortById } from '@/features/cohorts/service';

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { id } = await params;

  const result = await getCohortById(id);

  if (!result.success) {
    switch (result.error.type) {
      case 'not-found':
        return NextResponse.json(
          { message: 'Cohort not found' },
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          },
        );
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

  return NextResponse.json({ cohort: result.data });
}
