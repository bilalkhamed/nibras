import getAuthSession from '@/lib/server/auth-session';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { S3, PublicS3, getPublicS3Url } from '@/lib/server/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  let body: { key: string; public?: boolean };
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { key, public: isPublic } = body;

  if (!key) {
    return NextResponse.json(
      { success: false, error: 'Missing S3 key' },
      { status: 400 },
    );
  }

  try {
    // For public bucket, return the direct public URL (no signing needed)
    if (isPublic) {
      const url = getPublicS3Url(key);
      return NextResponse.json({ success: true, url });
    }

    // For private bucket, generate a signed URL
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    const url = await getSignedUrl(S3, command, { expiresIn: 60 * 5 }); // URL valid for 5 minutes

    return NextResponse.json({ success: true, url });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to perform S3 operation' },
      { status: 500 },
    );
  }
}
