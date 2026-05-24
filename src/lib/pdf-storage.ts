import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createId } from "@paralleldrive/cuid2";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function getPdfPublicBaseUrl() {
  return (process.env.R2_BUCKET_URL ?? "").replace(/\/$/, "");
}

function buildPdfPublicUrl(key: string) {
  const baseUrl = getPdfPublicBaseUrl();

  if (!baseUrl) {
    return key;
  }

  const normalizedKey = key.replace(/^\/+/, "");

  try {
    const parsedBaseUrl = new URL(baseUrl);
    const basePath = parsedBaseUrl.pathname.replace(/\/$/, "");

    if (basePath && basePath !== "/") {
      const keyPrefix = normalizedKey.split("/")[0] ?? "";

      if (basePath === `/${keyPrefix}`) {
        const rest = normalizedKey.slice(keyPrefix.length + 1);
        return `${parsedBaseUrl.origin}${basePath}/${rest}`;
      }

      return `${parsedBaseUrl.origin}${basePath}/${normalizedKey}`;
    }

    return `${parsedBaseUrl.origin}/${normalizedKey}`;
  } catch {
    return `${baseUrl}/${normalizedKey}`;
  }
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

  return {
    fileKey: key,
    fileUrl: buildPdfPublicUrl(key),
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
