import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Admin user ──
  const hash = await bcrypt.hash("admin", 10);
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      nombre: "admin",
      email: "admin@gmail.com",
      password_hash: hash,
      rol: "ADMIN",
      porcentaje_comision_base: 0,
    },
  });
  console.log("✅ Usuario admin:", admin.email);

  // ── Monedas (tasas de cambio) ──
  const monedas = [
    { codigo: "USD", nombre: "Dólar Americano", tasa_cambio: 1 },
    { codigo: "VES", nombre: "Bolívar Digital", tasa_cambio: 40.5 },
    { codigo: "COP", nombre: "Peso Colombiano", tasa_cambio: 4150 },
  ];

  for (const m of monedas) {
    const moneda = await prisma.moneda.upsert({
      where: { codigo: m.codigo },
      update: {},
      create: m,
    });
    console.log(`✅ Moneda ${moneda.codigo}: tasa ${moneda.tasa_cambio}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
