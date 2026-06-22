"use client";
import { useState, useTransition } from "react";
import { useZxing } from "react-zxing";
import { completeTicket } from "./action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CompleteTicket() {
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { ref } = useZxing({
    onDecodeResult(result) {
      const id = result.rawValue;
      setTicketId(id);
      setIsScanning(false);
      // 読み取り後に自動で呼び出し
      startTransition(async () => {
        const res = await completeTicket(id);
        setResult(res.message ?? null);
      });
    },
    paused: !isScanning,
  });

  const handleStartScan = () => {
    setTicketId(null);
    setResult(null);
    setIsScanning(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>整理券読み取り</CardTitle>
        <CardDescription>
          受付時に来場者の整理券を表示してもらい、それを読み込んで受付を完了してください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <video ref={ref} />
        {!isScanning && <p>カメラ待機中</p>}
        <div>
          {!isScanning ? (
            <Button className="w-full" onClick={handleStartScan}>
              整理券を読み込む（カメラが起動します）
            </Button>
          ) : (
            <Button variant="success" onClick={() => setIsScanning(false)}>
              キャンセル
            </Button>
          )}
        </div>
        {ticketId && (
          <div>
            {isPending ? <p>完了済みに変更中...</p> : null}
            {result && <p>{result}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
