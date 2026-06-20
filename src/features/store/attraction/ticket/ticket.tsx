"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import QRCode from "@/components/ui/qrcode";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TicketStatus } from "@/lib/db/schema";
import { TICKET_STATUS_MAP } from "@/lib/type";
import CancelTicket from "./cancel";

interface TicketCardProps {
  ticket: {
    id: string;
    index: number;
    numberOfPeople: number;
    createdAt: Date;
    status: TicketStatus;
    attraction: {
      store: {
        name: string;
        event?: {
          name: string;
        } | null;
      };
    };
  };
}

export function TicketCard({ ticket }: TicketCardProps) {
  const statusLabel =
    TICKET_STATUS_MAP[ticket.status as keyof typeof TICKET_STATUS_MAP]?.label ??
    ticket.status;

  return (
    <Card className="px-4 py-8 space-y-4">
      <CardHeader className="flex flex-col gap-4 items-start">
        <p className="text-sm text-text-01">
          イベント名：{ticket.attraction.store.event?.name}
        </p>
        <p className="text-sm text-text-01">
          企画名：{ticket.attraction.store.name}
        </p>
        <p className="text-sm text-text-01">人数:{ticket.numberOfPeople}名</p>
        <Separator />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-row gap-x-4  justify-start items-baseline">
          <p className="text-2xl">No.{ticket.index}</p>
          {ticket.status === "CALLED" ? (
            <Badge variant="warn" className="text-lg">
              {statusLabel}
            </Badge>
          ) : (
            <Badge variant="info" className="text-lg">
              {statusLabel}
            </Badge>
          )}
        </div>
        {ticket.status === "CALLED" && (
          <div className="flex justify-center">
            <QRCode text={ticket.id} className="max-w-64" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 items-start">
        <Separator />
        <div className="text-sm text-text-01">
          <p>
            発券日時：
            {ticket.createdAt.toLocaleString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <CancelTicket ticketId={ticket.id} />
      </CardFooter>
    </Card>
  );
}
