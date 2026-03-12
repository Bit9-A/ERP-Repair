import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Producto } from "../../types";

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

const TOTAL_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE2E8F0" },
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

function styleTotalRow(row: ExcelJS.Row, colCount: number) {
  for (let i = 1; i <= colCount; i++) {
    const cell = row.getCell(i);
    cell.fill = TOTAL_FILL;
    cell.font = { bold: true, size: 11 };
    cell.border = THIN_BORDER;
  }
  row.height = 20;
}

// ── Main Export Function ──────────────────────────────────────

export async function exportInventoryExcel(
  products: Producto[],
  sucursalContextName?: string,
  userName?: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ERP-Repair (Inventario)";
  workbook.created = new Date();

  const dateStr = new Date().toLocaleDateString("es-VE").replace(/\//g, "-");
  const branchTitle = sucursalContextName ? ` — ${sucursalContextName}` : " — Global";

  const getCatIcon = (cat: string) => {
    if (cat === "EQUIPO") return "📱 EQUIPO";
    if (cat === "ACCESORIO") return "🎧 ACCESORIO";
    if (cat === "REPUESTO") return "🔧 REPUESTO";
    return cat;
  };

  // ─────────────────────────────────────────────────────────────
  // HOJA 1: RESUMEN EJECUTIVO (DASHBOARD)
  // ─────────────────────────────────────────────────────────────
  const ws0 = workbook.addWorksheet("Resumen Ejecutivo");
  ws0.columns = [{ width: 4 }, { width: 35 }, { width: 25 }, { width: 15 }];
  
  // Título
  const titleRow = ws0.addRow(["", "Reporte General de Inventario"]);
  titleRow.getCell(2).font = { bold: true, size: 16, color: { argb: "FF1E3A5F" } };
  ws0.addRow([]);

  // Info del reporte
  ws0.addRow(["", "Fecha de Emisión:", new Date().toLocaleString("es-VE")]);
  ws0.addRow(["", "Generado por:", userName || "Administrador"]);
  ws0.addRow(["", "Sucursal / Filtro:", sucursalContextName || "Global"]);
  ws0.addRow([]);

  // KPIs
  const totalItems = products.length;
  let totalInversion = 0;
  let totalVentaPotencial = 0;
  let stockCritico = 0;
  let catEquipos = 0;
  let catRepuestos = 0;
  let catAccesorios = 0;

  products.forEach(p => {
    totalInversion += p.stock_actual * (p.costo_usd ?? 0);
    totalVentaPotencial += p.stock_actual * (p.precio_usd ?? 0);
    if (p.stock_actual <= p.stock_minimo) stockCritico++;
    
    if (p.categoria === "EQUIPO") catEquipos++;
    if (p.categoria === "REPUESTO") catRepuestos++;
    if (p.categoria === "ACCESORIO") catAccesorios++;
  });

  const margenTotal = totalInversion > 0 
    ? ((totalVentaPotencial - totalInversion) / totalInversion) * 100 
    : 0;

  const kpiRow = ws0.addRow(["", "🔑 MÉTRICAS CLAVE"]);
  kpiRow.getCell(2).font = { bold: true, size: 12, color: { argb: "FF1E40AF" } };
  ws0.addRow(["", "Total de Artículos en Catálogo:", totalItems]);
  const stockRow = ws0.addRow(["", "Artículos en Stock Crítico / Agotados:", stockCritico]);
  stockRow.getCell(3).font = { color: { argb: "FFDC2626" }, bold: true };
  ws0.addRow([]);

  const finRow = ws0.addRow(["", "💰 FINANZAS PROYECTADAS"]);
  finRow.getCell(2).font = { bold: true, size: 12, color: { argb: "FF047857" } };
  
  const invRow = ws0.addRow(["", "Valorización Total (Inversión):", totalInversion]);
  invRow.getCell(3).numFmt = '"$"#,##0.00';
  
  const potRow = ws0.addRow(["", "Venta Potencial Bruta:", totalVentaPotencial]);
  potRow.getCell(3).numFmt = '"$"#,##0.00';
  
  const marRow = ws0.addRow(["", "Margen de Ganancia Global:", `${margenTotal.toFixed(2)}%`]);
  marRow.getCell(3).font = { bold: true, color: { argb: margenTotal > 0 ? "FF047857" : "FFDC2626" } };
  ws0.addRow([]);

  const catRow = ws0.addRow(["", "📦 DESGLOSE POR CATEGORÍA"]);
  catRow.getCell(2).font = { bold: true, size: 12 };
  ws0.addRow(["", "📱 Equipos:", catEquipos]);
  ws0.addRow(["", "🎧 Accesorios:", catAccesorios]);
  ws0.addRow(["", "🔧 Repuestos:", catRepuestos]);
  
  // Bordes sutiles en las tablas del dashboard
  ws0.eachRow((row, index) => {
    if (index >= 9 && index <= 21 && row.getCell(2).value && row.getCell(3).value !== undefined) {
      if (!row.getCell(2).value?.toString().includes("🔑") && !row.getCell(2).value?.toString().includes("💰") && !row.getCell(2).value?.toString().includes("📦")) {
        row.getCell(2).border = { bottom: { style: "dotted", color: { argb: "FFD1D5DB" } } };
        row.getCell(3).border = { bottom: { style: "dotted", color: { argb: "FFD1D5DB" } } };
      }
    }
  });

  // ─────────────────────────────────────────────────────────────
  // HOJA 2: CATÁLOGO Y STOCK
  // ─────────────────────────────────────────────────────────────
  const ws1 = workbook.addWorksheet("Catálogo y Stock", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  const catColumns = [
    { header: "Categoría", key: "cat", width: 16 },
    { header: "Marca", key: "marca", width: 14 },
    { header: "Modelo", key: "modelo", width: 16 },
    { header: "Nombre", key: "nombre", width: 30 },
    { header: "SKU", key: "sku", width: 16 },
    { header: "Costo Proveedor", key: "costo", width: 16 },
    { header: "Precio Cliente", key: "precio", width: 16 },
    { header: "Stock Actual", key: "stock_actual", width: 14 },
    { header: "Stock Mínimo", key: "stock_minimo", width: 14 },
  ];

  addTitleRow(ws1, `Catálogo y Existencias${branchTitle}`, catColumns.length);
  const catHeaderRow = ws1.addRow(catColumns.map(c => c.header));
  styleHeaderRow(catHeaderRow, catColumns.length);
  ws1.autoFilter = 'A2:I2';

  products.forEach((p, idx) => {
    const row = ws1.addRow([
      getCatIcon(p.categoria),
      p.marca_comp,
      p.modelo_comp,
      p.nombre,
      p.sku ?? "—",
      p.costo_usd,
      p.precio_usd,
      p.stock_actual,
      p.stock_minimo,
    ]);

    // Align monetary
    row.getCell(6).numFmt = '"$"#,##0.00';
    row.getCell(6).alignment = { horizontal: "right" };
    row.getCell(7).numFmt = '"$"#,##0.00';
    row.getCell(7).alignment = { horizontal: "right" };
    row.getCell(8).alignment = { horizontal: "center" };
    row.getCell(9).alignment = { horizontal: "center" };

    // Format low stock
    if (p.stock_actual <= p.stock_minimo) {
      row.getCell(8).font = { color: { argb: "FFDC2626" }, bold: true };
      row.getCell(8).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
    }

    styleDataRow(row, catColumns.length, idx % 2 === 1);
  });

  autoFitColumns(ws1);

  // ─────────────────────────────────────────────────────────────
  // HOJA 3: VALORIZACIÓN Y MÁRGENES
  // ─────────────────────────────────────────────────────────────
  const ws2 = workbook.addWorksheet("Valorización y Márgenes", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  const valColumns = [
    { header: "Clasificación", key: "grupo", width: 18 },
    { header: "SKU", key: "sku", width: 16 },
    { header: "Producto", key: "producto", width: 34 },
    { header: "Stock Actual", key: "stock", width: 14 },
    { header: "Costo Unitario", key: "costo", width: 16 },
    { header: "Valor Total", key: "total", width: 16 },
    { header: "Margen (%)", key: "margen", width: 14 },
  ];

  addTitleRow(ws2, `Valorización de Inventario${branchTitle}`, valColumns.length);
  const valHeaderRow = ws2.addRow(valColumns.map(c => c.header));
  styleHeaderRow(valHeaderRow, valColumns.length);
  ws2.autoFilter = 'A2:G2';

  let totalValor = 0;

  products.forEach((p, idx) => {
    const stVal = p.stock_actual * (p.costo_usd ?? 0);
    const margen = (p.precio_usd > 0 && p.costo_usd > 0) 
      ? (((p.precio_usd - p.costo_usd) / p.costo_usd) * 100)
      : 0;

    const row = ws2.addRow([
      getCatIcon(p.categoria),
      p.sku ?? "—",
      p.nombre,
      p.stock_actual,
      p.costo_usd ?? 0,
      stVal,
      margen !== 0 ? `${margen.toFixed(1)}%` : "N/A",
    ]);

    row.getCell(4).alignment = { horizontal: "center" };
    row.getCell(5).numFmt = '"$"#,##0.00';
    row.getCell(5).alignment = { horizontal: "right" };
    row.getCell(6).numFmt = '"$"#,##0.00';
    row.getCell(6).alignment = { horizontal: "right" };
    row.getCell(7).alignment = { horizontal: "center" };

    if (margen > 0 && margen <= 15) {
      row.getCell(7).font = { color: { argb: "FFC2410C" }, bold: true };
      row.getCell(7).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFEDD5" } };
    }

    totalValor += stVal;
    styleDataRow(row, valColumns.length, idx % 2 === 1);
  });

  // Fila de TOTAL
  const valTotalRow = ws2.addRow([
    "TOTAL VALORIZADO", "", "", "", "",
    totalValor, ""
  ]);
  valTotalRow.getCell(6).numFmt = '"$"#,##0.00';
  valTotalRow.getCell(6).alignment = { horizontal: "right" };
  valTotalRow.getCell(6).font = { bold: true, color: { argb: "FF047857" } };
  styleTotalRow(valTotalRow, valColumns.length);
  // Merge total cells for aesthetics
  ws2.mergeCells(valTotalRow.number, 1, valTotalRow.number, 5);
  valTotalRow.getCell(1).alignment = { horizontal: "right" };

  autoFitColumns(ws2);

  // ─────────────────────────────────────────────────────────────
  // Generar y descargar
  // ─────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `Inventario_${dateStr}.xlsx`);
}
