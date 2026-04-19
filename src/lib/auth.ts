import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "@/lib/db/schema";

function buildAllowedOrigins(baseUrl?: string) {
  if (!baseUrl) {
    return [] as string[];
  }

  const origins = new Set<string>();

  try {
    const parsed = new URL(baseUrl);
    origins.add(parsed.origin);

    // In local dev, users often switch between localhost and 127.0.0.1.
    // Allow both variants on the same protocol/port to avoid 403.
    if (parsed.hostname === "localhost") {
      origins.add(
        `${parsed.protocol}//127.0.0.1${parsed.port ? `:${parsed.port}` : ""}`,
      );
    }
    if (parsed.hostname === "127.0.0.1") {
      origins.add(
        `${parsed.protocol}//localhost${parsed.port ? `:${parsed.port}` : ""}`,
      );
    }
  } catch {
    // Fallback: keep original value if URL parsing fails.
    origins.add(baseUrl);
  }

  return [...origins];
}

const lazyD1 = new Proxy({} as D1Database, {
  get(_, prop) {
    const { env } = getCloudflareContext();
    return Reflect.get(env.DB as object, prop);
  },
});

const lazyDb = drizzle(lazyD1, { schema });

export const auth = betterAuth({
  appName: "Gakusai Hub",
  database: drizzleAdapter(lazyDb, {
    provider: "sqlite",
    schema,
    usePlural: true,
    camelCase: true,
  }),
  secret: process.env.BETTER_AUTH_SECRET as string,
  basePath: "/api/auth",
  baseURL: process.env.BETTER_AUTH_URL,
  allowedOrigins: buildAllowedOrigins(process.env.BETTER_AUTH_URL),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [anonymous(), nextCookies()],
  deleteUser: {
    enabled: true,
  },
});
