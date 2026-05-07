"use client";

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FileDown } from "lucide-react";

interface ExportPDFButtonProps {
  data: any[];
  filename?: string;
  title?: string;
}

export default function ExportPDFButton({ data, filename = "reporte.pdf", title = "Reporte de Actividad" }: ExportPDFButtonProps) {
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Configuración de cabecera
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("BANCO DE ALIMENTOS BOLIVIA", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(title, 14, 32);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 40);

    const tableColumn = ["Institución", "Producto", "Cantidad", "Fecha"];
    const tableRows = data.map(item => [
      item.nombre_institucion,
      item.producto_entregado,
      item.cantidad_despachada,
      new Date(item.fecha_entrega || item.fecha_despacho).toLocaleDateString()
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(filename);
  };

  return (
    <button
      onClick={exportPDF}
      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-lg active:scale-95"
    >
      <FileDown className="w-4 h-4" />
      Exportar PDF
    </button>
  );
}
