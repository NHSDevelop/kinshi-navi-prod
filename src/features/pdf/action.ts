"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

import { canManagePdfDocuments, getAuthenticatedUser } from "@/lib/auth-guard";
import { getDb } from "@/lib/db/drizzle";
import { pdfDocuments } from "@/lib/db/schema";
import {
  deletePdfFile,
  getMaxPdfFileSize,
  isPdfFile,
  validatePdfFileSize,
  uploadPdfFile,
} from "@/lib/pdf-storage";

const PDF_MANAGEMENT_PATH = "/dashboard/pdf-documents";
const PDF_PUBLIC_LIST_PATH = "/pdf-documents";

const pdfDocumentSchema = z.object({
  title: z.string().trim().min(1, "必須項目です"),
  description: z.string().nullable(),
  isPublished: z.boolean(),
});

export type PdfDocumentZodErrors = {
  title?: string[];
  description?: string[];
  pdfFileData?: string[];
  isPublished?: string[];
} | null;

export type PdfDocumentState = {
  title?: string;
  description?: string;
  isPublished?: boolean;
  zodErrors?: PdfDocumentZodErrors;
  message?: string | null;
  success?: boolean;
  publicUrl?: string;
};

export type UpdatePdfDocumentState = {
  pdfDocumentId?: string;
  title?: string;
  description?: string;
  isPublished?: boolean;
  zodErrors?: PdfDocumentZodErrors;
  message?: string | null;
  error?: string | null;
  success?: boolean;
  publicUrl?: string;
};

function parseDescription(formData: FormData) {
  const description = formData.get("description");

  if (typeof description !== "string") {
    return null;
  }

  const trimmedDescription = description.trim();

  return trimmedDescription.length > 0 ? trimmedDescription : null;
}

function parseIsPublished(formData: FormData) {
  return formData.get("isPublished") === "on";
}

function getPdfFile(formData: FormData) {
  const file = formData.get("pdfFileData");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

function validatePdfUploadFile(file: File) {
  if (!isPdfFile(file)) {
    return "PDFファイルを選択してください。";
  }

  if (!validatePdfFileSize(file)) {
    return `ファイルサイズが大きすぎます。${Math.round(getMaxPdfFileSize() / (1024 * 1024))}MB以下にしてください。`;
  }

  return null;
}

export async function createPdfDocument(
  prevState: unknown,
  formData: FormData,
): Promise<PdfDocumentState> {
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.isAnonymous) {
      return {
        zodErrors: null,
        message: "ログインが必要です。",
        success: false,
      };
    }

    if (!(await canManagePdfDocuments(user.id))) {
      return {
        zodErrors: null,
        message: "権限がありません。",
        success: false,
      };
    }

    const validationResult = pdfDocumentSchema.safeParse({
      title: formData.get("title"),
      description: parseDescription(formData),
      isPublished: parseIsPublished(formData),
    });

    const pdfFileData = getPdfFile(formData);

    if (!validationResult.success || !pdfFileData) {
      const pdfFileError = !pdfFileData
        ? ["PDFファイルを選択してください。"]
        : validatePdfUploadFile(pdfFileData)
          ? [validatePdfUploadFile(pdfFileData)!]
          : undefined;

      return {
        title: (formData.get("title") as string) || "",
        description: parseDescription(formData) ?? "",
        isPublished: parseIsPublished(formData),
        zodErrors: {
          ...(validationResult.success
            ? {}
            : validationResult.error.flatten().fieldErrors),
          pdfFileData: pdfFileError,
        },
        message: "入力形式が正しくありません。",
        success: false,
      };
    }

    const uploadError = validatePdfUploadFile(pdfFileData);

    if (uploadError) {
      return {
        title: (formData.get("title") as string) || "",
        description: parseDescription(formData) ?? "",
        isPublished: parseIsPublished(formData),
        zodErrors: {
          title: undefined,
          description: undefined,
          pdfFileData: [uploadError],
          isPublished: undefined,
        },
        message: "入力形式が正しくありません。",
        success: false,
      };
    }

    const { title, description, isPublished } = validationResult.data;
    const uploadedPdf = await uploadPdfFile(pdfFileData);
    const db = await getDb();

    const insertedRows = await db
      .insert(pdfDocuments)
      .values({
        title,
        description,
        fileUrl: uploadedPdf.fileUrl,
        fileKey: uploadedPdf.fileKey,
        fileName: uploadedPdf.fileName,
        mimeType: uploadedPdf.mimeType,
        fileSize: uploadedPdf.fileSize,
        isPublished,
      })
      .returning({ id: pdfDocuments.id });

    const pdfDocumentId = insertedRows[0]?.id;

    if (pdfDocumentId) {
      revalidatePath(PDF_MANAGEMENT_PATH);
      revalidatePath(PDF_PUBLIC_LIST_PATH);
      revalidatePath(`/pdf-documents/${pdfDocumentId}`);
    }

    return {
      zodErrors: null,
      message: "PDFを登録しました。",
      success: true,
      publicUrl: pdfDocumentId ? `/pdf-documents/${pdfDocumentId}` : undefined,
    };
  } catch (error) {
    console.error(error);
    return {
      zodErrors: null,
      message: "サーバーエラーが発生しました。",
      success: false,
    };
  }
}

