import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createId } from "@paralleldrive/cuid2";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function getPdfPublicBaseUrl() {
  return (process.env.BASE_URL ?? "").replace(/\/$/, "");
}

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();
}

export function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function validatePdfFileSize(file: File) {
  return file.size <= MAX_FILE_SIZE;
}

export function getMaxPdfFileSize() {
  return MAX_FILE_SIZE;
}

export async function uploadPdfFile(file: File) {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeFileName(file.name);
  const key = `pdf-documents/${Date.now()}-${createId()}-${safeName}.pdf`;
  const { env } = await getCloudflareContext({ async: true });

  await env.IMG_BUCKET.put(key, fileBuffer, {
    httpMetadata: {
      contentType: "application/pdf",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  const baseUrl = getPdfPublicBaseUrl();

  return {
    fileKey: key,
    fileUrl: baseUrl ? `${baseUrl}/${key}` : key,
    fileName: file.name,
    mimeType: "application/pdf",
    fileSize: file.size,
  };
}

export async function deletePdfFile(fileKey: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    await env.IMG_BUCKET.delete(fileKey);
  } catch (error) {
    console.error("Failed to delete pdf file from R2:", error);
  }
}
