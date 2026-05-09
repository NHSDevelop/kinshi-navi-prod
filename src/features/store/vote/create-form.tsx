"use client";

import { Store, StoreType } from "@/lib/db/schema";
import { useActionState, useState } from "react";
import Image from "next/image";
import { createStoreVote } from "./action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";

type Props = {
  stores: Store[];
  storeType: StoreType;
};

export default function CreateStoreVoteForm({ stores, storeType }: Props) {
  const [state, formAction, isPending] = useActionState(createStoreVote, null);
  const [chosenStoreId, setChosenStoreId] = useState<string>("");
  const [chosenStoreName, setChosenStorename] = useState<string>("");
  const [chosenStoreImageUrl, setChosenStoreImageUrl] = useState<string>("");
  const filterdStores = stores.filter((store) => store.storeType === storeType);

  const handleClick = (store: Store) => {
    setChosenStoreId(store.id);
    setChosenStorename(store.name);
    if (store.imageUrl) {
      setChosenStoreImageUrl(store.imageUrl);
    } else {
      setChosenStoreImageUrl("default");
    }
  };

  const handleCancel = () => {
    setChosenStoreId("");
    setChosenStorename("");
    setChosenStoreImageUrl("");
  };

  const selectedImageSrc =
    chosenStoreImageUrl === ""
      ? "/images/choose-store.png"
      : chosenStoreImageUrl === "default"
        ? "/images/default-image.png"
        : chosenStoreImageUrl;

  const selectedImageWidth = chosenStoreImageUrl === "default" ? 200 : 300;
  const selectedImageHeight = chosenStoreImageUrl === "default" ? 300 : 400;

  return (
    <div className="flex flex-col gap-8 items-center">
      <Card className="flex w-full flex-col items-center justify-center">
        <CardHeader className="w-full ">
          <CardDescription className="mx-auto max-w-xl">
            下の一覧から投票したい店舗の画像を選んで投票してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={formAction}
            className="flex flex-col justify-center items-center gap-2"
          >
            <input type="hidden" name="storeType" value={storeType} />
            <input type="hidden" name="storeId" value={chosenStoreId} />

            <Image
              src={selectedImageSrc}
              alt="選択中の画像"
              width={selectedImageWidth}
              height={selectedImageHeight}
              className="object-contain rounded-md"
            />

            <p className="text-lg">
              選択中の店舗：{chosenStoreName ? chosenStoreName : "なし"}
            </p>

            <Button type="button" onClick={handleCancel}>
              <div className="flex max-w-ws">
                <AiOutlineCloseCircle />
                <p>選択を解除</p>
              </div>
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full"
              variant="card"
            >
              {isPending ? "投票中" : "投票する"}
            </Button>
          </form>

          {state?.success && state?.message && (
            <MessagePrompt message={state.message} />
          )}
          {state?.success === false && state?.message && (
            <ErrorPrompt error={state.message} />
          )}
        </CardContent>
      </Card>

      <Card className="w-full grid grid-cols-3 md:grid-cols-4 p-4 gap-2">
        {filterdStores.map((store) => (
          <div
            key={store.id}
            className="flex flex-col justify-center items-center border-2 rounded-md p-2 md:p-4"
          >
            <button onClick={() => handleClick(store)}>
              {store.imageUrl ? (
                <Image
                  src={store.imageUrl}
                  alt={`${store.name}の画像`}
                  width={200}
                  height={300}
                  className="object-contain rounded-md"
                />
              ) : (
                <Image
                  src="/images/default-image.png"
                  alt="画像なし"
                  width={200}
                  height={300}
                  className="object-contain rounded-md"
                />
              )}
            </button>
            <p className="mt-2 md:mt-4 text-sm md:text-lg">{store.name}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
