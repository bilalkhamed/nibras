import getAuthSession from '@/lib/server/auth-session';
import { S3 } from '@/lib/server/s3-client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // if (session.role !== Role.admin) {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

  try {
    const body = await req.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 },
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    await S3.send(command);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting file' }, { status: 500 });
  }
}
