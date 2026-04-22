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
import { AiFillClockCircle } from "react-icons/ai";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";

type Props = {
  userId: string;
  stores: Store[];
  storeType: StoreType;
};

export default function CreateStoreVoteForm({
  userId,
  stores,
  storeType,
}: Props) {
  const [state, formAction, isPending] = useActionState(createStoreVote, null);
  const [chosenStoreId, setChosenStoreId] = useState<string>("");
  const [chosenStoreImageUrl, setChosenStoreImageUrl] = useState<string | null>(
    "",
  );
  const filterdStores = stores.filter((store) => store.storeType === storeType);

  const handleClick = (store: Store) => {
    setChosenStoreId(store.id);
    setChosenStoreImageUrl(store.imageUrl);
  };
  return (
    <div className="flex flex-col gap-8 items-center">
      <Card className="flex w-full flex-col items-center justify-center">
        <CardHeader className="w-full ">
          <CardDescription className="mx-auto max-w-xl">
            下の一覧から投票したい店舗の画像を選んで投票してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="storeType" value={storeType} />
            <input type="hidden" name="storeId" value={chosenStoreId} />
            {chosenStoreImageUrl ? (
              <Image
                src={chosenStoreImageUrl}
                alt={`$選択中の画像`}
                width={300}
                height={400}
                loading="eager"
                className="object-contain rounded-md"
              />
            ) : (
              <Image
                src="/images/choose-store.png"
                alt={`$選択中の画像`}
                width={300}
                height={400}
                loading="eager"
                className="object-contain rounded-md"
              />
            )}
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
            className="flex flex-col md:gap-4 justify-center items-center border rounded-md p-2"
          >
            {store.imageUrl && (
              <button onClick={() => handleClick(store)}>
                {store.imageUrl ? (
                  <Image
                    src={store.imageUrl}
                    alt={`${store.name}の画像`}
                    width={200}
                    height={300}
                    loading="eager"
                    className="object-contain rounded-md"
                  />
                ) : (
                  <Image
                    src="/images/not-found-store-image.png"
                    alt={`$選択中の画像`}
                    width={200}
                    height={300}
                    loading="eager"
                    className="object-contain rounded-md"
                  />
                )}
              </button>
            )}
            <p className="md:text-lg">{store.name}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
