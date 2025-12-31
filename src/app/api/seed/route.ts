import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/server/prisma';
import { Prisma } from '@prisma/client';
import { getAcademicYear } from '@/lib/server/academic-year';

export async function POST() {
  try {
    const t0 = performance.now();

    // 1. Fetch existing Weeks
    const weeks = await prisma.week.findMany({
      orderBy: { number: 'asc' }, // Good practice to ensure weeks are in order
    });

    const t1 = performance.now();

    // 2. Setup Base Date: Sunday, Dec 28, 2025
    // Note: JS months are 0-indexed (0 = Jan, 11 = Dec)
    const baseDate = new Date(2025, 11, 28);

    baseDate.setHours(0, 0, 0, 0); // Set to midnight

    const calendarWeeksData: Prisma.CalendarWeekCreateManyArgs = {
      data: weeks.map((week, index) => {
        const start = new Date(baseDate);
        start.setDate(baseDate.getDate() + index * 7);
        // Ensure start is midnight
        start.setHours(0, 0, 0, 0);

        // B. End Date (Saturday 23:59:59)
        const end = new Date(start);
        // FIX: Add 6 days (not 7) to get Saturday
        end.setDate(start.getDate() + 6);
        // FIX: Set time to end of day
        end.setHours(23, 59, 59, 999);

        return {
          weekId: week.id,
          academicYear: 2025,
          startDate: start,
          endDate: end,
        };
      }),
      skipDuplicates: true,
    };

    const t2 = performance.now();

    // 3. Insert the data
    const result = await prisma.calendarWeek.createMany(calendarWeeksData);

    const t3 = performance.now();

    // Calculate durations
    const fetchTime = (t1 - t0).toFixed(2);
    const mapTime = (t2 - t1).toFixed(2);
    const insertTime = (t3 - t2).toFixed(2);
    const totalTime = (t3 - t0).toFixed(2);

    return NextResponse.json({
      message: 'Seeding successful',
      count: result.count,
      metrics: {
        fetchDuration: `${fetchTime}ms`,
        mapDuration: `${mapTime}ms`,
        insertDuration: `${insertTime}ms`,
        totalDuration: `${totalTime}ms`,
      },
    });
  } catch (error) {
    console.error('Seeding Error:', error); // Log to server console for debugging
    return NextResponse.json(
      {
        message: 'An error occurred while seeding data.',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const t0 = performance.now();
  const academicYear = getAcademicYear();

  const program = 'reading';
  const level = 'level1';

  const currentWeek = await prisma.calendarWeek.findFirst({
    where: {
      academicYear: academicYear.year,
      startDate: {
        lte: new Date(),
      },
      endDate: {
        gte: new Date(),
      },
    },
    include: {
      week: true,
    },
  });

  const t1 = performance.now();

  const programData = await prisma.program.findUnique({
    where: { slug: program },
    select: { id: true },
  });
  const levelData = await prisma.level.findUnique({
    where: { slug: level },
    select: { id: true },
  });

  if (!programData || !levelData)
    return NextResponse.json(
      { message: 'Program or Level not found.' },
      { status: 404 }
    );

  const t2 = performance.now();

  const assignments = await prisma.assignment.findMany({
    where: {
      programId: programData.id,
      levelId: levelData.id,
      weekId: currentWeek?.week.id,
    },
  });

  const t3 = performance.now();

  if (!currentWeek) {
    return NextResponse.json(
      { message: 'No current calendar week found.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    assignments,
    week: currentWeek,
    metrics: {
      fetchCurrentWeekDuration: `${(t1 - t0).toFixed(2)}ms`,
      fetchProgramAndLevel: `${(t2 - t1).toFixed(2)}ms`,
      fetchAssignmentsDuration: `${(t3 - t2).toFixed(2)}ms`,
      totalDuration: `${(t3 - t0).toFixed(2)}ms`,
    },
  });
}

async function main() {
  console.log('🌱 Seeding Calendar Weeks (Native Date)...');

  const weeksToGenerate = 52;
  const academicYear = 2025;

  // 1. Start strictly in UTC.
  // 'Z' at the end forces the parser to treat this as UTC, not local time.
  // Dec 28, 2025 is a Sunday.
  const baseDate = new Date('2025-12-28T00:00:00.000Z');

  const weeksData = [];

  for (let i = 0; i < weeksToGenerate; i++) {
    // A. Calculate Start Date (Sunday 00:00 UTC)
    // We clone baseDate so we don't mutate the original for calculation safety
    const startDate = new Date(baseDate);
    // Add 'i' weeks (i * 7 days)
    startDate.setUTCDate(baseDate.getUTCDate() + i * 7);

    // B. Calculate End Date (Saturday 23:59:59.999 UTC)
    // Clone the calculated startDate
    const endDate = new Date(startDate);
    // Add 6 days to get to Saturday
    endDate.setUTCDate(startDate.getUTCDate() + 6);
    // Set time to the very last millisecond of that day
    endDate.setUTCHours(23, 59, 59, 999);

    weeksData.push({
      weekId: `week-${i + 1}`,
      academicYear,
      startDate: startDate,
      endDate: endDate,
    });
  }

  // 2. Bulk Insert
  await prisma.calendarWeek.createMany({
    data: weeksData,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${weeksData.length} weeks.`);
}
