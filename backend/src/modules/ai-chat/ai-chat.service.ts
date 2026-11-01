// =============================================================================
// AI CHAT SERVICE — Asistente IA para gerentes y administradores de taller ERP-Repair
// Usa Groq (Qwen 3.8 27B) con conocimiento profundo del sistema de reparaciones y ventas.
// Solo SELECT — nunca modifica datos. Rate limiting por usuario.
// =============================================================================

import Groq from 'groq-sdk';
import prisma from '../../config/prisma';
import dotenv from 'dotenv';
import path from 'path';

function loadEnvIfNeeded() {
    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
        dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
        dotenv.config({ path: path.resolve(process.cwd(), '.env') });
        dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
    }
}

function getAiConfig(): { provider: 'groq' | 'openrouter' | null; openRouterKey?: string; groq?: Groq } {
    loadEnvIfNeeded();
    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (groqKey) {
        return { provider: 'groq', groq: new Groq({ apiKey: groqKey }) };
    }
    const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
    if (openRouterKey) {
        return { provider: 'openrouter', openRouterKey };
    }
    return { provider: null };
}

// ─── Modelos soportados ───────────────────────────────────────────────────────
const GROQ_MODELS = [
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'allam-2-7b',
];

const OPENROUTER_MODELS = [
    'nvidia/nemotron-3.5-lightning:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'qwen/qwen3.8-27b:free',
    'google/gemma-4-31b-it:free',
];

interface AiCompletionResult {
    choices: Array<{
        message?: {
            content?: string | null;
        };
    }>;
}

async function callAiWithFallback(params: { messages: any[]; temperature: number; max_tokens: number }): Promise<AiCompletionResult> {
    const config = getAiConfig();
    if (!config.provider) {
        throw new Error('No hay API key configurada para el servicio de IA (OPENROUTER_API_KEY o GROQ_API_KEY).');
    }

    let lastError: any = null;

    if (config.provider === 'openrouter' && config.openRouterKey) {
        for (const model of OPENROUTER_MODELS) {
            try {
                const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${config.openRouterKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://erp-repair.local',
                        'X-Title': 'ERP-Repair',
                    },
                    body: JSON.stringify({
                        model,
                        messages: params.messages,
                        temperature: params.temperature,
                        max_tokens: params.max_tokens,
                        reasoning: { effort: 'none' },
                    }),
                });

                const data: any = await res.json();
                if (!res.ok || data.error) {
                    throw new Error(data.error?.message || `HTTP ${res.status}`);
                }
                if (data.choices && data.choices[0]?.message) {
                    return data;
                }
            } catch (err: any) {
                lastError = err;
                console.warn(`[ai-chat] OpenRouter model ${model} failed (${err.message?.slice(0, 80)}), trying next...`);
            }
        }
    }

    // Si el proveedor configurado es Groq:
    if (config.provider === 'groq' && config.groq) {
        for (const model of GROQ_MODELS) {
            try {
                return await config.groq.chat.completions.create({ ...params, model });
            } catch (err: any) {
                lastError = err;
                console.warn(`[ai-chat] Groq model ${model} failed (${err.message?.slice(0, 80)}), trying next...`);
            }
        }
    }

    throw lastError || new Error('Todos los modelos de IA fallaron.');
}

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
- NUNCA pongas comentarios en el SQL (-- ni /* */). Escribí el SELECT directamente sin comentarios para evitar truncamientos.
- Mantené las consultas simples y directas, evitando subconsultas redundantes.
- Comillas dobles SOLO en los nombres de las tablas: "Producto", "TicketReparacion", "Venta", "Cliente", "Usuario", "Pago", "SucursalProducto", "Sucursal", "TransaccionFinanciera"
- NUNCA pongas comillas dobles en las columnas. Escribilas en minúsculas directas: id, nombre, categoria, stock_actual, precio_usd, costo_usd, activo, estado, fecha_ingreso, marca, modelo
- Clasificación de productos en "Producto":
  * Teléfonos / celulares / equipos para la venta: categoria = 'EQUIPO'
  * Repuestos (pantallas, baterías, pines): categoria = 'REPUESTO'
  * Accesorios (cables, cargadores, estuches): categoria = 'ACCESORIO'
  * Solo productos a la venta: activo = true (y stock_actual > 0 si preguntan por disponibilidad)
  * IMPORTANTE: En "Producto" NO EXISTE precio_bs ni precio_ves. Los precios están ÚNICAMENTE en precio_usd.
