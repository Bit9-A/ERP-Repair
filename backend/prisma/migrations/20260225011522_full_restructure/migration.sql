-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'TECNICO', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('RECIBIDO', 'EN_REVISION', 'ESPERANDO_REPUESTO', 'REPARADO', 'ENTREGADO', 'ABANDONO');

-- CreateEnum
CREATE TYPE "CategoriaProducto" AS ENUM ('EQUIPO', 'ACCESORIO', 'REPUESTO');

-- CreateEnum
CREATE TYPE "TipoPropiedad" AS ENUM ('PROPIA', 'PRESTADA');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('PENDIENTE', 'PAGADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA_REPARACION', 'SALIDA_VENTA', 'AJUSTE', 'DEVOLUCION');

-- CreateEnum
CREATE TYPE "TipoTransaccion" AS ENUM ('INGRESO', 'EGRESO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "porcentaje_comision_base" DOUBLE PRECISION NOT NULL DEFAULT 0.40,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca_comp" TEXT,
    "modelo_comp" TEXT,
    "categoria" "CategoriaProducto" NOT NULL DEFAULT 'REPUESTO',
    "propiedad" "TipoPropiedad" NOT NULL DEFAULT 'PROPIA',
    "propietario" TEXT,
    "stock_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 2,
    "costo_usd" DOUBLE PRECISION NOT NULL,
    "precio_usd" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoStock" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "referencia" TEXT,
    "nota" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio_usd" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketReparacion" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tecnicoId" TEXT,
    "equipo" TEXT,
    "tipo_equipo" TEXT NOT NULL DEFAULT 'Smartphone',
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "imei" TEXT,
    "clave" TEXT,
    "patron_visual" TEXT,
    "checklist" JSONB,
    "falla" TEXT NOT NULL,
    "falla_reportada" TEXT,
    "observaciones" TEXT,
    "estado" "EstadoTicket" NOT NULL DEFAULT 'RECIBIDO',
    "costo_repuestos_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precio_total_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "porcentaje_tecnico" DOUBLE PRECISION NOT NULL DEFAULT 0.40,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega" TIMESTAMP(3),

    CONSTRAINT "TicketReparacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket_Producto" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_congelado_usd" DOUBLE PRECISION NOT NULL,
    "costo_congelado_usd" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Ticket_Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket_Servicio" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "precio_cobrado_usd" DOUBLE PRECISION NOT NULL,
    "comision_tecnico_usd" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Ticket_Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "clienteId" TEXT,
    "vendedorId" TEXT,
    "subtotal_usd" DOUBLE PRECISION NOT NULL,
    "descuento_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_usd" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoVenta" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta_Producto" (
    "id" TEXT NOT NULL,
    "ventaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_congelado_usd" DOUBLE PRECISION NOT NULL,
    "costo_congelado_usd" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Venta_Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moneda" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT,
    "tasa_cambio" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Moneda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT,
    "ventaId" TEXT,
    "monedaId" TEXT NOT NULL,
    "monto_moneda_local" DOUBLE PRECISION NOT NULL,
    "equivalente_usd" DOUBLE PRECISION NOT NULL,
    "metodo" TEXT NOT NULL,
    "referencia" TEXT,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaccionFinanciera" (
    "id" TEXT NOT NULL,
    "tipo" "TipoTransaccion" NOT NULL,
    "monto_usd" DOUBLE PRECISION NOT NULL,
    "concepto" TEXT NOT NULL,
    "categoria" TEXT,
    "ticketId" TEXT,
    "ventaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransaccionFinanciera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombre_local" TEXT NOT NULL,
    "porcentaje_defecto" DOUBLE PRECISION NOT NULL DEFAULT 0.40,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cedula_key" ON "Cliente"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_sku_key" ON "Producto"("sku");

-- CreateIndex
CREATE INDEX "Producto_categoria_idx" ON "Producto"("categoria");

-- CreateIndex
CREATE INDEX "Producto_propiedad_idx" ON "Producto"("propiedad");

-- CreateIndex
CREATE INDEX "MovimientoStock_productoId_idx" ON "MovimientoStock"("productoId");

-- CreateIndex
CREATE INDEX "MovimientoStock_tipo_idx" ON "MovimientoStock"("tipo");

-- CreateIndex
CREATE INDEX "MovimientoStock_createdAt_idx" ON "MovimientoStock"("createdAt");

-- CreateIndex
CREATE INDEX "TicketReparacion_estado_idx" ON "TicketReparacion"("estado");

-- CreateIndex
CREATE INDEX "TicketReparacion_fecha_ingreso_idx" ON "TicketReparacion"("fecha_ingreso");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_codigo_key" ON "Venta"("codigo");

-- CreateIndex
CREATE INDEX "Venta_estado_idx" ON "Venta"("estado");

-- CreateIndex
CREATE INDEX "Venta_createdAt_idx" ON "Venta"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Moneda_codigo_key" ON "Moneda"("codigo");

-- CreateIndex
CREATE INDEX "Pago_fecha_pago_idx" ON "Pago"("fecha_pago");

-- CreateIndex
CREATE INDEX "TransaccionFinanciera_tipo_idx" ON "TransaccionFinanciera"("tipo");

-- CreateIndex
CREATE INDEX "TransaccionFinanciera_createdAt_idx" ON "TransaccionFinanciera"("createdAt");

-- CreateIndex
CREATE INDEX "TransaccionFinanciera_categoria_idx" ON "TransaccionFinanciera"("categoria");

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketReparacion" ADD CONSTRAINT "TicketReparacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketReparacion" ADD CONSTRAINT "TicketReparacion_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket_Producto" ADD CONSTRAINT "Ticket_Producto_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TicketReparacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket_Producto" ADD CONSTRAINT "Ticket_Producto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket_Servicio" ADD CONSTRAINT "Ticket_Servicio_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TicketReparacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket_Servicio" ADD CONSTRAINT "Ticket_Servicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta_Producto" ADD CONSTRAINT "Venta_Producto_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta_Producto" ADD CONSTRAINT "Venta_Producto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_monedaId_fkey" FOREIGN KEY ("monedaId") REFERENCES "Moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TicketReparacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaccionFinanciera" ADD CONSTRAINT "TransaccionFinanciera_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TicketReparacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaccionFinanciera" ADD CONSTRAINT "TransaccionFinanciera_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
