export interface Cliente {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
}

export interface ClienteFormValue {
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
}

export interface ClientesPage {
  data: Cliente[];
  total: number;
  page: number;
  limit: number;
}