- Estados válidos de tickets en "TicketReparacion" (ENUM EXACTO):
  * 'RECIBIDO' -> Equipo ingresado al taller
  * 'EN_REVISION' -> Equipo en revisión técnica / en diagnóstico / en reparación
  * 'ESPERANDO_REPUESTO' -> En espera de repuesto
  * 'REPARADO' -> Listo para entregar / terminado
  * 'ENTREGADO' -> Entregado al cliente
  * 'ABANDONO' -> Equipo no retirado
  * IMPORTANTE: Si preguntan por "en reparación", "en taller" o "pendientes", usá: estado IN ('RECIBIDO', 'EN_REVISION', 'ESPERANDO_REPUESTO')
  * Si preguntan específicamente por "en revisión": estado = 'EN_REVISION'
  * NUNCA inventes estados como 'DIAGNOSTICO' o 'EN_REPARACION' porque fallará el ENUM de PostgreSQL.
- Ventas en "Venta": estado = 'PAGADA', 'PENDIENTE' o 'ANULADA'

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

CUANDO EL USUARIO PREGUNTA DATOS O HACE PREGUNTAS DE SEGUIMIENTO (ej: "¿Cuáles son?", "¿Cuáles?", "¿Quiénes?", "¿Qué equipos?", "¿Detalle?"):
- Generá OBLIGATORIAMENTE un SQL SELECT encerrado en bloque \`\`\`sql ... \`\`\` para consultar la base de datos real.
- PROHIBIDO inventar nombres de clientes, modelos, marcas, IMEIs, montos o números de ticket. NUNCA respondas con ejemplos ficticios.
- Si la consulta no arroja registros, respondé con amabilidad: "Todavía no cuento con registros de esos equipos en el sistema."
- Solo podés mencionar los equipos que figuren en las filas devueltas por PostgreSQL.

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

// ─── Detección de consultas sobre datos u operaciones ───────────────────────
function isDataQuestion(text: string): boolean {
    const lower = text.toLowerCase().trim();
    // Preguntas cortas de seguimiento
    if (/^(cuales|cuales son|quienes|que|detalle|dame|muestra|cuales hay)\??$/i.test(lower)) return true;
    const triggers = [
        'cuant', 'cual', 'que ', 'quien', 'donde', 'precio', 'costo', 'stock',
        'ticket', 'reparaci', 'venta', 'factur', 'cliente', 'equipo', 'repuesto',
        'caja', 'ingreso', 'egreso', 'tecnico', 'sucursal', 'pago', 'deuda',
        'ganancia', 'balance', 'resumen', 'total', 'promedio', 'listar', 'mostrar',
        'detall', 'ultim', 'primer', 'imei', 'modelo', 'marca'
    ];
    return triggers.some(t => lower.includes(t));
}

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

    const aiConfig = getAiConfig();
    if (!aiConfig.provider) {
        return { answer: 'El servicio de IA no está configurado (OPENROUTER_API_KEY o GROQ_API_KEY no definidas).' };
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

        const completion = await callAiWithFallback({
            messages: conversationMessages,
            temperature: 0.2,
            max_tokens: 650,
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

        // ── GUARDA ANTI-ALUCINACIÓN: Si es pregunta de datos y no hubo SQL, forzar consulta ──
        const isDataQuery = isDataQuestion(question) || (history && history.length > 0 && isDataQuestion(history[history.length - 1].content));
        if (!sql && isDataQuery) {
            try {
                const forceCompletion = await callAiWithFallback({
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...conversationMessages.slice(1),
                        {
                            role: 'user',
                            content: 'La pregunta solicita información operativa o datos del sistema. Respondé ÚNICAMENTE con el bloque ```sql SELECT ... ``` para consultar los datos en PostgreSQL. Prohibido responder con texto libre o inventar datos ficticios.',
                        },
                    ],
                    temperature: 0.1,
                    max_tokens: 600,
                });
                const forceText = forceCompletion.choices[0]?.message?.content || '';
                const match = forceText.match(/```sql\s*([\s\S]*?)```/i) || forceText.match(/```\s*([\s\S]*?)```/i);
                sql = match ? match[1].trim() : null;
                if (!sql) {
                    const selectMatch = forceText.match(/((?:SELECT|WITH)\s[\s\S]*?);?\s*$/i);
                    if (selectMatch) sql = selectMatch[1].trim().replace(/;$/, '');
                }
            } catch (err: any) {
                console.warn('[ai-chat] Force SQL pass error:', err.message);
            }
        }

        // Si no hay SQL: solo permitir texto libre si NO es pregunta de datos (ej: guía de navegación o saludo)
        if (!sql) {
            if (isDataQuery) {
                return {
                    answer: 'Todavía no cuento con registros sobre eso en el sistema. Te sugiero verificar en el módulo correspondiente o reformular tu consulta.',
                };
            }
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
                const fixCompletion = await callAiWithFallback({
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: `La consulta SQL "${sql}" falló en PostgreSQL con el error: "${dbErr.message}". Pregunta del usuario: "${question}". Corregí la consulta respetando el esquema. Responde SOLO el bloque \`\`\`sql ... \`\`\`` }
                    ],
                    temperature: 0.1,
                    max_tokens: 600
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
        const formatCompletion = await callAiWithFallback({
            messages: [
                { role: 'system', content: buildFormatPrompt(question, data) },
                { role: 'user', content: 'Dame la respuesta ejecutiva.' },
            ],
            temperature: 0.3,
            max_tokens: 450,
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
        if (error.message?.includes('free-models-per-day') || error.message?.includes('Rate limit exceeded')) {
            return { answer: '⚠️ Se consumió el límite diario gratuito de OpenRouter (50 consultas/día en cuentas nuevas). Se renueva automáticamente al iniciar el día.' };
        }
        if (error.message?.includes('GROQ_API_KEY') || error.message?.includes('OPENROUTER_API_KEY') || error.message?.includes('API key')) {
            return { answer: 'El servicio de IA no está configurado.' };
        }
        if (error.message?.includes('Access denied') || error.message?.includes('403') || error.message?.includes('network settings')) {
            return { answer: '⚠️ Conexión rechazada por el proveedor de IA (bloqueo de red/geolocalización). Activá una VPN o Cloudflare WARP en tu equipo para conectar.' };
        }
        return { answer: 'No pude encontrar esa información en este momento. Por favor probá preguntármelo con otras palabras.' };
    }
};

