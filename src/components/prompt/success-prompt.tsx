import { Button } from "../ui/button";
import Link from "next/link";

type SuccessProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redirectLink: string;
};

//TODO 戻るボタンのリンクは再検討

export const SuccessPrompt = ({ redirectLink }: SuccessProps) => {
  return (
    <div>
      <Button asChild>
        <Link href={redirectLink}>戻る</Link>
      </Button>
    </div>
  );
};
