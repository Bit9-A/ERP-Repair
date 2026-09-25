// =============================================================================
// AI CHAT SERVICE — Asistente IA para gerentes y administradores de taller ERP-Repair
// Usa Groq (Qwen 3.8 27B) con conocimiento profundo del sistema de reparaciones y ventas.
// Solo SELECT — nunca modifica datos. Rate limiting por usuario.
// =============================================================================

import Groq from 'groq-sdk';
import prisma from '../../config/prisma';
import dotenv from 'dotenv';
import path from 'path';

function getGroq(): Groq | null {
    if (!process.env.GROQ_API_KEY) {
        dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
        dotenv.config({ path: path.resolve(process.cwd(), '.env') });
        dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
    }
    const key = process.env.GROQ_API_KEY;
    if (!key || key.trim() === '') return null;
    return new Groq({ apiKey: key.trim() });
}

// Modelo activo de Groq (Llama 3.3 70B Versatile, alta precisión y 128k contexto)
const AI_MODEL = 'llama-3.3-70b-versatile';

// ─── Rate limiting (30 req/min por usuario) ──────────────────────────────────
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const timestamps = rateLimitMap.get(userId) || [];
    const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    rateLimitMap.set(userId, valid);

    if (valid.length >= RATE_LIMIT_MAX) {
        const oldest = valid[0];
        const retryAfter = Math.ceil((RATE_LIMIT_WINDOW - (now - oldest)) / 1000);
        return { allowed: false, retryAfter };
    }
    valid.push(now);
    return { allowed: true };
}

// ─── System prompt: asistente experto en taller de reparación y retail ────────
const SYSTEM_PROMPT = `Sos el asistente IA experto de TechLand / ERP-Repair para gerentes de talleres de servicio técnico y venta de repuestos en Venezuela.

CAPACIDADES:
1. Consultas de datos → Generá SQL SELECT seguro para responder preguntas
2. Guías del sistema → Indicá exactamente en qué módulo se realiza cada acción
3. Análisis de negocio → Rendimiento de técnicos, órdenes pendientes, repuestos críticos y ventas
4. Exportación → Tablas formateadas para CSV/Excel

REGLAS SQL OBLIGATORIAS:
- SOLO SELECT. NUNCA INSERT, UPDATE, DELETE, DROP ni ALTER
- Comillas dobles SOLO en los nombres de las tablas: "Producto", "TicketReparacion", "Venta", "Cliente", "Usuario", "Pago", "SucursalProducto", "Sucursal", "TransaccionFinanciera"
- NUNCA pongas comillas dobles en las columnas. Escribilas en minúsculas directas: id, nombre, categoria, stock_actual, precio_usd, costo_usd, activo, estado, fecha_ingreso, marca, modelo
- Clasificación de productos en "Producto":
  * Teléfonos / celulares / equipos para la venta: categoria = 'EQUIPO'
  * Repuestos (pantallas, baterías, pines): categoria = 'REPUESTO'
  * Accesorios (cables, cargadores, estuches): categoria = 'ACCESORIO'
  * Solo productos a la venta: activo = true (y stock_actual > 0 si preguntan por disponibilidad)
  * IMPORTANTE: En "Producto" NO EXISTE precio_bs ni precio_ves. Los precios están ÚNICAMENTE en precio_usd.
- Estados de tickets en "TicketReparacion": 'RECIBIDO', 'DIAGNOSTICO', 'EN_REPARACION', 'REPARADO', 'ENTREGADO', 'CANCELADO'
- Ventas en "Venta": estado = 'PAGADA' o 'PENDIENTE'

COMPORTAMIENTO CONVERSACIONAL (ESTILO GEMINI):
- El usuario NUNCA debe saber que se realizan consultas SQL ni que hay una base de datos detrás.
- Actuá como un asistente de inteligencia artificial inteligente y profesional (estilo Gemini o ChatGPT): solo respuesta clara, pulida y directa.
- NUNCA menciones términos técnicos como "base de datos", "SQL", "tablas", "sentencias", "consultas" ni "registros obtenidos".

MÓDULOS DEL SISTEMA:
- Reparaciones / Tickets (/repairs o /tickets): Registrar equipos, diagnósticos, cambiar estado, asignar técnicos, checklists
- Facturación / POS (/billing): Vender repuestos, emitir notas de entrega/facturas, cobrar en multimoneda (USD/VES/COP)
- Inventario / Repuestos (/inventory): Stock actual, pantallas, baterías, repuestos, ajustes y traslados
- Finanzas (/finance): Cajas, ingresos, egresos, comisiones de técnicos y tasas de cambio
- Clientes (/clients): Directorio, cédulas, teléfonos, historial de reparaciones
- Sucursales (/branches): Configuración de sedes y depósitos
- Configuración (/settings): Parámetros fiscales y generales

CUANDO EL USUARIO QUIERE HACER ALGO (recibir equipo, vender, cobrar, crear producto):
Guiá amigablemente al módulo correcto. Ejemplo: "Para recibir un equipo, andá al módulo de Reparaciones..."

CUANDO EL USUARIO PREGUNTA DATOS:
Generá SQL SELECT encerrado en bloque \`\`\`sql ... \`\`\` y respondé de forma natural y ejecutiva.

CUANDO NO HAY DATOS:
Decí con calidez algo como: "Todavía no cuento con información registrada sobre eso en el sistema 📊"

TABLAS Y COLUMNAS:
"Producto": id, sku, nombre, categoria ('EQUIPO'|'REPUESTO'|'ACCESORIO'), costo_usd, precio_usd, precio_mayor_usd, stock_actual, stock_minimo, activo. (No hay precio en Bs, solo precio_usd).
"TicketReparacion": id, clienteId, tecnicoId, equipo, tipo_equipo, marca, modelo, imei, falla, estado, costo_repuestos_usd, precio_total_usd, porcentaje_tecnico, fecha_ingreso, fecha_entrega, sucursalId
"Venta": id, numero, tipo_documento, subtotal_usd, descuento_usd, total_usd, estado, createdAt, sucursalId, clienteId, vendedorId
"Venta_Producto": id, ventaId, productoId, cantidad, precio_congelado_usd, costo_congelado_usd
"Sucursal": id, nombre, direccion, activa, principal
"SucursalProducto": sucursalId, productoId, stock
"Cliente": id, nombre, cedula, telefono, correo, tipo_cliente
"Usuario": id, nombre, rol, email, sucursalId
"Pago": id, ticketId, ventaId, monedaId, monto_moneda_local, equivalente_usd, referencia, fecha_pago, metodo
"Moneda": id, codigo, nombre, tasa_cambio
"TransaccionFinanciera": id, tipo, categoria, monto_usd, descripcion, fecha, estado, sucursalId`;

