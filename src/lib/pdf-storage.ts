import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function getPdfStorageClient() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY!,
      secretAccessKey: process.env.R2_SECRET_KEY!,
    },
  });
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
  const client = getPdfStorageClient();
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeFileName(file.name);
  const key = `pdf-documents/${Date.now()}-${createId()}-${safeName}.pdf`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: "application/pdf",
      Body: fileBuffer,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    fileKey: key,
    fileUrl: `${process.env.R2_BUCKET_URL}/${key}`,
    fileName: file.name,
    mimeType: "application/pdf",
    fileSize: file.size,
  };
}

export async function deletePdfFile(fileKey: string) {
  try {
    const client = getPdfStorageClient();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileKey,
      }),
    );
  } catch (error) {
    console.error("Failed to delete pdf file from R2:", error);
  }
}
