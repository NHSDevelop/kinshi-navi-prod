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
        url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/6d5dc8d402d07ca283bdf4e21e2a296c08d1c0640a2a7d1caf022a09ef7c47ae.sqlite",
      },
    });
export default config;
