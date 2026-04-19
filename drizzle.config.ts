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
        url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/58b754ca4ad588979b87252e51f86b39e15f8a6e1031c8045e36ea10232c4b6b.sqlite",
      },
    });
export default config;
