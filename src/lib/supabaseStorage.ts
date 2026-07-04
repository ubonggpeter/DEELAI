/**
 * Lightweight Supabase Storage uploader — no SDK needed.
 * Uses the REST API with the service role key for server-side uploads.
 */

export async function uploadToSupabase(
  bucket: string,
  path: string,
  file: File,
  contentType: string,
): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not configured");

  const body = await file.arrayBuffer();

  const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "apikey": key,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase upload failed: ${err}`);
  }

  // Public URL format
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}
