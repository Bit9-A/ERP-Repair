import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Venta } from "../../types";
import { SALE_STATUS } from "../../lib/constants";
import dayjs from "dayjs";

// ── Helpers ───────────────────────────────────────────────────

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E40AF" }, // azul corporativo
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD1D5DB" } },
  left: { style: "thin", color: { argb: "FFD1D5DB" } },
  bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
  right: { style: "thin", color: { argb: "FFD1D5DB" } },
};

function autoFitColumns(worksheet: ExcelJS.Worksheet) {
  worksheet.columns.forEach((col) => {
    let maxLen = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const val = cell.value?.toString() ?? "";
      if (val.length > maxLen) maxLen = val.length;
    });
    col.width = Math.min(maxLen + 4, 50);
  });
}

function addTitleRow(
  worksheet: ExcelJS.Worksheet,
  title: string,
  colCount: number
) {
  const titleRow = worksheet.addRow([title]);
  worksheet.mergeCells(1, 1, 1, colCount);
  titleRow.getCell(1).font = { bold: true, size: 13, color: { argb: "FF1E3A5F" } };
  titleRow.getCell(1).alignment = { horizontal: "center" };
  titleRow.height = 26;
}

function styleHeaderRow(row: ExcelJS.Row, colCount: number) {
  for (let i = 1; i <= colCount; i++) {
    const cell = row.getCell(i);
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = THIN_BORDER;
  }
  row.height = 22;
}

function styleDataRow(row: ExcelJS.Row, colCount: number, isEven: boolean) {
  for (let i = 1; i <= colCount; i++) {
    const cell = row.getCell(i);
    cell.border = THIN_BORDER;
    if (isEven) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8FAFC" },
      };
    }
  }
}

// ── Main Export Function ──────────────────────────────────────

