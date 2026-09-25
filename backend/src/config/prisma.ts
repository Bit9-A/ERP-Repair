// Configuración de Prisma Client — Prisma 7
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { Pool } from "pg";

const dbUrl = process.env["DATABASE_URL"] || "";
const isLocalDb = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") || dbUrl.includes("@db:");

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log:
    process.env["NODE_ENV"] === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export default prisma;
