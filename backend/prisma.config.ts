import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const dbUrl = process.env.USE_CLOUD === "true" 
  ? (process.env.DATABASE_CLOUD || "postgresql://dummy:dummy@localhost:5432/dummy")
  : (process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy");

export default defineConfig({
  datasource: {
    url: dbUrl,
  },
});
