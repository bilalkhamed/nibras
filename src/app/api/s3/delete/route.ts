import getAuthSession from '@/lib/server/auth-session';
import { S3, PublicS3 } from '@/lib/server/s3-client';
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
    const { key, public: isPublic } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 },
      );
    }

    // Use appropriate S3 client and bucket based on public flag
    const s3Client = isPublic ? PublicS3 : S3;
    const bucket = isPublic
      ? process.env.PUBLIC_AWS_BUCKET_NAME
      : process.env.S3_BUCKET_NAME;

    const command = new DeleteObjectCommand({
      Bucket: bucket!,
      Key: key,
    });

    await s3Client.send(command);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting file' }, { status: 500 });
  }
}
