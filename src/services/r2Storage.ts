/**
 * Cloudflare R2 image upload service
 * Uses presigned URLs from the API — never exposes R2 credentials to the client
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://vleiskraft-api.onrender.com';

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a local file URI to R2 via presigned URL
 */
export async function uploadToR2(
  localUri: string,
  folder: 'products' | 'social' | 'diary' | 'branding' | 'carcass',
  token: string,
): Promise<UploadResult> {
  const filename = localUri.split('/').pop() ?? `upload_${Date.now()}.jpg`;
  const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

  // 1. Get presigned URL from API
  const presignRes = await fetch(`${API_BASE}/api/upload/presigned`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fileName: `${folder}/${filename}`, contentType, isPublic: true }),
  });
  if (!presignRes.ok) throw new Error('Failed to get presigned URL');
  const { uploadUrl, publicUrl, key } = await presignRes.json();

  // 2. Upload directly to R2
  const blob = await (await fetch(localUri)).blob();
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!uploadRes.ok) throw new Error('R2 upload failed');

  return { url: publicUrl, key };
}

/**
 * Delete a file from R2 via API
 */
export async function deleteFromR2(key: string, token: string): Promise<void> {
  await fetch(`${API_BASE}/api/upload/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
