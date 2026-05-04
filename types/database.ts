export type Beneficiario = {
  id: string;
  nombre_institucion: string;
  tipo_poblacion: string;
  cantidad_personas: number;
  direccion: string;
};

export type Producto = {
  id: string;
  nombre: string;
  categoria: string;
};

export type Lote = {
  id: string;
  producto_id: string;
  cantidad_actual: number;
  fecha_ingreso: string;
  fecha_vencimiento: string;
  estado: string;
};

export type Ruta = {
  id: string;
  vehiculo_id: string;
  conductor_id: string;
  estado: string;
};

export type Despacho = {
  id: string;
  ruta_id: string;
  beneficiario_id: string;
  lote_id: string;
  creado_por: string;
  cantidad_despachada: number;
  estado_entrega: string;
  fecha_despacho: string;
};

export type VistaSugerenciaDespacho = {
  lote_id: string;
  producto_id: string;
  nombre_producto: string;
  categoria: string;
  cantidad_actual: number;
  fecha_ingreso: string;
  fecha_vencimiento: string;
  dias_en_almacen: number;
  dias_para_vencer: number;
};

export type VistaImpactoSocial = {
  despacho_id: string;
  nombre_institucion: string;
  tipo_poblacion: string;
  cantidad_personas: number;
  producto_entregado: string;
  cantidad_despachada: number;
  fecha_despacho: string;
  estado_entrega: string;
  ruta_id: string;
  vehiculo_id: string;
  nombre_conductor: string;
  cargado_por: string;
};
