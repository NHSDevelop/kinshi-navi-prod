"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface RealtimeTicketListenerProps {
  ticketId: string;
}

export function RealtimeTicketListener({
  ticketId,
}: RealtimeTicketListenerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!ticketId) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;
    // connect() 呼び出しごとに増える世代番号。
    // 古い世代のソケットからの再接続・イベントは全て無視する。
    let generation = 0;

    const clearReconnectTimer = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    const closeSocket = (socket: WebSocket | null) => {
      if (!socket) return;
      // ハンドラを先に外してから close することで、
      // close() 自体が onclose を誤発火させても再接続ループに繋がらないようにする
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };

    const connect = () => {
      if (isUnmounted) return;

      closeSocket(ws);
      clearReconnectTimer();

      const myGeneration = ++generation;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/ticket?ticketId=${ticketId}`;
      const socket = new WebSocket(wsUrl);
      ws = socket;

      socket.onmessage = (event) => {
        if (myGeneration !== generation) return;
        if (event.data === "ticket_refresh") {
          router.refresh();
        }
      };

      socket.onerror = (error) => {
        if (myGeneration !== generation) return;
        console.error("WebSocket Error:", error);
      };

      socket.onclose = () => {
        if (myGeneration !== generation) return;
        if (isUnmounted) return;
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    const ensureAlive = () => {
      if (isUnmounted) return;
      if (document.visibilityState !== "visible") return;
      if (
        !ws ||
        ws.readyState === WebSocket.CLOSED ||
        ws.readyState === WebSocket.CLOSING
      ) {
        connect();
      }
    };

    document.addEventListener("visibilitychange", ensureAlive);
    window.addEventListener("online", ensureAlive);
    window.addEventListener("focus", ensureAlive);

    return () => {
      isUnmounted = true;
      generation++;
      document.removeEventListener("visibilitychange", ensureAlive);
      window.removeEventListener("online", ensureAlive);
      window.removeEventListener("focus", ensureAlive);
      closeSocket(ws);
      clearReconnectTimer();
    };
  }, [ticketId]);

  return null;
}
