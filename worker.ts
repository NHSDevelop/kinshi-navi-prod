// @ts-expect-error `.open-next/worker.ts` is generated at build time
import { default as handler } from "./.open-next/worker.js";
import { DurableObject } from "cloudflare:workers";

interface Env {
  TICKET_SESSION: DurableObjectNamespace;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/ws/ticket") {
      const ticketId = url.searchParams.get("ticketId");
      if (!ticketId) {
        return new Response("Missing ticketId", { status: 400 });
      }
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket connection", { status: 426 });
      }

      const id = env.TICKET_SESSION.idFromName(ticketId);
      const doStub = env.TICKET_SESSION.get(id);

      return doStub.fetch(
        new Request(`http://do/connect`, {
          headers: request.headers,
        }),
      );
    }

    return handler.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;

// @ts-expect-error  `.open-next/worker.ts` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";

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
        ws.send("ticket_refresh");
      }
      return new Response("OK", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {}
  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    ws.close();
  }
  async webSocketError(ws: WebSocket, error: unknown) {
    ws.close();
  }
}
