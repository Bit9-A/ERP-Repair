import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.USE_CLOUD === "true" ? process.env.DATABASE_CLOUD : env("DATABASE_URL"),
  },
});
