import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

export default defineConfig({
  dialect: "postgresql",
  schema: "./database/schema/index.ts",
  out: "./database/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
