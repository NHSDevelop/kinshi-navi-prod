"use client";

import { useActionState, useState } from "react";
import { Item } from "@/lib/db/schema";
import { updateItemConfig, UpdateItemConfigState } from "./action";
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
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import Image from "next/image";

type Props = {
  item: Item;
};

const INITIAL_STATE: UpdateItemConfigState = {
  name: "",
  price: "",
  imageUrl: "",
  description: "",
  zodErrors: null,
  message: null,
  error: null,
  success: false,
};

export default function UpdateItemForm({ item }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateItemConfig,
    INITIAL_STATE,
  );
  const [imageUrl, setImageUrl] = useState<string>(item.imageUrl ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    setUploadError(null);
    setIsUploadingImage(true);

    try {
      const data = new FormData();
      data.append("imageFileData", file);

      const response = await fetch("/api/uploads/image", {
        method: "POST",
        body: data,
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
        <CardTitle>商品情報の編集</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>商品名</FieldLabel>
                  <Input
                    name="name"
                    required
                    disabled={isPending}
                    defaultValue={state.name || item.name}
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
                    defaultValue={state.price || String(item.price)}
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
                          loading="eager"
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
                  <Textarea
                    name="description"
                    disabled={isPending}
                    defaultValue={state.description || item.description || ""}
                  />
                  <FieldError message={state.zodErrors?.description?.[0]} />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="imageUrl" value={imageUrl} />
          </FieldGroup>
          <Button
            type="submit"
            variant="card"
            className="mt-4"
            disabled={isPending}
          >
            {isPending ? "反映中..." : "変更を反映"}
          </Button>
        </form>

        <div className="space-y-4 lg:space-y-8">
          {state?.message && <MessagePrompt message={state.message} />}
          {state?.error && <ErrorPrompt error={state.error} />}
        </div>
      </CardContent>
    </Card>
  );
}
