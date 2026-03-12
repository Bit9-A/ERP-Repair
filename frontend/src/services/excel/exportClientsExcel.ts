import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Cliente } from "../../services/clients.service";
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

export async function exportClientsExcel(
  clients: Cliente[],
  userName?: string
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ERP-Repair (Directorio Cientes)";
  workbook.lastModifiedBy = userName || "Automated Export";
  workbook.created = new Date();
  
  const dateStr = dayjs().format("DD-MM-YYYY");

  // ─────────────────────────────────────────────────────────────
  // HOJA 1: RESUMEN EJECUTIVO (CARTERA)
  // ─────────────────────────────────────────────────────────────
  const ws0 = workbook.addWorksheet("Resumen de Cartera");
  ws0.columns = [{ width: 4 }, { width: 40 }, { width: 20 }, { width: 15 }];
  
  // Título
  const titleRow = ws0.addRow(["", "Reporte General de Clientes"]);
  titleRow.getCell(2).font = { bold: true, size: 16, color: { argb: "FF1E3A5F" } };
  ws0.addRow([]);

  // Info del reporte
  ws0.addRow(["", "Fecha de Emisión:", dayjs().format("DD/MM/YYYY HH:mm A")]);
  ws0.addRow(["", "Generado por:", userName || "Administrador"]);
  ws0.addRow([]);

  // Calcular KPIs
  const totalClientes = clients.length;
  // Se considera activo si tiene al menos 1 venta o 1 reparación registrada
  const clientesActivosReparacion = clients.filter(c => (c._count?.tickets || 0) > 0).length;
  const clientesActivosVenta = clients.filter(c => (c._count?.ventas || 0) > 0).length;
  const inactivos = clients.filter(c => (c._count?.tickets || 0) === 0 && (c._count?.ventas || 0) === 0).length;

  // Render KPIs
  const kpiRow = ws0.addRow(["", "👥 ESTADÍSTICA DE DIRECTORI0"]);
  kpiRow.getCell(2).font = { bold: true, size: 12, color: { argb: "FF1E40AF" } };
  ws0.addRow(["", "Total de Clientes en Base de Datos:", totalClientes]);
  const repoRow = ws0.addRow(["", "Clientes con Solicitudes de Reparación:", clientesActivosReparacion]);
  repoRow.getCell(3).font = { bold: true, color: { argb: "FF047857" } };
  const ventRow = ws0.addRow(["", "Clientes con Ventas en Tienda:", clientesActivosVenta]);
  ventRow.getCell(3).font = { bold: true, color: { argb: "FF1D4ED8" } };
  const inactRow = ws0.addRow(["", "Clientes Potenciales Inactivos (0 Compras):", inactivos]);
  if (inactivos > 0) inactRow.getCell(3).font = { bold: true, color: { argb: "FFC2410C" } };

  // Bordes sutiles
  ws0.eachRow((row, index) => {
    if (index >= 8 && index <= 13 && row.getCell(2).value && row.getCell(3).value !== undefined) {
      if (!row.getCell(2).value?.toString().includes("👥")) {
        row.getCell(2).border = { bottom: { style: "dotted", color: { argb: "FFD1D5DB" } } };
        row.getCell(3).border = { bottom: { style: "dotted", color: { argb: "FFD1D5DB" } } };
      }
    }
  });


  // ─────────────────────────────────────────────────────────────
  // HOJA 2: DIRECTORIO GENERAL DE CLIENTES
  // ─────────────────────────────────────────────────────────────
  const ws1 = workbook.addWorksheet("Directorio General", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  const columns = [
    { header: "Nombre Completo", key: "nombre", width: 35 },
    { header: "Cédula / ID", key: "cedula", width: 18 },
    { header: "Teléfono", key: "telefono", width: 20 },
    { header: "Correo Electrónico", key: "correo", width: 35 },
    { header: "Reparaciones Solicitadas", key: "tickets", width: 25 },
    { header: "Compras Logradas", key: "ventas", width: 25 },
    { header: "Cliente Desde", key: "ingreso", width: 20 },
  ];

  addTitleRow(ws1, "Directorio Oficial de Contactos (Integración Marketing)", columns.length);
  const headerRow2 = ws1.addRow(columns.map(c => c.header));
  styleHeaderRow(headerRow2, columns.length);
  ws1.autoFilter = "A2:G2";

  // Data processing
  // Ordenar alfabéticamente
  const sortedClients = [...clients].sort((a, b) => a.nombre.localeCompare(b.nombre));

  sortedClients.forEach((client, i) => {
    const reparaciones = client._count?.tickets || 0;
    const compras = client._count?.ventas || 0;

    const row = ws1.addRow([
      client.nombre,
      client.cedula,
      client.telefono,
      client.correo || "N/A",
      reparaciones,
      compras,
      dayjs(client.createdAt).format("DD/MM/YYYY")
    ]);

    row.getCell(1).font = { bold: true };
    if (client.correo === "N/A") {
      row.getCell(4).font = { italic: true, color: { argb: "FF9CA3AF" } };
    }

    // Centrar los contadores
    row.getCell(5).alignment = { horizontal: "center" };
    row.getCell(6).alignment = { horizontal: "center" };
    row.getCell(7).alignment = { horizontal: "center" };

    // Hightlights informativos
    if (reparaciones > 0) row.getCell(5).font = { bold: true, color: { argb: "FF047857" } };
    if (compras > 0) row.getCell(6).font = { bold: true, color: { argb: "FF1D4ED8" } };

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

  saveAs(blob, `Directorio_Clientes_${dateStr}.xlsx`);
}
