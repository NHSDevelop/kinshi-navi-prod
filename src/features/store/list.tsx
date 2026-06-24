"use client";

import { useActionState, useEffect, useRef, startTransition } from "react";
import { getStoresInMainEvent } from "./action";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
} from "@/components/ui/select";
import { storeTypeValues, type Store } from "@/lib/db/schema";
import { FormState, STORE_TYPE_MAP } from "@/lib/type";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { LoadingPrompt } from "@/components/prompt/loading-prompt";

const initialState: FormState<Store[]> = {
  success: false,
  message: null,
  error: null,
  data: [],
};

const MAX_NAME_LENGTH = 10;

export default function StoreList() {
  const router = useRouter();
  const hasFetchedInitial = useRef(false);
  const [state, formAction, isPending] = useActionState<
    FormState<Store[]>,
    FormData
  >(getStoresInMainEvent, initialState);

  useEffect(() => {
    if (hasFetchedInitial.current) return;
    hasFetchedInitial.current = true;

    const formData = new FormData();
    formData.set("storeType", "all");

    startTransition(() => {
      formAction(formData);
    });
  }, [formAction]);

  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="space-y-4 lg:space-y-8">
        <p className="text-lg font-bold">店舗を絞り込む</p>
        <form action={formAction} className="flex gap-4">
          <Field>
            <Select name="storeType" disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="店舗の種類を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">すべて</SelectItem>
                  {storeTypeValues.map((type) => {
                    const storeTypeLabel =
                      STORE_TYPE_MAP[type as keyof typeof STORE_TYPE_MAP]
                        ?.label ?? type;
                    return (
                      <SelectItem key={type} value={type}>
                        {storeTypeLabel}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Button type="submit">絞り込む</Button>
        </form>
      </div>
      <Separator />
      <Suspense fallback={<LoadingPrompt context="店舗の一覧" />}>
        {state?.data && state.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>店舗名</TableHead>
                <TableHead>店舗の種類</TableHead>
                <TableHead>場所</TableHead>
                <TableHead>状態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.data.map((store) => {
                const storeType =
                  STORE_TYPE_MAP[store.storeType as keyof typeof STORE_TYPE_MAP]
                    ?.label ?? store.storeType;

                const truncatedName =
                  store.name.length > MAX_NAME_LENGTH
                    ? `${store.name.slice(0, MAX_NAME_LENGTH)}...`
                    : store.name;

                return (
                  <TableRow
                    key={store.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/store/${store.slug}`)}
                  >
                    <TableCell className="font-semibold md:text-lg">
                      <span title={store.name}>{truncatedName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className="text-sm">
                        {store.place ?? "未設定"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="text-sm">{storeType}</Badge>
                    </TableCell>
                    <TableCell>
                      {store.isActive ? (
                        <Badge variant="success" className="text-sm">
                          開催中
                        </Badge>
                      ) : (
                        <Badge variant="danger" className="text-sm">
                          停止中
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <NotFoundPrompt context="店舗" />
        )}
      </Suspense>
    </div>
  );
}