export async function updatePdfDocument(
  prevState: unknown,
  formData: FormData,
): Promise<UpdatePdfDocumentState> {
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.isAnonymous) {
      return {
        zodErrors: null,
        message: "ログインが必要です。",
        error: "権限がありません",
        success: false,
      };
    }

    if (!(await canManagePdfDocuments(user.id))) {
      return {
        zodErrors: null,
        message: "権限がありません。",
        error: "権限がありません",
        success: false,
      };
    }

    const validationResult = pdfDocumentSchema.safeParse({
      title: formData.get("title"),
      description: parseDescription(formData),
      isPublished: parseIsPublished(formData),
    });

    if (!validationResult.success) {
      return {
        pdfDocumentId: (formData.get("pdfDocumentId") as string) || "",
        title: (formData.get("title") as string) || "",
        description: parseDescription(formData) ?? "",
        isPublished: parseIsPublished(formData),
        zodErrors: validationResult.error.flatten().fieldErrors,
        message: "入力形式が正しくありません。",
        error: "入力形式が正しくありません",
        success: false,
      };
    }

    const pdfDocumentId = formData.get("pdfDocumentId");
    if (typeof pdfDocumentId !== "string" || pdfDocumentId.length === 0) {
      return {
        zodErrors: null,
        message: "PDFのIDが見つかりません。",
        error: "入力形式が正しくありません",
        success: false,
      };
    }

    const db = await getDb();
    const existingRows = await db
      .select()
      .from(pdfDocuments)
      .where(eq(pdfDocuments.id, pdfDocumentId))
      .limit(1);

    if (existingRows.length === 0) {
      return {
        zodErrors: null,
        message: "PDFが見つかりません。",
        error: "対象データが見つかりません",
        success: false,
      };
    }

    const existingPdf = existingRows[0];
    const replacementFile = getPdfFile(formData);
    let nextFileUrl = existingPdf.fileUrl;
    let nextFileKey = existingPdf.fileKey;
    let nextFileName = existingPdf.fileName;
    let nextMimeType = existingPdf.mimeType;
    let nextFileSize = existingPdf.fileSize;

    if (replacementFile) {
      const uploadError = validatePdfUploadFile(replacementFile);

      if (uploadError) {
        return {
          pdfDocumentId,
          title: (formData.get("title") as string) || "",
          description: parseDescription(formData) ?? "",
          isPublished: parseIsPublished(formData),
          zodErrors: {
            title: undefined,
            description: undefined,
            pdfFileData: [uploadError],
            isPublished: undefined,
          },
          message: "入力形式が正しくありません。",
          error: "入力形式が正しくありません",
          success: false,
        };
      }

      const uploadedPdf = await uploadPdfFile(replacementFile);
      nextFileUrl = uploadedPdf.fileUrl;
      nextFileKey = uploadedPdf.fileKey;
      nextFileName = uploadedPdf.fileName;
      nextMimeType = uploadedPdf.mimeType;
      nextFileSize = uploadedPdf.fileSize;
    }

    await db
      .update(pdfDocuments)
      .set({
        title: validationResult.data.title,
        description: validationResult.data.description,
        isPublished: validationResult.data.isPublished,
        fileUrl: nextFileUrl,
        fileKey: nextFileKey,
        fileName: nextFileName,
        mimeType: nextMimeType,
        fileSize: nextFileSize,
        updatedAt: new Date(),
      })
      .where(eq(pdfDocuments.id, pdfDocumentId));

    if (replacementFile && existingPdf.fileKey !== nextFileKey) {
      await deletePdfFile(existingPdf.fileKey);
    }

    revalidatePath(PDF_MANAGEMENT_PATH);
    revalidatePath(PDF_PUBLIC_LIST_PATH);
    revalidatePath(`/pdf-documents/${pdfDocumentId}`);

    return {
      pdfDocumentId,
      zodErrors: null,
      message: "PDFを更新しました。",
      success: true,
      publicUrl: `/pdf-documents/${pdfDocumentId}`,
    };
  } catch (error) {
    console.error(error);
    return {
      zodErrors: null,
      message: "サーバーエラーが発生しました。",
      error: "サーバーエラーが発生しました。",
      success: false,
    };
  }
}

export async function deletePdfDocument(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.isAnonymous) {
      return;
    }

    if (!(await canManagePdfDocuments(user.id))) {
      return;
    }

    const pdfDocumentId = formData.get("pdfDocumentId");

    if (typeof pdfDocumentId !== "string" || pdfDocumentId.length === 0) {
      return;
    }

    const db = await getDb();
    const existingRows = await db
      .select({ fileKey: pdfDocuments.fileKey })
      .from(pdfDocuments)
      .where(eq(pdfDocuments.id, pdfDocumentId))
      .limit(1);

    if (existingRows.length === 0) {
      return;
    }

    await db.delete(pdfDocuments).where(eq(pdfDocuments.id, pdfDocumentId));

    await deletePdfFile(existingRows[0].fileKey);

    revalidatePath(PDF_MANAGEMENT_PATH);
    revalidatePath(PDF_PUBLIC_LIST_PATH);
    revalidatePath(`/pdf-documents/${pdfDocumentId}`);
    return;
  } catch (error) {
    console.error(error);
    return;
  }
}
