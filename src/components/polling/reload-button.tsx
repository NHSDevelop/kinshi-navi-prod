"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { RotateCw } from "lucide-react";

export default function ReloadButton() {
  const router = useRouter();
  const handleClick = () => {
    router.refresh();
  };
  return (
    <Button onClick={handleClick} asChild>
      <div className="flex items-center gap-2 w-full h-full">
        <RotateCw />
        <p>再読み込みする</p>
      </div>
    </Button>
  );
}
