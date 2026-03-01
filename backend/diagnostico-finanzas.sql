-- ================================================================
-- ERP-Repair: Diagnóstico Financiero
-- Ejecuta en pgAdmin contra la base de datos "railway"
-- ================================================================

-- 1. Últimas 10 ventas con su estado y total
SELECT 
  v.numero,
  v.estado,
  v.total_usd,
  v.created_at,
  c.nombre AS cliente
FROM "Venta" v
LEFT JOIN "Cliente" c ON v."clienteId" = c.id
ORDER BY v.created_at DESC
LIMIT 10;

-- ================================================================

-- 2. Pagos registrados hoy
SELECT 
  p.id,
  p.equivalente_usd,
  p.metodo,
  p.fecha_pago,
  p."ventaId",
  p."ticketId"
FROM "Pago" p
WHERE p.fecha_pago >= CURRENT_DATE
ORDER BY p.fecha_pago DESC;

-- ================================================================

-- 3. Transacciones Financieras de hoy (INGRESO y EGRESO)
SELECT 
  t.tipo,
  t.monto_usd,
  t.concepto,
  t.categoria,
  t."createdAt",
  t."ventaId",
  t."ticketId"
FROM "TransaccionFinanciera" t
WHERE t."createdAt" >= CURRENT_DATE
ORDER BY t."createdAt" DESC;

-- ================================================================

-- 4. Suma de ingresos y egresos de hoy
SELECT
  tipo,
  COUNT(*) AS cantidad,
  SUM(monto_usd) AS total_usd
FROM "TransaccionFinanciera"
WHERE "createdAt" >= CURRENT_DATE
GROUP BY tipo;

-- ================================================================

-- 5. Ventas sin pago asociado (potencial bug)
SELECT 
  v.numero,
  v.estado,
  v.total_usd,
  v.created_at,
  COUNT(p.id) AS pagos_registrados
FROM "Venta" v
LEFT JOIN "Pago" p ON p."ventaId" = v.id
GROUP BY v.id, v.numero, v.estado, v.total_usd, v.created_at
HAVING COUNT(p.id) = 0
ORDER BY v.created_at DESC;

-- ================================================================

-- 6. Ventas sin TransaccionFinanciera (doble verificación del bug)
SELECT 
  v.numero,
  v.estado,
  v.total_usd,
  v.created_at
FROM "Venta" v
WHERE NOT EXISTS (
  SELECT 1 FROM "TransaccionFinanciera" t
  WHERE t."ventaId" = v.id AND t.tipo = 'INGRESO'
)
ORDER BY v.created_at DESC
LIMIT 10;
