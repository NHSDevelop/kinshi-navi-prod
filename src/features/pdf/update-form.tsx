"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FileText, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { MessagePrompt } from "@/components/prompt/message-prompt";

import { PdfDocument } from "@/lib/db/schema";

import { updatePdfDocument, UpdatePdfDocumentState } from "./action";

type UpdatePdfDocumentFormProps = {
  pdfDocument: PdfDocument;
};

const INITIAL_STATE: UpdatePdfDocumentState = {
  pdfDocumentId: "",
  title: "",
  description: "",
  isPublished: true,
  zodErrors: null,
  message: null,
  error: null,
  success: false,
};

export default function UpdatePdfDocumentForm({
  pdfDocument,
}: UpdatePdfDocumentFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePdfDocument,
    INITIAL_STATE,
  );

  const publicUrl = state.publicUrl ?? `/pdf-documents/${pdfDocument.id}`;

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="space-y-4"
    >
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel>タイトル</FieldLabel>
            <Input
              name="title"
              required
              disabled={isPending}
              defaultValue={state.title || pdfDocument.title}
              placeholder="PDFの表示名を入力"
            />
            <FieldError message={state.zodErrors?.title?.[0]} />
          </Field>
          <Field>
            <FieldLabel>説明</FieldLabel>
            <Textarea
              name="description"
              disabled={isPending}
              defaultValue={state.description ?? pdfDocument.description ?? ""}
              placeholder="任意の補足説明を入力"
            />
            <FieldDescription>
              公開ページでタイトル下に表示します。
            </FieldDescription>
            <FieldError message={state.zodErrors?.description?.[0]} />
          </Field>
          <Field>
            <FieldLabel>PDFファイルを差し替える</FieldLabel>
            <div className="space-y-3">
              <div className="rounded-2xl border border-main-200 bg-main-50/60 p-4 text-sm text-main-950">
                <p className="font-medium">現在のファイル</p>
                <p className="mt-1 text-muted-foreground">
                  {pdfDocument.fileName} ・{" "}
                  {Math.round(pdfDocument.fileSize / 1024)}KB
                </p>
                <Link
                  href={publicUrl}
                  className="mt-2 inline-flex items-center gap-2 underline"
                >
                  <FileText className="size-4" />
                  公開ページを確認
                </Link>
              </div>
              <Input
                type="file"
                name="pdfFileData"
                accept="application/pdf"
                disabled={isPending}
              />
              <FieldDescription>
                新しいファイルを選ぶと差し替えます。未選択なら現在のファイルを保持します。
              </FieldDescription>
              <FieldError message={state.zodErrors?.pdfFileData?.[0]} />
            </div>
          </Field>
          <Field>
            <FieldContent>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="isPublished"
                  name="isPublished"
                  defaultChecked={state.isPublished ?? pdfDocument.isPublished}
                  disabled={isPending}
                />
                <div>
                  <FieldLabel htmlFor="isPublished">公開する</FieldLabel>
                  <FieldDescription>
                    オフにすると公開ページでは表示されません。
                  </FieldDescription>
                </div>
              </div>
            </FieldContent>
            <FieldError message={state.zodErrors?.isPublished?.[0]} />
          </Field>
        </FieldSet>
        <FieldSeparator />
      </FieldGroup>

      <input type="hidden" name="pdfDocumentId" value={pdfDocument.id} />

      <Button
        type="submit"
        variant="card"
        className="mt-2 w-full sm:w-auto"
        disabled={isPending}
      >
        <UploadCloud className="size-4" />
        {isPending ? "更新中..." : "変更を保存"}
      </Button>

      <div className="space-y-4">
        {state?.success && state.publicUrl ? (
          <MessagePrompt
            message={
              <div className="space-y-2">
                <p>{state.message}</p>
                <Link
                  href={state.publicUrl}
                  className="inline-flex items-center gap-2 underline"
                >
                  <FileText className="size-4" />
                  公開ページを開く
                </Link>
              </div>
            }
          />
        ) : null}
        {!state?.success && state?.message ? (
          <ErrorPrompt error={state.message} />
        ) : null}
        {state?.error ? <ErrorPrompt error={state.error} /> : null}
      </div>
    </form>
  );
}
