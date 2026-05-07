"use client";

import * as XLSX from "xlsx";
import { FileSpreadsheet } from "lucide-react";

interface ExportExcelButtonProps {
  data: any[];
  filename?: string;
}

export default function ExportExcelButton({ data, filename = "reporte-admin.xlsx" }: ExportExcelButtonProps) {
  const exportExcel = () => {
    // Transformar datos para el excel si es necesario
    const worksheetData = data.map(item => ({
      ID: item.despacho_id,
      Institucion: item.nombre_institucion,
      Poblacion: item.tipo_poblacion,
      Beneficiarios: item.cantidad_personas,
      Producto: item.producto_entregado,
      Cantidad: item.cantidad_despachada,
      Conductor: item.nombre_conductor,
      Vehiculo: item.vehiculo_id || item.placa,
      Fecha: new Date(item.fecha_entrega || item.fecha_despacho).toLocaleString(),
      Estado: item.estado_entrega
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
    
    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, filename);
  };

  return (
    <button
      onClick={exportExcel}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-lg active:scale-95"
    >
      <FileSpreadsheet className="w-4 h-4" />
      Exportar Excel
    </button>
  );
}
