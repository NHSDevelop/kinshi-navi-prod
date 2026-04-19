"use client";

import { useActionState, useEffect, useRef, startTransition } from "react";
import { getStoresByFormByEventSlug } from "./action";
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
import Link from "next/link";

const initialState: FormState<Store[]> = {
  success: false,
  message: null,
  error: null,
  data: [],
};

export default function StoreList() {
  const hasFetchedInitial = useRef(false);
  const [state, formAction, isPending] = useActionState<
    FormState<Store[]>,
    FormData
  >(getStoresByFormByEventSlug, initialState);

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

      {state?.data && state.data.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>店舗名</TableHead>
              <TableHead>店舗の種類</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>店舗ページ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.data.map((store) => {
              const storeType =
                STORE_TYPE_MAP[store.storeType as keyof typeof STORE_TYPE_MAP]
                  ?.label ?? store.storeType;
              return (
                <TableRow key={store.id}>
                  <TableCell className="font-semibold md:text-lg">
                    {store.name}
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
                  <TableCell>
                    <Button asChild variant="card">
                      <Link href={`/store/${store.slug}`}>店舗ページ</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <NotFoundPrompt context="店舗" />
      )}
    </div>
  );
}
