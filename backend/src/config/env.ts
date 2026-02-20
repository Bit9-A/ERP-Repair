import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ Variable de entorno "${key}" no está definida. Revisa tu .env`,
    );
  }
  return value;
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  PORT: parseInt(process.env["PORT"] || "3001", 10),
  NODE_ENV: process.env["NODE_ENV"] || "development",
};
