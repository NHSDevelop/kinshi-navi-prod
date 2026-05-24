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

import { createPdfDocument, PdfDocumentState } from "./action";

const INITIAL_STATE: PdfDocumentState = {
  title: "",
  description: "",
  isPublished: true,
  zodErrors: null,
  message: null,
  success: false,
};

export default function CreatePdfDocumentForm() {
  const [state, formAction, isPending] = useActionState(
    createPdfDocument,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel>タイトル</FieldLabel>
            <Input
              name="title"
              required
              disabled={isPending}
              defaultValue={state.title}
              placeholder="PDFの表示名を入力"
            />
            <FieldError message={state.zodErrors?.title?.[0]} />
          </Field>
          <Field>
            <FieldLabel>説明</FieldLabel>
            <Textarea
              name="description"
              disabled={isPending}
              defaultValue={state.description}
              placeholder="任意の補足説明を入力"
            />
            <FieldDescription>
              公開ページでタイトル下に表示します。
            </FieldDescription>
            <FieldError message={state.zodErrors?.description?.[0]} />
          </Field>
          <Field>
            <FieldLabel>PDFファイル</FieldLabel>
            <Input
              type="file"
              name="pdfFileData"
              accept="application/pdf"
              required
              disabled={isPending}
            />
            <FieldDescription>
              25MB以下のPDFのみアップロードできます。
            </FieldDescription>
            <FieldError message={state.zodErrors?.pdfFileData?.[0]} />
          </Field>
          <Field>
            <FieldContent>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="isPublished"
                  name="isPublished"
                  defaultChecked={state.isPublished ?? true}
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

      <Button
        type="submit"
        variant="card"
        className="mt-2 w-full sm:w-auto"
        disabled={isPending}
      >
        <UploadCloud className="size-4" />
        {isPending ? "アップロード中..." : "PDFをアップロード"}
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
      </div>
    </form>
  );
}
