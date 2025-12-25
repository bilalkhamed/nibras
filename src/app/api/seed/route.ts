import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST() {
  try {
    const t0 = performance.now();

    const rows = Array.from(countries.entries()).map(
      ([name, code]) => Prisma.sql`(${name}, ${code})`
    );

    const result = await prisma.$executeRaw(Prisma.sql`UPDATE "users" as u
    SET country = c.code
    FROM (VALUES ${Prisma.join(rows)}) AS c(name, code)
    WHERE u.country = c.name`);

    const t1 = performance.now();

    return NextResponse.json({
      message: `Updated ${result} users' countries in ${(t1 - t0).toFixed(
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

const countries = new Map([
  ['jordan', 'JO'],
  ['iraq', 'IQ'],
  ['lebanon', 'LB'],
  ['tunisia', 'TN'],
  ['yemen', 'YE'],
  ['saudi arabia', 'SA'],
  ['syria', 'SY'],
  ['morocco', 'MA'],
  ['algeria', 'DZ'],
  ['palestine', 'PS'],
  ['egypt', 'EG'],
  ['united arab emirates', 'AE'],
]);
