import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/lib/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

// Server Components 用（大多数の場合）
export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
});

// ISR/SSG など静的生成時用（非同期）
export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
});
