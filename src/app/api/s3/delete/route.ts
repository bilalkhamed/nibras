import { S3 } from '@/lib/server/s3-client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
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
