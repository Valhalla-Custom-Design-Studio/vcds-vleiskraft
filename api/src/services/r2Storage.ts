/**
 * Cloudflare R2 Storage Service
 * Used for: product images, branding assets, voice order audio
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '5aad73a7b1178f7db26f220ec21ac13e';
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'lingering-glade-2094';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://pub-${R2_ACCOUNT_ID}.r2.dev`;

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

/**
 * Upload a buffer directly to R2
 */
export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string,
  isPublic = false
): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: isPublic ? 'public-read' : 'private',
  }));
  return isPublic ? `${R2_PUBLIC_URL}/${key}` : key;
}

/**
 * Generate a presigned upload URL (client uploads directly to R2)
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn }
  );
}

/**
 * Generate a presigned download URL
 */
export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
    { expiresIn }
  );
}

/**
 * Delete an object from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

/**
 * Get public URL for a public object
 */
export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}
