import { getItemsByFoodId } from "../action";
import ItemSelectLinkClient from "./select-link-client";

interface ItemSelectLinkProps {
  foodId: string;
  href: string;
  context: string;
}

export default async function ItemSelectLink({
  foodId,
  href,
  context,
}: ItemSelectLinkProps) {
  const itemRows = await getItemsByFoodId(foodId);

  return (
    <ItemSelectLinkClient
      items={itemRows ?? []}
      href={href}
      context={context}
    />
  );
}
