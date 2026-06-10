import { NextRequest } from 'next/server';
import { getCloudflareBindings } from "@/lib/runtime-env"; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get('ticketId');

  if (!ticketId) {
    return new Response('Missing ticketId', { status: 400 });
  }

  const env = getCloudflareBindings();
  if (!env || !env.TICKET_SESSION) {
    return new Response('Durable Object Binding not found', { status: 500 });
  }

  const id = env.TICKET_SESSION.idFromName(ticketId);
  const doStub = env.TICKET_SESSION.get(id);

  return doStub.fetch(new Request(`http://do/connect`, {
    headers: request.headers,
  }));
}