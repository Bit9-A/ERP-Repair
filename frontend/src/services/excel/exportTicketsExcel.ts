import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { TicketReparacion } from "../../types";
import { TICKET_STATUS } from "../../lib/constants";
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

export async function exportTicketsExcel(
  tickets: TicketReparacion[],
  userName?: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ERP-Repair (Órdenes de Servicio)";
  workbook.created = new Date();

  const dateStr = new Date().toLocaleDateString("es-VE").replace(/\//g, "-");

  // ─────────────────────────────────────────────────────────────
  // HOJA 1: RESUMEN EJECUTIVO (DASHBOARD)
  // ─────────────────────────────────────────────────────────────
  const ws0 = workbook.addWorksheet("Resumen Ejecutivo");
  ws0.columns = [{ width: 4 }, { width: 35 }, { width: 25 }, { width: 15 }];
  
  // Título
  const titleRow = ws0.addRow(["", "Reporte General de Servicio Técnico"]);
  titleRow.getCell(2).font = { bold: true, size: 16, color: { argb: "FF1E3A5F" } };
  ws0.addRow([]);

  // Info del reporte
  ws0.addRow(["", "Fecha de Emisión:", new Date().toLocaleString("es-VE")]);
  ws0.addRow(["", "Generado por:", userName || "Administrador"]);
  ws0.addRow([]);

  // KPIs
  const totalTickets = tickets.length;
  let totalCobrado = 0;
  let pendientes = 0;
  let entregados = 0;
  let abandonos = 0;
  let retrasados = 0; // Mas de 30 días sin entregar

  tickets.forEach(ticket => {
    const diasTranscurridos = dayjs().diff(dayjs(ticket.fecha_ingreso), "day");
    
    if (ticket.estado === "ENTREGADO") {
      entregados++;
      totalCobrado += ticket.precio_total_usd || 0;
    } else if (ticket.estado === "ABANDONO") {
      abandonos++;
    } else {
      pendientes++;
      if (diasTranscurridos >= 30) retrasados++;
    }
  });

  const kpiRow = ws0.addRow(["", "🔑 MÉTRICAS CLAVE"]);
  kpiRow.getCell(2).font = { bold: true, size: 12, color: { argb: "FF1E40AF" } };
  ws0.addRow(["", "Total Histórico de Órdenes:", totalTickets]);
  ws0.addRow(["", "Órdenes Exitosas (Entregadas):", entregados]);
  const penRow = ws0.addRow(["", "Órdenes Activas (En Proceso):", pendientes]);
  penRow.getCell(3).font = { bold: true };
  ws0.addRow([]);

  const alertRow = ws0.addRow(["", "⚠️ ALERTAS DEL TALLER"]);
  alertRow.getCell(2).font = { bold: true, size: 12, color: { argb: "FFC2410C" } };
  const retRow = ws0.addRow(["", "Retrasados (Más de 30 días activos):", retrasados]);
  if (retrasados > 0) retRow.getCell(3).font = { color: { argb: "FFC2410C" }, bold: true };
  const abanRow = ws0.addRow(["", "Equipos en Abandono:", abandonos]);
  if (abandonos > 0) abanRow.getCell(3).font = { color: { argb: "FFDC2626" }, bold: true };
  ws0.addRow([]);

  const finRow = ws0.addRow(["", "💰 FINANZAS POR SERVICIOS"]);
  finRow.getCell(2).font = { bold: true, size: 12, color: { argb: "FF047857" } };
  const totalRow = ws0.addRow(["", "Total Ingresos Brutos Cobrados:", totalCobrado]);
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
  // HOJA 2: LISTADO DE ÓRDENES
  // ─────────────────────────────────────────────────────────────
  const ws1 = workbook.addWorksheet("Listado de Órdenes", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  const columns = [
    { header: "Orden #", key: "orden", width: 14 },
    { header: "Cliente", key: "cliente", width: 25 },
    { header: "Equipo (Marca/Mod)", key: "equipo", width: 30 },
    { header: "Diagnóstico / Falla", key: "falla", width: 35 },
    { header: "Estado", key: "estado", width: 20 },
    { header: "Ingreso", key: "ingreso", width: 14 },
    { header: "Días T.", key: "dias", width: 10 },
    { header: "Precio Total", key: "precio", width: 16 },
  ];

  addTitleRow(ws1, "Listado General de Órdenes de Servicio", columns.length);
  const headerRow = ws1.addRow(columns.map(c => c.header));
  styleHeaderRow(headerRow, columns.length);
  ws1.autoFilter = 'A2:H2';

  // Sort: Activos primero (nuevos a viejos), luego entregados
  const sortedTickets = [...tickets].sort((a, b) => {
    if (a.estado === "ENTREGADO" && b.estado !== "ENTREGADO") return 1;
    if (a.estado !== "ENTREGADO" && b.estado === "ENTREGADO") return -1;
    return new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime();
  });

  sortedTickets.forEach((t, idx) => {
    const est = TICKET_STATUS[t.estado]?.label || t.estado;
    const diasTranscurridos = dayjs().diff(dayjs(t.fecha_ingreso), "day");

    const row = ws1.addRow([
      `#T-${t.id.substring(0, 6)}`,
      t.cliente?.nombre || "Sin cliente",
      `${t.marca} ${t.modelo}`,
      t.falla,
      est,
      dayjs(t.fecha_ingreso).format("DD/MM/YYYY"),
      t.estado === "ENTREGADO" ? "—" : diasTranscurridos,
      t.precio_total_usd || 0,
    ]);

    row.getCell(1).font = { bold: true };
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(6).alignment = { horizontal: "center" };
    row.getCell(7).alignment = { horizontal: "center" };
    
    // Monetary Formatting
    row.getCell(8).numFmt = '"$"#,##0.00';
    row.getCell(8).alignment = { horizontal: "right" };

    // Format condicional para tiempos
    if (t.estado === "ABANDONO") {
      row.getCell(5).font = { color: { argb: "FFDC2626" }, bold: true };
      row.getCell(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
    } else if (t.estado !== "ENTREGADO" && diasTranscurridos >= 30) {
      row.getCell(7).font = { color: { argb: "FFC2410C" }, bold: true };
      row.getCell(7).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFEDD5" } };
    } else if (t.estado === "ENTREGADO") {
      row.getCell(5).font = { color: { argb: "FF047857" }, bold: true };
    }

    styleDataRow(row, columns.length, idx % 2 === 1);
  });

  autoFitColumns(ws1);

  // ─────────────────────────────────────────────────────────────
  // Generar y descargar
  // ─────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `Reparaciones_General_${dateStr}.xlsx`);
}
