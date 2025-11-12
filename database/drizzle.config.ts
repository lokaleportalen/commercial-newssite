import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./database/auth-schema.ts",
  out: "./database/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
