import { User as UserType } from '@/types';

export class User implements UserType {
  id: number;
  nombre: string;
  correo: string;
  direccion: string;
  telf: string;

  constructor(data: UserType) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.correo = data.correo;
    this.direccion = data.direccion;
    this.telf = data.telf;
  }

  static fromApi(data: UserType): User {
    return new User({
      id: data.id,
      nombre: data.nombre,
      correo: data.correo,
      direccion: data.direccion,
      telf: data.telf,
    });
  }

  toJSON(): UserType {
    return {
      id: this.id,
      nombre: this.nombre,
      correo: this.correo,
      direccion: this.direccion,
      telf: this.telf,
    };
  }
} 