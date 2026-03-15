import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

type Periodo = "dia" | "semana" | "mes" | string;

// ── Types (matching the API shapes) ──────────────────────────

interface Moneda {
  codigo: string;
  nombre?: string;
}

interface Pago {
  id: string;
  fecha_pago: string;
  equivalente_usd: number;
  monto_moneda_local: number;
  metodo: string;
  referencia?: string | null;
  moneda?: Moneda;
  ticket?: {
    id: string;
    equipo?: string;
    marca?: string;
    modelo?: string;
    cliente?: { nombre?: string };
  } | null;
  venta?: {
    id: string;
    numero?: number;
    total_usd?: number;
    cliente?: { nombre?: string };
    items?: { producto: { nombre: string } }[];
  } | null;
}

interface Egreso {
  id: string;
  createdAt: string;
  concepto: string;
  categoria?: string | null;
  esFijo?: boolean;
  monto_usd: number;
}

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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

export async function exportFinanceExcel(
  pagos: Pago[],
  egresos: Egreso[],
  periodo: Periodo
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ERP-Repair";
  workbook.created = new Date();

  const periodoLabels: Record<string, string> = {
    dia: "Día",
    semana: "Semana",
    mes: "Mes",
  };
  let periodoLabel = periodoLabels[periodo];
  if (!periodoLabel) {
    if (/^\d{4}-\d{2}$/.test(periodo)) {
      const [y, m] = periodo.split("-");
      periodoLabel = `${m}-${y}`;
    } else {
      periodoLabel = periodo;
    }
  }
  
  const dateStr = new Date().toLocaleDateString("es-VE").replace(/\//g, "-");

  // ─────────────────────────────────────────────────────────────
  // HOJA 1: INGRESOS
  // ─────────────────────────────────────────────────────────────
  const wsIngresos = workbook.addWorksheet("Ingresos (Pagos)", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  const ingresosColumns = [
    { header: "Fecha", key: "fecha", width: 20 },
    { header: "Ref.", key: "ref", width: 14 },
    { header: "Origen", key: "origen", width: 14 },
    { header: "Cliente", key: "cliente", width: 24 },
    { header: "Equipo / Producto", key: "equipo", width: 26 },
    { header: "Método de Pago", key: "metodo", width: 18 },
    { header: "Referencia", key: "referencia", width: 18 },
    { header: "Moneda", key: "moneda", width: 10 },
    { header: "Monto Local", key: "montoLocal", width: 16 },
    { header: "Equivalente USD", key: "montoUSD", width: 18 },
  ];

  addTitleRow(wsIngresos, `Reporte de Ingresos — ${periodoLabel}`, ingresosColumns.length);
  const ingHeaderRow = wsIngresos.addRow(ingresosColumns.map((c) => c.header));
  styleHeaderRow(ingHeaderRow, ingresosColumns.length);

  let totalIngresosUSD = 0;

  pagos.forEach((pago, idx) => {
    const ref = pago.venta?.numero
      ? `V-${pago.venta.numero}`
      : pago.ticket?.id
        ? `T-${pago.ticket.id.substring(0, 6)}`
        : "—";

    const origen = pago.venta ? "Venta" : pago.ticket ? "Reparación" : "Otro";

    const cliente =
      pago.venta?.cliente?.nombre ??
      pago.ticket?.cliente?.nombre ??
      "Sin Cliente";

    const equipo = pago.ticket
      ? `${pago.ticket.marca ?? ""} ${pago.ticket.modelo ?? ""}`.trim()
      : pago.venta?.items?.map((it) => it.producto.nombre).join(", ") ?? "—";

    const row = wsIngresos.addRow([
      formatDate(pago.fecha_pago),
      ref,
      origen,
      cliente,
      equipo,
      pago.metodo.replace("_", " "),
      pago.referencia ?? "—",
      pago.moneda?.codigo ?? "—",
      pago.monto_moneda_local,
      pago.equivalente_usd,
    ]);

    // Right-align monetary columns
    row.getCell(9).numFmt = '#,##0.00';
    row.getCell(9).alignment = { horizontal: "right" };
    row.getCell(10).numFmt = '"$"#,##0.00';
    row.getCell(10).alignment = { horizontal: "right" };

    styleDataRow(row, ingresosColumns.length, idx % 2 === 1);
    totalIngresosUSD += pago.equivalente_usd;
  });

  // Fila de TOTAL
  const ingTotalRow = wsIngresos.addRow([
    "TOTAL",
    "", "", "", "", "", "", "",
    "",
    totalIngresosUSD,
  ]);
  ingTotalRow.getCell(10).numFmt = '"$"#,##0.00';
  ingTotalRow.getCell(10).alignment = { horizontal: "right" };
  styleTotalRow(ingTotalRow, ingresosColumns.length);

  autoFitColumns(wsIngresos);

  // ─────────────────────────────────────────────────────────────
  // HOJA 2: EGRESOS
  // ─────────────────────────────────────────────────────────────
  const wsEgresos = workbook.addWorksheet("Egresos (Gastos)", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  const egresosColumns = [
    { header: "Fecha", key: "fecha", width: 18 },
    { header: "Concepto", key: "concepto", width: 32 },
    { header: "Categoría", key: "categoria", width: 20 },
    { header: "Es Fijo", key: "esFijo", width: 12 },
    { header: "Monto USD", key: "montoUSD", width: 16 },
  ];

  addTitleRow(wsEgresos, `Reporte de Egresos — ${periodoLabel}`, egresosColumns.length);
  const egHeaderRow = wsEgresos.addRow(egresosColumns.map((c) => c.header));
  styleHeaderRow(egHeaderRow, egresosColumns.length);

  let totalEgresosUSD = 0;

  egresos.forEach((egreso, idx) => {
    const row = wsEgresos.addRow([
      formatDateShort(egreso.createdAt),
      egreso.concepto,
      egreso.categoria ?? "OTROS",
      egreso.esFijo ? "Sí" : "No",
      egreso.monto_usd,
    ]);

    row.getCell(5).numFmt = '"$"#,##0.00';
    row.getCell(5).alignment = { horizontal: "right" };
    // Red font for egreso amounts
    row.getCell(5).font = { color: { argb: "FFDC2626" } };

    styleDataRow(row, egresosColumns.length, idx % 2 === 1);
    totalEgresosUSD += egreso.monto_usd;
  });

  // Fila de TOTAL
  const egTotalRow = wsEgresos.addRow([
    "TOTAL", "", "", "",
    totalEgresosUSD,
  ]);
  egTotalRow.getCell(5).numFmt = '"$"#,##0.00';
  egTotalRow.getCell(5).alignment = { horizontal: "right" };
  egTotalRow.getCell(5).font = { bold: true, color: { argb: "FFDC2626" } };
  styleTotalRow(egTotalRow, egresosColumns.length);

  autoFitColumns(wsEgresos);

  // ─────────────────────────────────────────────────────────────
  // Generar y descargar
  // ─────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `Finanzas_${periodoLabel}_${dateStr}.xlsx`);
}
