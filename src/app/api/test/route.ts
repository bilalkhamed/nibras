import { NextResponse } from 'next/server';
import { findWeekAssignments } from '@/features/assignments/dal'; // Update this path to where your function is

export async function GET() {
  console.log('🚧 STARTING MANUAL TEST 🚧');

  try {
    const assignments = await findWeekAssignments({
      levelId: null, // Replace with a real ID from your DB
      weekId: 'kz6j4sz8y68zxrz006edqors', // Replace with a real ID
      programSlug: undefined, // or 'some-slug'
      programFilter: 'supervisor',
    });

    console.log('✅ RESULT:', JSON.stringify(assignments, null, 2));

    return NextResponse.json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error('❌ ERROR:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
