import "dotenv/config";
import { PrismaClient } from '../generated/prisma';
import cron from 'node-cron';

// Configuración de clientes
const localPrisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
});

const cloudPrisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_CLOUD } }
});

/**
 * Motor de Sincronización
 */
async function sync() {
    console.log(`[${new Date().toISOString()}] 🔄 Iniciando ciclo de sincronización...`);
    
    try {
        // 1. Identificar sucursal local (Asumimos la primera marcada como principal o por env)
        const sucursalLocal = await localPrisma.sucursal.findFirst({ where: { principal: true } });
        if (!sucursalLocal) {
            console.error('❌ No se encontró una sucursal principal configurada localmente.');
            return;
        }

        const sucursalId = sucursalLocal.id;

        // 2. Obtener la última sincronización exitosa
        const lastSyncRecord = await localPrisma.syncLog.findFirst({
            where: { sucursalId, status: 'SUCCESS' },
            orderBy: { lastSync: 'desc' }
        });

        const lastSync = lastSyncRecord?.lastSync || new Date(0);
        console.log(`📅 Última sincronización: ${lastSync.toISOString()}`);

        const now = new Date();

        // 3. Tablas a sincronizar (orden de dependencia)
        const tables = [
            'cliente', 'producto', 'usuario', 'sucursal', 
            'ticketReparacion', 'venta', 'movimientoStock', 
            'transaccionFinanciera', 'moneda', 'configuracion'
        ];

        for (const table of tables) {
            console.log(`⏳ Sincronizando tabla: ${table}...`);
            
            // --- SUBIDA (Local -> Nube) ---
            const localChanges = await (localPrisma as any)[table].findMany({
                where: { updatedAt: { gt: lastSync } }
            });

            if (localChanges.length > 0) {
                console.log(`   ⬆️ Subiendo ${localChanges.length} cambios locales...`);
                for (const item of localChanges) {
                    await (cloudPrisma as any)[table].upsert({
                        where: { id: item.id },
                        update: item,
                        create: item
                    });
                }
            }

            // --- BAJADA (Nube -> Local) ---
            // Traemos lo que haya cambiado en la nube que NO haya sido originado aquí 
            // (Nota: Algunas tablas no tienen sucursalId directamente, sincronizamos todo lo nuevo)
            const cloudQuery: any = { updatedAt: { gt: lastSync } };
            
            const cloudChanges = await (cloudPrisma as any)[table].findMany({
                where: cloudQuery
            });

            if (cloudChanges.length > 0) {
                console.log(`   ⬇️ Descargando ${cloudChanges.length} cambios de la nube...`);
                for (const item of cloudChanges) {
                    await (localPrisma as any)[table].upsert({
                        where: { id: item.id },
                        update: item,
                        create: item
                    });
                }
            }
        }

        // 4. Registrar éxito
        await localPrisma.syncLog.create({
            data: {
                sucursalId,
                lastSync: now,
                status: 'SUCCESS'
            }
        });

        console.log(`✅ Ciclo de sincronización completado con éxito a las ${now.toISOString()}`);

    } catch (error) {
        console.error('❌ Error crítico en el motor de sincronización:', error);
        
        // Registrar fallo (si es posible)
        try {
            const sucursalLocal = await localPrisma.sucursal.findFirst({ where: { principal: true } });
            if (sucursalLocal) {
                await localPrisma.syncLog.create({
                    data: {
                        sucursalId: sucursalLocal.id,
                        lastSync: new Date(),
                        status: 'FAILED'
                    }
                });
            }
        } catch (e) {}
    }
}

// Ejecución manual o por cron
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--watch')) {
        console.log('🤖 Motor en modo automático (cada 5 minutos)');
        // Sincronizar cada 5 minutos
        cron.schedule('*/5 * * * *', () => {
            sync();
        });
        // Ejecución inicial
        sync();
    } else {
        sync().then(() => process.exit(0));
    }
}

export { sync };