// ─── Prompt para formatear respuestas naturales ──────────────────────────────
function buildFormatPrompt(question: string, data: any[]): string {
    return `Sos el asesor experto de TechLand ERP. El usuario preguntó: "${question}"

DATOS OFICIALES DE LA BASE DE DATOS (ÚNICA FUENTE DE VERDAD):
${JSON.stringify(data.slice(0, 30))}

REGLAS ESTRICTAS DE RESPUESTA (TOLERANCIA CERO A ALUCINACIONES):
- Tu respuesta debe basarse EXCLUSIVAMENTE en los datos del JSON anterior.
- TOTALMENTE PROHIBIDO inventar nombres de clientes, modelos, marcas, IMEIs, fechas, números de ticket o montos que no aparezcan en el JSON.
- Si el array está vacío ([] o 0 elementos), respondé EXACTAMENTE:
  "Todavía no cuento con registros que coincidan con esa consulta en el sistema."
- Si hay datos en el JSON, respondé con precisión, profesionalismo y tono ejecutivo, destacando números y datos clave en **negrita**.
- Máximo 3 a 4 oraciones concisas.
- NUNCA menciones SQL, tablas, consultas ni base de datos.
- Formato de moneda: $ para USD y Bs para Bolívares.`;
}

function formatDataFallback(data: any[]): string {
    if (!data || data.length === 0) return 'Todavía no cuento con registros sobre eso en el sistema.';
    if (data.length === 1) {
        const keys = Object.keys(data[0]);
        if (keys.length === 1) return `El resultado es **${data[0][keys[0]]}**.`;
    }
    return data.slice(0, 5).map(r => Object.entries(r).map(([k, v]) => `**${k}**: ${v}`).join(' · ')).join('\n');
}

// ─── Análisis de archivos subidos (CSV / Excel) ──────────────────────────────
export const analyzeUploadedFile = async (fileBuffer: Buffer, filename: string, question?: string): Promise<AiChatResponse> => {
    const aiConfig = getAiConfig();
    if (!aiConfig.provider) return { answer: 'El asistente de IA no está disponible temporalmente.' };
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

        const completion = await callAiWithFallback({
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

// ─── Persistencia de sesiones en memoria ─────────────────────────────────────
export interface ChatMessage { role: 'user' | 'assistant'; content: string; exportData?: any[] | null; timestamp: string; }

const sessionMemoryCache = new Map<string, ChatMessage[]>();

export const saveChatSession = async (userId: string, messages: ChatMessage[]): Promise<void> => {
    sessionMemoryCache.set(userId, messages);
};

export const loadChatSession = async (userId: string): Promise<ChatMessage[]> => {
    return sessionMemoryCache.get(userId) || [];
};

export const clearChatSession = async (userId: string): Promise<void> => {
    sessionMemoryCache.delete(userId);
};
