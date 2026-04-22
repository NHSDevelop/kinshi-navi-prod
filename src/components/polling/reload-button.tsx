"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { AiOutlineReload } from "react-icons/ai";

export default function ReloadButton() {
  const router = useRouter();
  const handleClick = () => {
    router.refresh();
  };
  return (
    <Button onClick={handleClick} asChild>
      <div className="flex max-w-xs">
        <AiOutlineReload />
        <p>再読み込みする</p>
      </div>
    </Button>
  );
}
