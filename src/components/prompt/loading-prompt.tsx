import { Item, ItemMedia, ItemContent, ItemTitle } from "../ui/item";
import { Spinner } from "../ui/spinner";

type loadingProps = {
  context: string;
};

export const LoadingPrompt = ({ context }: loadingProps) => {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">
            {context}を読み込み中...
          </ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
};
