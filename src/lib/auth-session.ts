import { auth } from "@/lib/auth";
import { cache } from "react";
import { headers as nextHeaders } from "next/headers";

export const getSessionFromHeaders = cache(async (headers: Headers) => {
  return auth.api.getSession({ headers });
});

export const getSessionFromRequestHeaders = cache(async () => {
  const requestHeaders = await nextHeaders();
  return auth.api.getSession({ headers: requestHeaders });
});
