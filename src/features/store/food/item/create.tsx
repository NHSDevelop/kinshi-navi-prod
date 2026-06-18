"use client";

import { useActionState } from "react";
import { useState } from "react";
import { createItem, ItemState } from "./action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { resizeImageToWebP } from "@/lib/resize-image";

interface CreateItemProps {
  foodId: string;
}

const INITIAL_STATE: ItemState = {
  name: "",
  price: "",
  imageUrl: "",
  description: "",
  zodErrors: null,
  message: null,
  success: false,
};

export function CreateItem({ foodId }: CreateItemProps) {
  const [state, formAction, isPending] = useActionState(
    createItem,
    INITIAL_STATE,
  );
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    setUploadError(null);
    setIsUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("originalName", file.name);

      const RESOLUTIONS = [640, 1024, 1600] as const;
      for (const width of RESOLUTIONS) {
        const webpBlob = await resizeImageToWebP(file, width);
        uploadFormData.append(`image_${width}`, webpBlob, `${width}.webp`);
      }

      const response = await fetch("/api/uploads/image", {
        method: "POST",
        body: uploadFormData,
      });

      const result = (await response.json()) as {
        url?: string;
        error?: string;
        message?: string;
      };
      if (!response.ok || !result.url) {
        throw new Error(
          result.error ?? result.message ?? "画像のアップロードに失敗しました",
        );
      }

      setImageUrl(result.url);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "画像のアップロードに失敗しました",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>商品を登録</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel>商品名</FieldLabel>
                <Input
                  name="name"
                  required
                  disabled={isPending}
                  defaultValue={state.name}
                />
                <FieldError message={state.zodErrors?.name?.[0]} />
              </Field>
              <Field>
                <FieldLabel>価格（円）</FieldLabel>
                <Input
                  name="price"
                  type="number"
                  required
                  disabled={isPending}
                  defaultValue={state.price}
                />
                <FieldError message={state.zodErrors?.price?.[0]} />
              </Field>
              <Field>
                <FieldLabel>商品画像</FieldLabel>
                <div className="space-y-3">
                  {imageUrl ? (
                    <div className="relative h-52 w-full max-w-xl overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={imageUrl}
                        alt="商品画像プレビュー"
                        fill
                        sizes="(max-width: 768px) 100vw, 640px"
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      画像が未設定です
                    </p>
                  )}

                  <Input
                    type="file"
                    accept="image/*"
                    disabled={isPending || isUploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      void handleImageUpload(file);
                    }}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending || isUploadingImage || !imageUrl}
                      onClick={() => setImageUrl("")}
                    >
                      画像を削除
                    </Button>
                    {isUploadingImage && (
                      <p className="text-sm text-muted-foreground">
                        アップロード中...
                      </p>
                    )}
                  </div>

                  {uploadError && <ErrorPrompt error={uploadError} />}
                  <FieldError message={state.zodErrors?.imageUrl?.[0]} />
                </div>
              </Field>
              <Field>
                <FieldLabel>詳細</FieldLabel>
                <Textarea name="description" disabled={isPending} />
                <FieldError message={state.zodErrors?.description?.[0]} />
              </Field>
            </FieldSet>
            <FieldSeparator />
            <input type="hidden" name="foodId" value={foodId} />
            <input type="hidden" name="imageUrl" value={imageUrl} />
          </FieldGroup>
          <Button
            type="submit"
            variant="card"
            className="mt-4"
            disabled={isPending}
          >
            {isPending ? "登録中..." : "商品を登録"}
          </Button>
        </form>

        {state.success && <MessagePrompt message={state.message} />}
        {!state.success && state.message && (
          <ErrorPrompt error={state.message} />
        )}
        {state?.success && (
          <Button
            onClick={() => {
              router.refresh();
            }}
          >
            別の商品を登録
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
