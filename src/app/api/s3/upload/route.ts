import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3, PublicS3 } from '@/lib/server/s3-client';

const uploadRequestSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  size: z.number().max(10 * 1024 * 1024), // 10 MB
  public: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { success, data } = uploadRequestSchema.safeParse(body);
    if (!success) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    const { fileName, contentType, size, public: isPublic } = data;

    const SEPARATOR = '__uuid_end__';
    const uniqueKey = `${crypto.randomUUID()}${SEPARATOR}${fileName}`;

    // Use appropriate S3 client and bucket based on public flag
    const s3Client = isPublic ? PublicS3 : S3;
    const bucket = isPublic
      ? process.env.PUBLIC_AWS_BUCKET_NAME
      : process.env.S3_BUCKET_NAME;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: uniqueKey,
      ContentType: contentType,
      ContentLength: size,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 360, // 6 mins
    });

    const response = {
      presignedUrl,
      key: uniqueKey,
      public: isPublic,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
