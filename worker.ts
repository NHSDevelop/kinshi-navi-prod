import defaultExport from "./.open-next/worker.js";
export * from "./.open-next/worker.js"; 
export default defaultExport;

import { DurableObject } from "cloudflare:workers";

interface Env {
  TICKET_SESSION: DurableObjectNamespace;
}

export class TicketSession extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === "/connect") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.ctx.acceptWebSocket(server, ["guests"]);
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname === "/update" && request.method === "POST") {
      const websockets = this.ctx.getWebSockets("guests");
      for (const ws of websockets) {
        ws.send("refresh");
      }
      return new Response("OK", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {}
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    ws.close();
  }
  async webSocketError(ws: WebSocket, error: unknown) {
    ws.close();
  }
}