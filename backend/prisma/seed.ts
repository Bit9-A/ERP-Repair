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

  // ── Monedas (tasas de cambio con DolarAPI) ──
  let bcvRate = 854.46;
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial");
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data?.promedio) bcvRate = Number(data.promedio);
    }
  } catch {
    console.log("DolarAPI no disponible durante seed, usando tasa fallback");
  }

  const monedas = [
    { codigo: "USD", nombre: "Dólar Americano", tasa_cambio: 1 },
    { codigo: "VES", nombre: "Bolívar Digital", tasa_cambio: bcvRate },
    { codigo: "COP", nombre: "Peso Colombiano", tasa_cambio: 4150 },
  ];

  for (const m of monedas) {
    const moneda = await prisma.moneda.upsert({
      where: { codigo: m.codigo },
      update: { tasa_cambio: m.tasa_cambio },
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
