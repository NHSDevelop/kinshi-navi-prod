import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Spinner className="h-8 w-8" />
        <span className="text-sm text-muted-foreground">読み込み中…</span>
      </div>
    </div>
  );
}
