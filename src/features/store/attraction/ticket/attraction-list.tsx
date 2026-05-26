"use client";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { TICKET_STATUS_MAP } from "@/lib/type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useActionState, useEffect, useState, useTransition } from "react";

import { TicketStatus, tickets as ticketsTable } from "@/lib/db/schema";
import { completePaperTicket, fetchTicketsByStatus } from "./action";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AttractionTicketListProps {
  storeId: string;
  initialTickets: (typeof ticketsTable.$inferSelect)[];
}

const STATUS_OPTIONS: { value: TicketStatus | null; label: string }[] = [
  { value: null, label: "すべて" },
  { value: "ISSUED", label: "発行済み" },
  { value: "CALLED", label: "呼び出し中" },
  { value: "COMPLETED", label: "完了" },
  { value: "CANCELED", label: "キャンセル" },
];

export default function AttractionTicketList({
  storeId,
  initialTickets,
}: AttractionTicketListProps) {
  const [status, setStatus] = useState<TicketStatus | null>(null);
  const [tickets, setTickets] =
    useState<(typeof ticketsTable.$inferSelect)[]>(initialTickets);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (value: string) => {
    const newStatus = value === "null" ? null : (value as TicketStatus);
    setStatus(newStatus);
    startTransition(async () => {
      const res = await fetchTicketsByStatus(storeId, newStatus);
      if (res?.success && Array.isArray(res.tickets)) {
        setTickets(res.tickets);
      } else {
        setTickets([]);
      }
    });
  };
  const [state, formAction, isFormPending] = useActionState(
    completePaperTicket,
    null,
  );

  useEffect(() => {
    if (!state?.success) return;

    startTransition(async () => {
      const res = await fetchTicketsByStatus(storeId, status);
      if (res?.success && Array.isArray(res.tickets)) {
        setTickets(res.tickets);
      }
    });
  }, [state, startTransition, status, storeId]);

  //TODO 整理券のsort順を考える
  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="flex gap-4 items-center">
        <p>整理券の状態で絞り込む</p>
        <Select
          value={status ?? "null"}
          onValueChange={handleStatusChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="状態を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value ?? "null"}
                  value={opt.value ?? "null"}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Separator />
      {tickets.length > 0 ? (
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
            {tickets.map((ticket) => {
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
                    {ticket.isPaper ? (
                      <Badge className="text-sm" variant="warn">
                        紙
                      </Badge>
                    ) : (
                      <Badge className="text-sm">デジタル</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleString()}
                  </TableCell>
                  {ticket.isPaper && ticket.status === "CALLED" && (
                    <TableCell>
                      <form action={formAction}>
                        <input
                          type="hidden"
                          name="ticketId"
                          value={ticket.id}
                        />
                        <Button
                          type="submit"
                          disabled={isFormPending}
                          variant="warn"
                        >
                          {isFormPending ? "処理中..." : "受付する"}
                        </Button>
                      </form>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <NotFoundPrompt context="発行された整理券" />
      )}
    </div>
  );
}
