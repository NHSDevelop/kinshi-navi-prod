import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/lib/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

export const getDb = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
});