// ─── Seguridad: validar SQL ──────────────────────────────────────────────────
function validateSql(sql: string): { valid: boolean; error?: string } {
    const normalized = sql.trim().toUpperCase();
    const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'CREATE', 'GRANT', 'REVOKE', 'EXEC'];
    for (const kw of forbidden) {
        if (normalized.startsWith(kw + ' ') || normalized.includes(';' + kw) || normalized.includes('\n' + kw + ' ')) {
            return { valid: false, error: 'Operación no permitida.' };
        }
    }
    if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH')) {
        return { valid: false, error: 'Solo se permiten consultas SELECT.' };
    }
    return { valid: true };
}

// ─── Interfaz de respuesta ───────────────────────────────────────────────────
export interface AiChatResponse {
    answer: string;
    data?: any[];
    exportData?: any[];
    error?: string;
}

/**
 * Procesa una pregunta del usuario.
 */
export const processAiQuestion = async (
    question: string,
    userId?: string,
    history?: ChatMessage[]
): Promise<AiChatResponse> => {
    const uid = userId || 'anonymous';
    const rl = checkRateLimit(uid);
    if (!rl.allowed) {
        return { answer: `Estás haciendo muchas consultas en poco tiempo. Esperá ${rl.retryAfter} segundos y probá de nuevo. ⏳` };
    }

    const groq = getGroq();
    if (!groq) {
        return { answer: 'El servicio de IA no está configurado o GROQ_API_KEY no está definida en el entorno.' };
    }

    try {
        // ── PASO 1: Determinar intención con contexto conversacional ─────────
        const conversationMessages: any[] = [
            { role: 'system', content: SYSTEM_PROMPT },
        ];

        // Incluir últimos turnos de la conversación previa para preguntas contextuales (ej: "¿cuánto vale cada uno?")
        if (history && history.length > 0) {
            for (const h of history) {
                conversationMessages.push({
                    role: h.role,
                    content: h.content.slice(0, 300),
                });
            }
        }

        conversationMessages.push({ role: 'user', content: question });

        const completion = await groq.chat.completions.create({
            model: AI_MODEL,
            messages: conversationMessages,
            temperature: 0.2,
            max_tokens: 1024,
        });

        const responseText = completion.choices[0]?.message?.content || '';

        // Extraer SQL si la IA generó uno
        const sqlMatch = responseText.match(/```sql\s*([\s\S]*?)```/i)
            || responseText.match(/```\s*([\s\S]*?)```/i);
        let sql = sqlMatch ? sqlMatch[1].trim() : null;

        if (!sql) {
            const selectMatch = responseText.match(/((?:SELECT|WITH)\s[\s\S]*?);?\s*$/i);
            if (selectMatch) sql = selectMatch[1].trim().replace(/;$/, '');
        }

        // Si no hay SQL, la IA está dando guía o respuesta conversacional
        if (!sql) {
            return { answer: responseText };
        }

        // Limpiar punto y coma final, comillas dobles duplicadas ("" -> ") y espacios
        sql = sql.replace(/;+\s*$/, '').trim();
        sql = sql.replace(/""+/g, '"');

        // ── PASO 2: Ejecutar SQL seguro con auto-recuperación ────────────────
        const validation = validateSql(sql);
        if (!validation.valid) {
            return { answer: 'No puedo ejecutar esa consulta por motivos de seguridad. Probá reformulando la pregunta.' };
        }

        let rawResult: any;
        try {
            rawResult = await prisma.$queryRawUnsafe(sql);
        } catch (dbErr: any) {
            console.warn('[ai-chat] Initial SQL failed:', sql, 'Error:', dbErr.message);
            // Auto-corrección inteligente de 1 paso pasando el error de PostgreSQL a Groq
            try {
                const fixCompletion = await groq.chat.completions.create({
                    model: AI_MODEL,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: `La consulta SQL "${sql}" falló en PostgreSQL con el error: "${dbErr.message}". Pregunta del usuario: "${question}". Corregí la consulta respetando el esquema. Responde SOLO el bloque \`\`\`sql ... \`\`\`` }
                    ],
                    temperature: 0.1,
                    max_tokens: 400
                });
                const fixedText = fixCompletion.choices[0]?.message?.content || '';
                const fixedMatch = fixedText.match(/```sql\s*([\s\S]*?)```/i) || fixedText.match(/```\s*([\s\S]*?)```/i);
                let fixedSql = (fixedMatch ? fixedMatch[1] : fixedText).replace(/;+\s*$/, '').trim().replace(/""+/g, '"');
                if (validateSql(fixedSql).valid) {
                    console.log('[ai-chat] Executing self-corrected SQL:', fixedSql);
                    rawResult = await prisma.$queryRawUnsafe(fixedSql);
                } else {
                    throw dbErr;
                }
            } catch {
                throw dbErr;
            }
        }

        const data = Array.isArray(rawResult)
            ? rawResult.map((row: any) => {
                const obj: any = {};
                for (const [k, v] of Object.entries(row)) {
                    obj[k] = typeof v === 'bigint' ? Number(v) : v;
                }
                return obj;
            })
            : [];

        // ── PASO 3: Formatear respuesta natural ──────────────────────────────
        const formatCompletion = await groq.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: buildFormatPrompt(question, data) },
                { role: 'user', content: 'Dame la respuesta ejecutiva.' },
            ],
            temperature: 0.3,
            max_tokens: 800,
        });

        const answer = formatCompletion.choices[0]?.message?.content?.trim() || formatDataFallback(data);

        // Detectar si el usuario pidió exportar
        const wantsExport = /export|csv|excel|archivo|descargar|reporte/i.test(question);

        if (wantsExport && data.length > 0) {
            return { answer: `📊 **Reporte preparado** — Podés descargarlo en CSV o Excel.`, data, exportData: data };
        }

        return { answer, data };
    } catch (error: any) {
        console.error('[ai-chat] Error:', error.message);
        if (error.message?.includes('GROQ_API_KEY')) {
            return { answer: 'Servicio de IA no disponible temporalmente.' };
        }
        return { answer: 'No pude encontrar esa información en este momento. Por favor probá preguntármelo con otras palabras.' };
    }
};

