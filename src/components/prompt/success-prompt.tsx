import { Button } from "../ui/button";
import Link from "next/link";

type SuccessProps = {
  redirectLink: string;
};

export const SuccessPrompt = ({ redirectLink }: SuccessProps) => {
  return (
    <div>
      <Button asChild>
        <Link href={redirectLink}>戻る</Link>
      </Button>
    </div>
  );
};
