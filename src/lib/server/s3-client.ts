import { S3Client } from '@aws-sdk/client-s3';

/**
 * Private S3 client for authenticated file access
 * Uses signed URLs for secure file operations
 */
export const S3 = new S3Client({
  region: process.env.AWS_REGION ?? 'auto',
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Public S3 client for publicly accessible files (e.g., article cover images)
 * Files uploaded with this client are publicly accessible without signed URLs
 */
export const PublicS3 = new S3Client({
  region: process.env.PUBLIC_AWS_REGION ?? 'auto',
  endpoint: process.env.PUBLIC_AWS_ENDPOINT_URL_S3,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Get the public URL for a file in the public S3 bucket
 * Uses subdomain-style URL for Tigris: https://<bucket>.t3.storage.dev/<key>
 */
export function getPublicS3Url(key: string): string {
  const bucket = process.env.PUBLIC_AWS_BUCKET_NAME;
  // For Tigris, use subdomain-style URL: https://<bucket>.t3.storage.dev/<key>
  return `https://${bucket}.t3.storage.dev/${key}`;
}