// ─── Prompt para formatear respuestas naturales ──────────────────────────────
function buildFormatPrompt(question: string, data: any[]): string {
    return `Sos el asesor experto de TechLand ERP. El gerente preguntó: "${question}"

Estos son los datos del sistema para responder:
${JSON.stringify(data.slice(0, 30))}

Respondé en español, con tono natural, profesional y ejecutivo (estilo Gemini / copiloto de negocios).
Reglas:
- Hablá con confianza, fluidez y tono profesional
- Poné los datos en contexto directo respondiendo con precisión a lo que se preguntó
- Si NO hay datos, respondé con amabilidad:
  * "Todavía no cuento con datos registrados sobre eso en el sistema."
- Sé conciso: máximo 3 a 4 oraciones
- Usá **negrita** para resaltar números y montos clave
- NUNCA menciones SQL, tablas, consultas ni base de datos. El usuario solo debe recibir la respuesta analítica directa.
- Formato de moneda: $ para USD y Bs para Bolívares
- Usá emojis con moderación`;
}

function formatDataFallback(data: any[]): string {
    if (data.length === 0) return 'Todavía no hay registros de eso, pero a medida que cargues movimientos vas a tener todo acá 📊';
    if (data.length === 1) {
        const keys = Object.keys(data[0]);
        if (keys.length === 1) return `El resultado es **${data[0][keys[0]]}**.`;
    }
    return data.slice(0, 5).map(r => Object.entries(r).map(([k, v]) => `**${k}**: ${v}`).join(' · ')).join('\n');
}

