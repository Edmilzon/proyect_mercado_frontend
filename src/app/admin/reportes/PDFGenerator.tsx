"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { VentaReporte } from './types';
import { useState } from "react";

interface PDFGeneratorProps {
  data: VentaReporte[];
  tipo: string;
}

export async function getBase64FromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateReportPDFWithLogo(data: VentaReporte[], tipo: string) {
  const doc = new jsPDF();
  // Cargar logo real desde public
  let logoBase64 = "";
  try {
    logoBase64 = await getBase64FromUrl("/logo_pdf.jpeg");
  } catch {
    logoBase64 = "";
  }
  const logoWidth = 24;
  const logoHeight = 26;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', 14, 10, logoWidth, logoHeight);
    } catch {
      doc.setDrawColor(245, 158, 66);
      doc.rect(14, 10, logoWidth, logoHeight, 'S');
    }
  } else {
    doc.setDrawColor(245, 158, 66);
    doc.rect(14, 10, logoWidth, logoHeight, 'S');
  }

  // Fecha y hora de generación en la esquina superior derecha
  const fechaHora = new Date().toLocaleString();
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generado: ${fechaHora}`, 180, 18, { align: 'right' });

  // Título profesional
  doc.setFontSize(20);
  doc.setTextColor(245, 158, 66);
  doc.text("Reporte Ejecutivo de Ventas y Pedidos", 105, 28, { align: 'center' });

  // Nombre del usuario (Administrador)
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text("Generado por: Administrador", 105, 36, { align: 'center' });

  // 2. Métricas clave (declaración de variables antes de usarlas)
  const vendidos = data.filter(v => v.estado === 'vendido');
  const cancelados = data.filter(v => v.estado === 'cancelado');
  const pendientes = data.filter(v => v.estado === 'pendiente');
  const totalVendidos = vendidos.reduce((sum, v) => sum + parseFloat(v.total), 0);
  const totalCancelados = cancelados.reduce((sum, v) => sum + parseFloat(v.total), 0);
  const totalPendientes = pendientes.reduce((sum, v) => sum + parseFloat(v.total), 0);
  const volumenTotal = vendidos.length + pendientes.length + cancelados.length;
  const valorTotalVentas = totalVendidos + totalPendientes + totalCancelados;

  // --- MÉTRICAS CLAVE PROFESIONALES ---
  const metricsBoxTop = 40;
  const metricsBoxHeight = 60;
  const lineSpacing = 10;
  let yMetric = 56;
  const titleX = 20;
  const valueX = 130;
  doc.setDrawColor(245, 158, 66);
  doc.setLineWidth(0.8);
  doc.roundedRect(12, metricsBoxTop, 185, metricsBoxHeight, 3, 3, 'S');

  doc.setFontSize(14);
  doc.setTextColor(245, 158, 66);
  doc.text("MÉTRICAS CLAVE", 105, 48, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);

  doc.setFont("helvetica", 'bold');
  doc.text("Volumen total de pedidos:", titleX, yMetric, { align: 'left' });
  doc.setFont("helvetica", 'normal');
  doc.text(`${volumenTotal}` + '', valueX, yMetric, { align: 'right' });
  yMetric += lineSpacing;

  doc.setFont("helvetica", 'bold');
  doc.text("Valor monetario total de pedidos:", titleX, yMetric, { align: 'left' });
  doc.setFont("helvetica", 'normal');
  doc.text(`S/ ${valorTotalVentas.toFixed(2)}` + '', valueX, yMetric, { align: 'right' });
  yMetric += lineSpacing;

  doc.setFont("helvetica", 'bold');
  doc.text("Vendidos:", titleX, yMetric, { align: 'left' });
  doc.setFont("helvetica", 'normal');
  doc.text(`${vendidos.length}  |  S/ ${totalVendidos.toFixed(2)}` + '', valueX, yMetric, { align: 'right' });
  yMetric += lineSpacing;

  doc.setFont("helvetica", 'bold');
  doc.text("Cancelados:", titleX, yMetric, { align: 'left' });
  doc.setFont("helvetica", 'normal');
  doc.text(`${cancelados.length}  |  S/ ${totalCancelados.toFixed(2)}` + '', valueX, yMetric, { align: 'right' });
  yMetric += lineSpacing;

  doc.setFont("helvetica", 'bold');
  doc.text("Pendientes:", titleX, yMetric, { align: 'left' });
  doc.setFont("helvetica", 'normal');
  doc.text(`${pendientes.length}  |  S/ ${totalPendientes.toFixed(2)}` + '', valueX, yMetric, { align: 'right' });
  yMetric += lineSpacing;

  // Fila resaltada: Total en caja (ganancia)
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105); // verde oscuro
  doc.setFont("helvetica", 'bold');
  doc.text("Total en caja (ganancia):", titleX, yMetric, { align: 'left' });
  doc.text(`S/ ${totalVendidos.toFixed(2)}` + '', valueX, yMetric, { align: 'right' });
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81); // restaurar color texto normal
  yMetric += lineSpacing;

  // Línea divisoria estética (ahora después de la fila de ganancia)
  doc.setDrawColor(245, 158, 66);
  doc.setLineWidth(0.5);
  doc.line(15, yMetric, 195, yMetric);
  const metricsBoxBottom = yMetric;
  let startY = metricsBoxBottom + 15;

  // Vendidos
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.text("Pedidos Vendidos", 14, startY);
  autoTable(doc, {
    startY: startY + 3,
    head: [["ID", "Cliente", "Fecha", "Total", "Estado"]],
    body: vendidos.map((v) => [
      v.id,
      v.usuario?.nombre || "-",
      new Date(v.fecha).toLocaleDateString(),
      `S/ ${v.total}`,
      v.estado
    ]),
    foot: [["", "", `Total Vendidos: ${vendidos.length} pedidos`, `S/ ${totalVendidos.toFixed(2)}`, ""]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [220, 252, 231], textColor: 16, fontStyle: 'bold' }, // fondo suave
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  let lastAutoTable = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  startY = lastAutoTable?.finalY !== undefined ? lastAutoTable.finalY + 8 : startY + 30;
  doc.setDrawColor(245, 158, 66);
  doc.setLineWidth(0.5);
  doc.line(15, startY, 195, startY);

  // Cancelados
  doc.setFontSize(12);
  doc.setTextColor(239, 68, 68);
  doc.text("Pedidos Cancelados", 14, startY + 8);
  autoTable(doc, {
    startY: startY + 11,
    head: [["ID", "Cliente", "Fecha", "Total", "Estado"]],
    body: cancelados.map((v) => [
      v.id,
      v.usuario?.nombre || "-",
      new Date(v.fecha).toLocaleDateString(),
      `S/ ${v.total}`,
      v.estado
    ]),
    foot: [["", "", `Total Cancelados: ${cancelados.length} pedidos`, `S/ ${totalCancelados.toFixed(2)}`, ""]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [254, 226, 226], textColor: 239, fontStyle: 'bold' }, // fondo suave
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  lastAutoTable = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  startY = lastAutoTable?.finalY !== undefined ? lastAutoTable.finalY + 8 : startY + 30;
  doc.setDrawColor(245, 158, 66);
  doc.setLineWidth(0.5);
  doc.line(15, startY, 195, startY);

  // Pendientes
  doc.setFontSize(12);
  doc.setTextColor(245, 158, 66);
  doc.text("Pedidos Pendientes", 14, startY + 8);
  autoTable(doc, {
    startY: startY + 11,
    head: [["ID", "Cliente", "Fecha", "Total", "Estado"]],
    body: pendientes.map((v) => [
      v.id,
      v.usuario?.nombre || "-",
      new Date(v.fecha).toLocaleDateString(),
      `S/ ${v.total}`,
      v.estado
    ]),
    foot: [["", "", `Total Pendientes: ${pendientes.length} pedidos`, `S/ ${totalPendientes.toFixed(2)}`, ""]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [245, 158, 66], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [255, 247, 237], textColor: 245, fontStyle: 'bold' }, // fondo suave
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  lastAutoTable = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  startY = lastAutoTable?.finalY !== undefined ? lastAutoTable.finalY + 8 : startY + 30;

  // Pie de página
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Proyecto Morita | 76485910 | contacto", 105, 285, { align: 'center' });

  doc.save(`reporte-ejecutivo-${tipo}-${new Date().toISOString().split('T')[0]}.pdf`);
}

export default function PDFGenerator({ data, tipo }: PDFGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    await generateReportPDFWithLogo(data, tipo);
    setLoading(false);
  };
  return (
    <button
      onClick={handleClick}
      className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition"
      disabled={loading}
    >
      {loading ? "Generando PDF..." : "Descargar PDF"}
    </button>
  );
} 