"use client";

import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TICKET_STATUS_MAP } from "@/lib/type";
import { tickets as ticketsTable } from "@/lib/db/schema";
import { useActionState, useEffect, useState, useTransition } from "react";
import { completePaperTicket } from "./action";
import { fetchTicketsByStatus } from "./action";

type CompletePaperTicketProps = {
  storeId: string;
  initialTickets: (typeof ticketsTable.$inferSelect)[];
};

function PaperTicketActionRow({
  ticketId,
  onCompleted,
}: {
  ticketId: string;
  onCompleted: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    completePaperTicket,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      onCompleted();
    }
  }, [state, onCompleted]);

  return (
    <form action={formAction}>
      <input type="hidden" name="ticketId" value={ticketId} />
      <Button type="submit" disabled={isPending} variant="warn">
        {isPending ? "処理中..." : "受付する"}
      </Button>
    </form>
  );
}

export default function CompletePaperTicket({
  storeId,
  initialTickets,
}: CompletePaperTicketProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [isPending, startTransition] = useTransition();

  const refreshTickets = () => {
    startTransition(async () => {
      const res = await fetchTicketsByStatus(storeId, null);
      if (res?.success && Array.isArray(res.tickets)) {
        setTickets(res.tickets.filter((ticket) => ticket.isPaper));
      } else {
        setTickets([]);
      }
    });
  };

  const visibleTickets = tickets.filter((ticket) => ticket.isPaper);

  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">紙の整理券一覧</h2>
          <p className="text-sm text-muted-foreground">
            紙の整理券だけを表示します。
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={refreshTickets}
          disabled={isPending}
        >
          {isPending ? "更新中..." : "再読み込み"}
        </Button>
      </div>

      {visibleTickets.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>番号</TableHead>
              <TableHead>人数</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>種類</TableHead>
              <TableHead>発行日時</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTickets.map((ticket) => {
              const statusLabel =
                TICKET_STATUS_MAP[
                  ticket.status as keyof typeof TICKET_STATUS_MAP
                ]?.label ?? ticket.status;

              return (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.index}</TableCell>
                  <TableCell>{ticket.numberOfPeople}</TableCell>
                  <TableCell>
                    <Badge className="text-sm">{statusLabel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="text-sm" variant="warn">
                      紙
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {ticket.status === "CALLED" ? (
                      <PaperTicketActionRow
                        ticketId={ticket.id}
                        onCompleted={refreshTickets}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        受付不可
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <NotFoundPrompt context="紙の整理券" />
      )}
    </div>
  );
}
