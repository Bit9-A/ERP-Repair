import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import cron from "node-cron";
import dotenv from "dotenv";

dotenv.config();

import localPrisma from "./config/prisma";

const cloudConnectionString = process.env.DATABASE_CLOUD;
if (!cloudConnectionString) {
  console.warn(
    "⚠️ DATABASE_CLOUD no está definido. La sincronización a la nube está deshabilitada.",
  );
}

const cloudPool = new Pool({ connectionString: cloudConnectionString });
const cloudAdapter = new PrismaPg(cloudPool);
const cloudPrisma = new PrismaClient({ adapter: cloudAdapter });

// Utilidad para limpiar nulos o pasar objetos completos a Upsert con seguridad TS
function asUpsert(obj: any): any {
  return obj as any;
}

async function syncToCloud() {
  if (!cloudConnectionString) return;

  console.log(
    `[SYNC] ☁️ Iniciando sincronización con la nube... (${new Date().toLocaleString()})`,
  );

  try {
    const since = new Date(0);

    // 1. SUCURSALES Y USUARIOS
    const sucursales = await localPrisma.sucursal.findMany({
      where: { updatedAt: { gte: since } },
    });
    for (const s of sucursales) {
      await cloudPrisma.sucursal.upsert({
        where: { id: s.id },
        update: asUpsert(s),
        create: asUpsert(s),
      });
    }

    const usuarios = await localPrisma.usuario.findMany({
      where: { updatedAt: { gte: since } },
    });
    for (const u of usuarios) {
      await cloudPrisma.usuario.upsert({
        where: { id: u.id },
        update: asUpsert(u),
        create: asUpsert(u),
      });
    }

    // 2. CLIENTES, MARCAS, PRODUCTOS
    const clientes = await localPrisma.cliente.findMany({
      where: { updatedAt: { gte: since } },
    });
    for (const c of clientes) {
      await cloudPrisma.cliente.upsert({
        where: { id: c.id },
        update: asUpsert(c),
        create: asUpsert(c),
      });
    }

    const marcas = await localPrisma.marca.findMany({
      where: { createdAt: { gte: since } },
    });
    for (const m of marcas) {
      await cloudPrisma.marca.upsert({
        where: { id: m.id },
        update: asUpsert(m),
        create: asUpsert(m),
      });
    }

    const productos = await localPrisma.producto.findMany({
      where: { updatedAt: { gte: since } },
    });
    for (const p of productos) {
      await cloudPrisma.producto.upsert({
        where: { id: p.id },
        update: asUpsert(p),
        create: asUpsert(p),
      });
    }

    const sucursalProductos = await localPrisma.sucursalProducto.findMany({});
    for (const sp of sucursalProductos) {
      await cloudPrisma.sucursalProducto.upsert({
        where: {
          sucursalId_productoId: {
            sucursalId: sp.sucursalId,
            productoId: sp.productoId,
          },
        },
        update: asUpsert(sp),
        create: asUpsert(sp),
      });
    }

    // 3. MOVIMIENTOS, TICKETS, VENTAS, PAGOS
    const movimientos = await localPrisma.movimientoStock.findMany({
      where: { createdAt: { gte: since } },
    });
    for (const mov of movimientos) {
      await cloudPrisma.movimientoStock.upsert({
        where: { id: mov.id },
        update: asUpsert(mov),
        create: asUpsert(mov),
      });
    }

    const tickets = await localPrisma.ticketReparacion.findMany({
      where: { fecha_ingreso: { gte: since } },
    });
    for (const t of tickets) {
      await cloudPrisma.ticketReparacion.upsert({
        where: { id: t.id },
        update: asUpsert(t),
        create: asUpsert(t),
      });
    }

    const ticketRepuestos = await localPrisma.ticket_Producto.findMany({});
    for (const tr of ticketRepuestos) {
      await cloudPrisma.ticket_Producto.upsert({
        where: { id: tr.id },
        update: asUpsert(tr),
        create: asUpsert(tr),
      });
    }

    const ticketServicios = await localPrisma.ticket_Servicio.findMany({});
    for (const ts of ticketServicios) {
      await cloudPrisma.ticket_Servicio.upsert({
        where: { id: ts.id },
        update: asUpsert(ts),
        create: asUpsert(ts),
      });
    }

    const ventas = await localPrisma.venta.findMany({
      where: { createdAt: { gte: since } },
    });
    for (const v of ventas) {
      await cloudPrisma.venta.upsert({
        where: { id: v.id },
        update: asUpsert(v),
        create: asUpsert(v),
      });
    }

    const ventaDetalles = await localPrisma.venta_Producto.findMany({});
    for (const vd of ventaDetalles) {
      await cloudPrisma.venta_Producto.upsert({
        where: { id: vd.id },
        update: asUpsert(vd),
        create: asUpsert(vd),
      });
    }

    const monedas = await localPrisma.moneda.findMany({
      where: { updatedAt: { gte: since } },
    });
    for (const m of monedas) {
      await cloudPrisma.moneda.upsert({
        where: { id: m.id },
        update: asUpsert(m),
        create: asUpsert(m),
      });
    }

    const pagos = await localPrisma.pago.findMany({
      where: { fecha_pago: { gte: since } },
    });
    for (const p of pagos) {
      await cloudPrisma.pago.upsert({
        where: { id: p.id },
        update: asUpsert(p),
        create: asUpsert(p),
      });
    }

    console.log(
      `[SYNC] ✅ Sincronización completada exitosamente. Registros procesados.`,
    );
  } catch (error) {
    console.error(
      `[SYNC] ❌ Error durante la sincronización a la nube:`,
      error,
    );
  }
}

syncToCloud().then(() => {
  console.log("🔥 Seed process successfully finalized.");
  process.exit(0);
});
