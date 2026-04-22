import { defineConfig } from "drizzle-kit";

const isProduction = process.env.NEXTJS_ENV === "production";
const config = isProduction
  ? defineConfig({
      out: "./drizzle/migrations",
      schema: "./src/lib/db/schema.ts",
      dialect: "sqlite",
    })
  : defineConfig({
      out: "./drizzle/migrations",
      schema: "./src/lib/db/schema.ts",
      dialect: "sqlite",
      dbCredentials: {
        url: process.env.LOCAL_D1_DB_PATH || ".wrangler/state/v3/d1/local.db",
      },
    });
export default config;
