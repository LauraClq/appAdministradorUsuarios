export interface User {
  email: string;
  password: string;
  dni: number;
  nombre: string;
  apellido: string;
  perfil?: string;
  foto?: string;
}