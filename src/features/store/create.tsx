"use client";

import { useActionState, useState } from "react";
import { createStore, StoreState } from "./action";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FieldGroup,
  FieldSet,
  Field,
  FieldLabel,
  FieldSeparator,
  FieldDescription,
} from "@/components/ui/field";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { storeTypeValues } from "@/lib/db/schema";
import { STORE_TYPE_MAP } from "@/lib/type";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ja } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { resizeImageToWebP } from "@/lib/resize-image";

interface CreateStoreProps {
  eventId: string;
}

const INITIAL_STATE: StoreState = {
  slug: "",
  name: "",
  storeType: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function CreateStore({ eventId }: CreateStoreProps) {
  const [state, formAction, isPending] = useActionState(
    createStore,
    INITIAL_STATE,
  );
  const [startedAtDate, setStartedAtDate] = useState<Date | null>(null);
  const [startedAtTime, setStartedAtTime] = useState<string>("");
  const [finishedAtDate, setFinishedAtDate] = useState<Date | null>(null);
  const [finishedAtTime, setFinishedAtTime] = useState<string>("");
  const [canVoted, setCanVoted] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [apparanceImageUrl, setApparanceImageUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (
    file: File | null,
    target: "image" | "apparance" = "image",
  ) => {
    if (!file) return;

    setUploadError(null);
    setIsUploadingImage(true);

    try {
      const RESOLUTIONS = [640, 1024, 1600] as const;
      const uploadFormData = new FormData();
      uploadFormData.append("originalName", file.name);

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

      if (target === "image") setImageUrl(result.url);
      else setApparanceImageUrl(result.url);
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
        <CardTitle>店舗を作成</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>識別名</FieldLabel>
                  <FieldDescription>
                    組織のURLに使用される文字列です（重複不可）。小文字英数字とハイフンのみの8~16字で設定してください。後から変更することはできません。
                  </FieldDescription>
                  <Input
                    name="slug"
                    defaultValue={state.slug}
                    disabled={isPending}
                    required
                  />
                  <FieldError message={state.zodErrors?.slug?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>店舗名</FieldLabel>
                  <Input
                    name="name"
                    defaultValue={state.name}
                    disabled={isPending}
                    maxLength={60}
                    required
                  />
                  <FieldError message={state.zodErrors?.name?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>出店場所</FieldLabel>
                  <Input
                    name="place"
                    defaultValue={state.place}
                    disabled={isPending}
                    maxLength={100}
                  />
                  <FieldError message={state.zodErrors?.place?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>店舗の種類</FieldLabel>
                  <Select
                    name="storeType"
                    required
                    disabled={isPending}
                    defaultValue={state.storeType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="店舗の種類を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {storeTypeValues.map((type) => (
                          <SelectItem key={type} value={type}>
                            {(
                              STORE_TYPE_MAP as Record<
                                string,
                                { label: string }
                              >
                            )[type]?.label ?? type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError message={state.zodErrors?.storeType?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>ポスター画像</FieldLabel>
                  <div className="space-y-3">
                    {imageUrl ? (
                      <div className="relative h-52 w-full max-w-xl overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={imageUrl}
                          alt="ポスター画像プレビュー"
                          fill
                          sizes="(max-width: 768px) 100vw, 640px"
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        ポスター画像が未設定です
                      </p>
                    )}

                    <Input
                      type="file"
                      accept="image/*"
                      disabled={isPending || isUploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        void handleImageUpload(file, "image");
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
                  <FieldLabel>外観画像</FieldLabel>
                  <div className="space-y-3">
                    {apparanceImageUrl ? (
                      <div className="relative h-52 w-full max-w-xl overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={apparanceImageUrl}
                          alt="外観画像プレビュー"
                          fill
                          sizes="(max-width: 768px) 100vw, 640px"
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        外観画像が未設定です
                      </p>
                    )}

                    <Input
                      type="file"
                      accept="image/*"
                      disabled={isPending || isUploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        void handleImageUpload(file, "apparance");
                      }}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          isPending || isUploadingImage || !apparanceImageUrl
                        }
                        onClick={() => setApparanceImageUrl("")}
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
                    <FieldError
                      message={state.zodErrors?.apparanceImageUrl?.[0]}
                    />
                  </div>
                </Field>
                <Field>
                  <FieldLabel>開催日</FieldLabel>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <DatePicker
                        selected={startedAtDate}
                        onChange={(date: Date | null) => setStartedAtDate(date)}
                        dateFormat="yyyy/MM/dd"
                        disabled={isPending}
                        locale={ja}
                        className="w-full border px-3 py-2"
                        placeholderText="開始日を選択"
                      />
                      <input
                        type="hidden"
                        name="startedAtDate"
                        value={startedAtDate ? startedAtDate.toISOString() : ""}
                      />
                    </div>
                    <span>〜</span>
                    <div className="flex-1">
                      <DatePicker
                        selected={finishedAtDate}
                        onChange={(date: Date | null) =>
                          setStartedAtDate(date)
                        }
                        dateFormat="yyyy/MM/dd"
                        disabled={isPending}
                        locale={ja}
                        className="w-full border px-3 py-2"
                        placeholderText="終了日を選択"
                      />
                      <input
                        type="hidden"
                        name="finishedAtDate"
                        value={
                          finishedAtDate ? finishedAtDate.toISOString() : ""
                        }
                      />
                    </div>
                  </div>
                  <FieldError
                    message={
                      state.zodErrors?.startedAtDate?.[0] ||
                      state.zodErrors?.finishedAtDate?.[0]
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>開催時間</FieldLabel>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={startedAtTime}
                        onChange={(e) => setStartedAtTime(e.target.value)}
                        disabled={isPending}
                        name="startedAtTime"
                      />
                    </div>
                    <span>〜</span>
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={finishedAtTime}
                        onChange={(e) => setFinishedAtTime(e.target.value)}
                        disabled={isPending}
                        name="finishedAtTime"
                      />
                    </div>
                  </div>
                  <FieldError
                    message={
                      state.zodErrors?.startedAtTime?.[0] ||
                      state.zodErrors?.finishedAtTime?.[0]
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>詳細</FieldLabel>
                  <Textarea
                    name="description"
                    disabled={isPending}
                    maxLength={60}
                  />
                  <FieldError message={state.zodErrors?.description?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>投票可能か</FieldLabel>
                  <Switch
                    disabled={isPending}
                    checked={canVoted}
                    onCheckedChange={setCanVoted}
                  />
                  <FieldError message={state.zodErrors?.canVoted?.[0]} />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
          </FieldGroup>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="imageUrl" value={imageUrl} />
          <input
            type="hidden"
            name="apparanceImageUrl"
            value={apparanceImageUrl}
          />
          <input
            type="hidden"
            name="canVoted"
            value={canVoted ? "true" : "false"}
          />
          <Button
            type="submit"
            variant="card"
            className="mt-4"
            disabled={isPending}
          >
            {isPending ? "作成中..." : "店舗を作成"}
          </Button>
        </form>
        {state.success && <MessagePrompt message={state.message} />}
        {!state.success && state.message && (
          <ErrorPrompt error={state.message} />
        )}
        {state?.success && (
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            別の店舗を作成
          </Button>
        )}
      </CardContent>
    </Card>
  );
}