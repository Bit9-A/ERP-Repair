import jsPDF from "jspdf";
import dayjs from "dayjs";
// import type { TicketReparacion } from "../../../types";

export async function generateRepairPDF(
  ticket: any,
  fotos: string[]
): Promise<void> {
  // Inicializa documento en A4 vertical
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // ==========================================
  // HEADER CORPORATIVO
  // ==========================================
  doc.setFillColor(30, 64, 175); // Azul Tailwind (brand/blue-800)
  doc.rect(0, 0, pageWidth, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ACTA DIGITAL DE REPARACIÓN", margin, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`TICKET ID: ${ticket.id.split("-")[0].toUpperCase()}`, pageWidth - margin - 40, 16);

  // ==========================================
  // INFORMACIÓN GENERAL
  // ==========================================
  doc.setTextColor(50, 50, 50);
  let y = 35;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Resumen de Servicio Técnico", margin, y);
  
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Estado Actual:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(4, 120, 87); // Verde Exito
  doc.text("REPARADO / LISTO PARA ENTREGA", margin + 30, y);

  doc.setTextColor(80, 80, 80);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Fecha Emisión:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(dayjs().format("DD/MM/YYYY hh:mm A"), margin + 30, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Cliente:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(ticket.cliente?.nombre || "N/A", margin + 30, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Teléfono:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(ticket.cliente?.telefono || "N/A", margin + 30, y);

  // ==========================================
  // DETALLES DEL EQUIPO Y DIAGNÓSTICO
  // ==========================================
  y += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y); // Separador
  y += 10;
  
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Especificaciones Técnicas", margin, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const infoEquipo = `${ticket.marca} ${ticket.modelo} (${ticket.equipo || ticket.tipo_equipo})`;
  doc.text(`Equipo: ${infoEquipo}`, margin, y);
  
  y += 6;
  doc.text(`Diagnóstico/Falla Original: ${ticket.falla || "No especificada"}`, margin, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Acordado: $${ticket.precio_total_usd.toFixed(2)} USD`, margin, y);

  // ==========================================
  // REGISTRO FOTOGRÁFICO TEMPORAL
  // ==========================================
  y += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y); // Separador
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Evidencia Fotográfica de Calidad", margin, y);

  y += 10;

  if (fotos && fotos.length > 0) {
    const spaceBetween = 5;
    const imgWidth = (pageWidth - (margin * 2) - spaceBetween) / 2;
    const imgHeight = 60; // Fijo 6cm aprox
    
    let currentX = margin;
    let currentY = y;
    
    fotos.forEach((fotoBase64, index) => {
      // Salto de línea cada 2 fotos
      if (index > 0 && index % 2 === 0) {
        currentX = margin;
        currentY += imgHeight + spaceBetween;
        
        // Salto de página preventivo si y excede
        if (currentY + imgHeight > 280) {
          doc.addPage();
          currentY = margin;
        }
      }

      // Add image expecting standard Base64 web form 
      try {
        // Formato tipico "data:image/jpeg;base64,....."
        const extension = fotoBase64.substring(
          fotoBase64.indexOf("data:image/") + 11,
          fotoBase64.indexOf(";base64")
        ).toUpperCase();
        
        // Ajustar soporte de jsPDF, suele tragar JPEG y PNG directo
        const format = (extension === "JPG" || extension === "JPEG") ? "JPEG" : "PNG";
        
        doc.addImage(fotoBase64, format, currentX, currentY, imgWidth, imgHeight);
        
        // Bordecito estetico a la foto
        doc.setDrawColor(200,200,200);
        doc.rect(currentX, currentY, imgWidth, imgHeight, "S");

      } catch (err) {
        console.warn("Error al intentar procesar imagen local", err);
      }
      
      currentX += imgWidth + spaceBetween;
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("El técnico no adjuntó reportes fotográficos en esta sesión.", margin, y);
  }

  // ==========================================
  // PIE DE PÁGINA
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${totalPages} - ERP Repair Documento Generado Automáticamente.`,
      pageWidth / 2,
      290,
      { align: "center" }
    );
  }

  // Auto-descargar usando save 
  const safeClientName = ticket.cliente?.nombre?.replace(/\s+/g, '_') || "Cliente";
  doc.save(`Acta_Reparacion_${ticket.id.split("-")[0]}_${safeClientName}.pdf`);
}
