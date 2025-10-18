export class Visitante {
  constructor({ nombre, dni, edad }) {
    this.nombre = typeof nombre === "string" ? nombre.trim() : nombre;
    this.dni = typeof dni === "string" ? dni.trim() : dni;
    this.edad = edad;
  }
}
