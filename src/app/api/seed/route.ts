import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/server/prisma';
import { Prisma } from '@prisma/client';

export async function POST() {
  try {
    const t0 = performance.now();

    const weeksData: Prisma.WeekCreateManyInput[] = [
      {
        number: 1,
        title: 'الأسبوع الأول',
      },
      {
        number: 2,
        title: 'الأسبوع الثاني',
      },
      {
        number: 3,
        title: 'الأسبوع الثالث',
      },
      {
        number: 4,
        title: 'الأسبوع الرابع',
      },
      {
        number: 5,
        title: 'الأسبوع الخامس',
      },
      {
        number: 6,
        title: 'الأسبوع السادس',
      },
      {
        number: 7,
        title: 'الأسبوع السابع',
      },
      {
        number: 8,
        title: 'الأسبوع الثامن',
      },
    ];
    const weeks = await prisma.week.createMany({
      data: weeksData,
    });

    const t1 = performance.now();

    return NextResponse.json({
      message: `Created ${weeks.count} in ${(t1 - t0).toFixed(
        2
      )} milliseconds.`,
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'An error occurred while seeding data.', error },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const t0 = performance.now();

  const cohorts = await prisma.cohort.findMany({
    include: {
      currentLevel: true,
      entryLevel: true,
    },
  });

  const t1 = performance.now();

  return NextResponse.json({
    data: cohorts,
    message: `Fetched ${cohorts.length} cohorts in ${(t1 - t0).toFixed(
      2
    )} milliseconds.`,
  });
}
