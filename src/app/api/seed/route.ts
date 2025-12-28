import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/server/prisma';
import { Prisma } from '@prisma/client';

export async function POST() {
  try {
    const t0 = performance.now();

    const levels = await prisma.level.createMany({
      data: [
        { number: 1, title: 'المستوى الأول' },
        { number: 2, title: 'المستوى الثاني' },
        { number: 3, title: 'المستوى الثالث' },
        { number: 4, title: 'المستوى الرابع' },
      ],
    });

    const t1 = performance.now();

    return NextResponse.json({
      message: `Created ${levels.count} in ${(t1 - t0).toFixed(
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
