'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RealtimeTicketListenerProps {
  ticketId: string;
}

export function RealtimeTicketListener({ ticketId }: RealtimeTicketListenerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!ticketId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ticket/ws?ticketId=${ticketId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      if (event.data === 'ticket_refresh') {
        router.refresh();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      ws.close();
    };
  }, [ticketId, router]);

  return null;
}