import jsPDF from "jspdf";
import dayjs from "dayjs";

export async function generateRepairPDF(
  ticket: any,
  fotos: string[]
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const col2 = pageWidth / 2;
  let y = 32;

  // ==========================================
  // HEADER PROFESIONAL (ALTO IMPACTO)
  // ==========================================
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ACTA DIGITAL DE REPARACIÓN - TECNOPRO CELL", margin, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const ordenId = ticket.id.split("-")[0].toUpperCase();
  doc.text(`N° DE ORDEN: #${ordenId}`, pageWidth - margin - 40, 14);

  // ==========================================
  // BLOQUE DE INFORMACIÓN (COLUMNAS COMPACTAS)
  // ==========================================
  doc.setTextColor(31, 41, 55);

  // --- Fila 1: Cliente y Fecha ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("INFORMACIÓN DEL CLIENTE", margin, y);
  doc.text("FECHA Y HORA DE EMISIÓN", col2, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Nombre: ${ticket.cliente?.nombre || "N/A"}`, margin, y);
  doc.text(`${dayjs().format("DD/MM/YYYY - hh:mm A")}`, col2, y);

  y += 5;
  doc.text(`Teléfono: ${ticket.cliente?.telefono || "N/A"}`, margin, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(4, 120, 87); // Verde para el estado
  doc.text("ESTADO: REPARADO", col2, y);

  // Separador fino
  y += 6;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);

  // --- Fila 2: Detalles del Equipo y Diagnóstico ---
  y += 8;
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.text("ESPECIFICACIONES DEL EQUIPO", margin, y);
  doc.text("DIAGNÓSTICO Y FALLA", col2, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  const infoEquipo = `${ticket.marca} ${ticket.modelo}`;
  const tipoEquipo = ticket.equipo || ticket.tipo_equipo || "Smartphone";
  doc.text(`Modelo: ${infoEquipo}`, margin, y);

  // Diagnóstico con split para que no se desborde
  const diagTexto = ticket.falla || "No especificada";
  const splitDiag = doc.splitTextToSize(diagTexto, (pageWidth / 2) - 20);
  doc.text(splitDiag, col2, y);

  y += 5;
  doc.text(`Tipo: ${tipoEquipo}`, margin, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL ACORDADO: $${(ticket.precio_total_usd).toFixed(2)} USD`, margin, y);

  // Ajuste de Y dinámico según el largo del diagnóstico
  y = Math.max(y + 12, y + (splitDiag.length * 4) + 5);

  // ==========================================
  // REGISTRO FOTOGRÁFICO
  // ==========================================
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 10, y); // Acento visual azul

  y += 6;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.text("EVIDENCIA FOTOGRÁFICA DE CALIDAD", margin, y);

  y += 6;

  if (fotos && fotos.length > 0) {
    const gap = 4;
    const imgWidth = (pageWidth - (margin * 2) - gap) / 2;

    let currentX = margin;
    let currentY = y;
    let rowMaxH = 0;

    fotos.forEach((fotoBase64, index) => {
      try {
        const props = doc.getImageProperties(fotoBase64);
        const ratio = props.height / props.width;
        const imgH = imgWidth * ratio;

        if (index > 0 && index % 2 === 0) {
          currentX = margin;
          currentY += rowMaxH + gap;
          rowMaxH = 0;
        }

        if (currentY + imgH > 275) {
          doc.addPage();
          currentY = 20;
          currentX = margin;
        }

        const format = fotoBase64.toLowerCase().includes("png") ? "PNG" : "JPEG";
        doc.addImage(fotoBase64, format, currentX, currentY, imgWidth, imgH, undefined, 'MEDIUM');

        doc.setDrawColor(209, 213, 219);
        doc.setLineWidth(0.1);
        doc.rect(currentX, currentY, imgWidth, imgH, "S");

        if (imgH > rowMaxH) rowMaxH = imgH;
        currentX += imgWidth + gap;
      } catch (e) {
        console.error("Error en imagen", e);
      }
    });
  }

  // ==========================================
  // FOOTER CON LÍNEA DE MARCA
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(margin, 285, pageWidth - margin, 285);

    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.text("Documento oficial generado por TECNOPRO CELL - Garantía sujeta a términos y condiciones.", margin, 290);
    doc.text(`PÁGINA ${i} / ${totalPages} - TECNOPRO CELL`, pageWidth - margin, 290, { align: "right" });
  }

  const safeName = ticket.cliente?.nombre?.split(" ")[0] || "Cliente";
  doc.save(`Acta_${ordenId}_${safeName}.pdf`);
}