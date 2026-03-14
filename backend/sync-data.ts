import "dotenv/config";
import { PrismaClient } from './src/generated/prisma';

const localPrisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

const cloudPrisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_CLOUD
        }
    }
});

async function main() {
    console.log('🚀 Iniciando sincronización de datos base...');

    try {
        // 1. Sucursales
        const sucursales = await localPrisma.sucursal.findMany();
        console.log(`📦 Sincronizando ${sucursales.length} sucursales...`);
        for (const s of sucursales) {
            await cloudPrisma.sucursal.upsert({
                where: { id: s.id },
                update: s,
                create: s
            });
        }

        // 2. Usuarios
        const usuarios = await localPrisma.usuario.findMany();
        console.log(`👤 Sincronizando ${usuarios.length} usuarios...`);
        for (const u of usuarios) {
            await cloudPrisma.usuario.upsert({
                where: { id: u.id },
                update: u,
                create: u
            });
        }

        // 3. Monedas
        const monedas = await localPrisma.moneda.findMany();
        console.log(`💵 Sincronizando ${monedas.length} monedas...`);
        for (const m of monedas) {
            await cloudPrisma.moneda.upsert({
                where: { id: m.id },
                update: m,
                create: m
            });
        }

        // 4. Configuración
        const config = await localPrisma.configuracion.findMany();
        console.log(`⚙️ Sincronizando configuración...`);
        for (const c of config) {
            await cloudPrisma.configuracion.upsert({
                where: { id: c.id },
                update: c,
                create: c
            });
        }

        console.log('✅ Sincronización base completada con éxito.');
    } catch (error) {
        console.error('❌ Error durante la sincronización:', error);
    } finally {
        await localPrisma.$disconnect();
        await cloudPrisma.$disconnect();
    }
}

main();