export async function exportSalesExcel(
  sales: Venta[],
  userName?: string
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ERP-Repair (Ventas Comerciales)";
  workbook.lastModifiedBy = userName || "Automated Export";
  workbook.created = new Date();
  
  const dateStr = dayjs().format("DD-MM-YYYY");

  // ─────────────────────────────────────────────────────────────
  // HOJA 1: RESUMEN EJECUTIVO (DASHBOARD)
  // ─────────────────────────────────────────────────────────────
  const ws0 = workbook.addWorksheet("Resumen Ejecutivo");
  ws0.columns = [{ width: 4 }, { width: 35 }, { width: 25 }, { width: 15 }];
  
  // Título
  const titleRow = ws0.addRow(["", "Reporte General de Ventas Comerciales"]);
  titleRow.getCell(2).font = { bold: true, size: 16, color: { argb: "FF1E3A5F" } };
  ws0.addRow([]);

  // Info del reporte
  ws0.addRow(["", "Fecha de Emisión:", dayjs().format("DD/MM/YYYY HH:mm A")]);
  ws0.addRow(["", "Generado por:", userName || "Administrador"]);
  ws0.addRow([]);

  // Calcular KPIs
  const ventasExitosas = sales.filter((s) => s.estado === "PAGADA").length;
  const ingresosTotales = sales
    .filter((s) => s.estado === "PAGADA")
    .reduce((sum, s) => sum + s.total_usd, 0);
  const ventasAnuladas = sales.filter((s) => s.estado === "ANULADA").length;
  const ventasPendientes = sales.filter((s) => s.estado === "PENDIENTE").length;

  // Render KPIs
  const kpiRow = ws0.addRow(["", "🔑 MÉTRICAS CLAVE"]);
  kpiRow.getCell(2).font = { bold: true, size: 12, color: { argb: "FF1E40AF" } };
  ws0.addRow(["", "Ventas Pagadas (Exitosas):", ventasExitosas]);
  const penRow = ws0.addRow(["", "Ventas Pendientes por Pago:", ventasPendientes]);
  penRow.getCell(3).font = { bold: true };
  ws0.addRow([]);

  const alertRow = ws0.addRow(["", "⚠️ ALERTAS DE CAJA"]);
  alertRow.getCell(2).font = { bold: true, size: 12, color: { argb: "FFC2410C" } };
  const abanRow = ws0.addRow(["", "Ventas Anuladas / Canceladas:", ventasAnuladas]);
  if (ventasAnuladas > 0) abanRow.getCell(3).font = { color: { argb: "FFDC2626" }, bold: true };
  ws0.addRow([]);

  const finRow = ws0.addRow(["", "💰 FINANZAS GLOBALES"]);
  finRow.getCell(2).font = { bold: true, size: 12, color: { argb: "FF047857" } };
  const totalRow = ws0.addRow(["", "Ingresos Totales (Solo Pagados):", ingresosTotales]);
  totalRow.getCell(3).numFmt = '"$"#,##0.00';
  totalRow.getCell(3).font = { bold: true, color: { argb: "FF047857" } };

  // Bordes sutiles
  ws0.eachRow((row, index) => {
    if (index >= 9 && index <= 20 && row.getCell(2).value && row.getCell(3).value !== undefined) {
      if (!row.getCell(2).value?.toString().includes("🔑") && !row.getCell(2).value?.toString().includes("⚠️") && !row.getCell(2).value?.toString().includes("💰")) {
        row.getCell(2).border = { bottom: { style: "dotted", color: { argb: "FFD1D5DB" } } };
        row.getCell(3).border = { bottom: { style: "dotted", color: { argb: "FFD1D5DB" } } };
      }
    }
  });


  // ─────────────────────────────────────────────────────────────
  // HOJA 2: LISTADO DE VENTAS COMERCIALES
  // ─────────────────────────────────────────────────────────────
  const ws1 = workbook.addWorksheet("Listado de Ventas", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  const columns = [
    { header: "Factura", key: "factura", width: 12 },
    { header: "Fecha", key: "fecha", width: 18 },
    { header: "Cliente", key: "cliente", width: 30 },
    { header: "Cédula/ID", key: "cedula", width: 15 },
    { header: "Vendedor", key: "vendedor", width: 25 },
    { header: "Estado", key: "estado", width: 15 },
    { header: "Subtotal", key: "subtotal", width: 15 },
    { header: "Descuento", key: "descuento", width: 15 },
    { header: "Total", key: "total", width: 15 },
    { header: "Método(s)", key: "metodos", width: 20 },
    { header: "Pagado (Local)", key: "moneda_local", width: 25 },
    { header: "Tasa Aplicada", key: "tasa", width: 25 },
  ];

  addTitleRow(ws1, "Listado Detallado de Ventas Comerciales", columns.length);
  const headerRow2 = ws1.addRow(columns.map(c => c.header));
  styleHeaderRow(headerRow2, columns.length);
  ws1.autoFilter = "A2:L2";

  // Data processing
  // Sort sales chronologically backwards
  const sortedSales = [...sales].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  sortedSales.forEach((sale, i) => {
    const metodos = sale.pagos?.map((p: any) => p.metodo).join(", ") || "No registrado";
    const est = SALE_STATUS[sale.estado]?.label || sale.estado;
    
    // Formatting currency & rate info
    let pagosLocales = "";
    let tasasUsadas = "—";

    if (sale.pagos && sale.pagos.length > 0) {
      pagosLocales = sale.pagos.map((p: any) => {
        const amt = p.monto_moneda_local.toLocaleString("es-VE", { minimumFractionDigits: 2 });
        const currency = p.moneda?.codigo || "";
        return `${amt} ${currency}`;
      }).join(" + ");

      const rates = new Set<string>();
      sale.pagos.forEach((p: any) => {
        if (p.moneda?.codigo && p.moneda.codigo !== "USD" && p.tasa_cambio_usada) {
          rates.add(`${p.tasa_cambio_usada.toFixed(2)} ${p.moneda.codigo}/USD`);
        }
      });
      if (rates.size > 0) {
        tasasUsadas = Array.from(rates).join(" | ");
      }
    }

    // fallback si no hay pagos pero hay snapshot y no encontro tasa (retrocompatibilidad)
    if (tasasUsadas === "—" && sale.tasas_cambio_snapshot && Object.keys(sale.tasas_cambio_snapshot).length > 0) {
      const snap = sale.tasas_cambio_snapshot as Record<string, number>;
      if (snap["VES"]) {
        tasasUsadas = `${snap["VES"].toFixed(2)} VES/USD (Ref)`;
      }
    }

    if (!pagosLocales) pagosLocales = "—";

    const row = ws1.addRow([
      `V-${sale.numero}`,
      dayjs(sale.createdAt).format("DD/MM/YYYY"),
      sale.cliente?.nombre || "Sin Cliente",
      sale.cliente?.cedula || "—",
      sale.vendedor?.nombre || "N/A",
      est,
      sale.subtotal_usd,
      sale.descuento_usd,
      sale.total_usd,
      metodos,
      pagosLocales,
      tasasUsadas
    ]);

    row.getCell(1).font = { bold: true };
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "center" };
    row.getCell(4).alignment = { horizontal: "center" };
    row.getCell(6).alignment = { horizontal: "center" };
    
    // Monetary Formatting
    [7, 8, 9].forEach((colIdx) => {
      row.getCell(colIdx).numFmt = '"$"#,##0.00';
      row.getCell(colIdx).alignment = { horizontal: "right" };
    });

    // Color condicional del estado
    if (sale.estado === "ANULADA") {
       row.getCell(6).font = { color: { argb: "FFDC2626" }, strike: true, bold: true };
       row.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
    } else if (sale.estado === "PENDIENTE") {
       row.getCell(6).font = { color: { argb: "FFD97706" }, bold: true };
       row.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFEDD5" } };
    } else {
       row.getCell(6).font = { color: { argb: "FF047857" }, bold: true };
    }

    styleDataRow(row, columns.length, i % 2 === 1);
  });

  autoFitColumns(ws1);

  // ─────────────────────────────────────────────────────────────
  // Generar y descargar
  // ─────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `Ventas_Comerciales_${dateStr}.xlsx`);
}