// ─── Análisis de archivos subidos (CSV / Excel) ──────────────────────────────
export const analyzeUploadedFile = async (fileBuffer: Buffer, filename: string, question?: string): Promise<AiChatResponse> => {
    const groq = getGroq();
    if (!groq) return { answer: 'El asistente de IA no está disponible temporalmente.' };
    try {
        const XLSX = await import('xlsx');
        const ext = filename.toLowerCase().split('.').pop();
        let data: any[] = [];
        if (ext === 'csv') {
            const wb = XLSX.read(fileBuffer.toString('utf-8'), { type: 'string' });
            data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        } else if (['xlsx', 'xls'].includes(ext || '')) {
            const wb = XLSX.read(fileBuffer, { type: 'buffer' });
            data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        } else {
            return { answer: `Formato no soportado: ${ext}. Usa CSV o Excel (.xlsx).` };
        }
        if (data.length === 0) return { answer: 'El archivo está vacío.' };

        const headers = Object.keys(data[0]);
        const userPrompt = question
            ? `Archivo "${filename}" con ${data.length} filas. Pregunta: "${question}"\nColumnas: ${headers.join(', ')}\nMuestra de datos: ${JSON.stringify(data.slice(0, 15))}`
            : `Archivo "${filename}" con ${data.length} filas. Analizalo y dame un resumen ejecutivo de lo más importante.\nColumnas: ${headers.join(', ')}\nMuestra de datos: ${JSON.stringify(data.slice(0, 15))}`;

        const completion = await groq.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: 'Sos un analista de datos experto en talleres y retail. Analizá el archivo subido y respondé en español con datos clave, totales y hallazgos relevantes. Sé conciso.' },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1024,
        });
        return { answer: completion.choices[0]?.message?.content?.trim() || `Archivo analizado con éxito (${data.length} filas).`, data };
    } catch (error: any) {
        return { answer: `Error al analizar el archivo: ${error.message}` };
    }
};

// ─── Persistencia de sesiones en memoria con fallback limpio ───────────────────
export interface ChatMessage { role: 'user' | 'assistant'; content: string; exportData?: any[] | null; timestamp: string; }

const sessionMemoryCache = new Map<string, ChatMessage[]>();

export const saveChatSession = async (userId: string, messages: ChatMessage[]): Promise<void> => {
    sessionMemoryCache.set(userId, messages);
    try {
        const key = `chat_session_${userId}`;
        await prisma.$executeRawUnsafe(
            `INSERT INTO "system_settings" ("id","key","value","createdAt","updatedAt") VALUES ($1,$2,$3,NOW(),NOW()) ON CONFLICT ("key") DO UPDATE SET "value"=$3,"updatedAt"=NOW()`,
            key, key, JSON.stringify(messages)
        );
    } catch {
        // En caso de que no exista la tabla, se mantiene seguro en memoria
    }
};

export const loadChatSession = async (userId: string): Promise<ChatMessage[]> => {
    try {
        const rows = await prisma.$queryRawUnsafe<{ value: string }[]>(
            `SELECT "value" FROM "system_settings" WHERE "key"=$1`,
            `chat_session_${userId}`
        );
        if (rows.length > 0) return JSON.parse(rows[0].value);
    } catch {
        // Fallback a memoria
    }
    return sessionMemoryCache.get(userId) || [];
};

export const clearChatSession = async (userId: string): Promise<void> => {
    sessionMemoryCache.delete(userId);
    try {
        await prisma.$executeRawUnsafe(
            `DELETE FROM "system_settings" WHERE "key"=$1`,
            `chat_session_${userId}`
        );
    } catch {
        // Ignorar si no existe la tabla
    }
};
