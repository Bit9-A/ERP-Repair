import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { MovimientoStock } from "../../types";

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
    let maxLen = 12; // Mínimo de ancho
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const val = cell.value?.toString() ?? "";
      if (val.length > maxLen) maxLen = val.length;
    });
    col.width = Math.min(maxLen + 4, 60);
  });
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

export async function exportInventoryMovementsExcel(
  movements: MovimientoStock[],
  sucursalContextName?: string,
  userName?: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ERP-Repair (Inventario)";
  workbook.created = new Date();

  const branchTitle = sucursalContextName ? ` — ${sucursalContextName}` : " — Global";
  const dateStr = new Date().toLocaleDateString("es-VE").replace(/\//g, "-");

  const ws = workbook.addWorksheet("Historial de Movimientos", {
    views: [{ state: "frozen", ySplit: 8 }], // Fila 8 es el cabezal de datos
  });

  // Título
  const titleRow = ws.addRow(["Reporte de Movimientos de Inventario" + branchTitle]);
  ws.mergeCells(1, 1, 1, 8);
  titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: "FF1E3A5F" } };
  titleRow.getCell(1).alignment = { horizontal: "center" };
  ws.addRow([]);

  // Info del reporte
  ws.addRow(["Fecha de Generación:", new Date().toLocaleString("es-VE")]);
  ws.addRow(["Generado por:", userName || "Administrador"]);
  ws.addRow(["Filtro de Sucursal:", sucursalContextName || "Todas las sucursales"]);
  ws.addRow(["Total Movimientos:", movements.length]);
  ws.addRow([]);

  // Aplicar negrita a los labels de la cabecera
  [3, 4, 5, 6].forEach((rowIndex) => {
    ws.getCell(`A${rowIndex}`).font = { bold: true };
  });

  // Configuramos la cabecera de las columnas
  const columns = [
    { header: "Fecha y Hora", key: "fecha", width: 22 },
    { header: "Tipo", key: "tipo", width: 20 },
    { header: "Producto", key: "producto", width: 40 },
    { header: "SKU", key: "sku", width: 16 },
    { header: "CANTIDAD", key: "cantidad", width: 12 },
    { header: "ORIGEN", key: "origen", width: 20 },
    { header: "DESTINO", key: "destino", width: 20 },
    { header: "Referencia", key: "referencia", width: 30 },
    { header: "Sucursal", key: "sucursal", width: 20 },
    { header: "USUARIO", key: "usuario", width: 25 },
  ];

  const headerRow = ws.addRow(columns.map((c) => c.header));
  styleHeaderRow(headerRow, columns.length);
  ws.autoFilter = `A8:${String.fromCharCode(64 + columns.length)}8`; // Adjust autoFilter range

  // Agregamos la data
  movements.forEach((mov, idx) => {
    const row = ws.addRow([
      dayjs(mov.createdAt).format("DD/MM/YYYY hh:mm A"),
      mov.tipo.replace(/[_]/g, " "),
      mov.producto?.nombre || "—",
      mov.producto?.sku || "—",
      mov.cantidad,
      mov.tipo === "TRASLADO" ? (mov.sucursal?.nombre || "N/A") : (mov.sucursal?.nombre || "N/A"),
      mov.tipo === "TRASLADO" ? (mov.sucursalDestino?.nombre || "N/A") : "N/A",
      mov.referencia || "—",
      mov.sucursal?.nombre || "Global",
      mov.usuario?.nombre || "Sistema / Desconocido",
    ]);

    // Alineación central de cantidades y fechas
    row.getCell(1).alignment = { horizontal: "center" }; // Fecha
    row.getCell(2).alignment = { horizontal: "left" }; // Tipo
    row.getCell(4).alignment = { horizontal: "center" }; // SKU
    row.getCell(5).alignment = { horizontal: "center" }; // Cantidad
    
    // Resaltar cantidad negativa vs positiva
    const cantCell = row.getCell(5);
    cantCell.font = { bold: true, color: { argb: mov.cantidad > 0 ? "FF047857" : "FFDC2626" } };

    styleDataRow(row, columns.length, idx % 2 === 1);
  });

  autoFitColumns(ws);

  // ─────────────────────────────────────────────────────────────
  // Generar y descargar
  // ─────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `Movimientos_Inventario_${dateStr}.xlsx`);
}
