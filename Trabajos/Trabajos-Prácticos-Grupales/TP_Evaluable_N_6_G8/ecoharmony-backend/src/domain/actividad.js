export class Actividad {
  constructor(nombre, { requiereTalle = false, cuposPorHorario = {} } = {}) {
    this.nombre = nombre;
    this.requiereTalle = Boolean(requiereTalle);

    this._disponibilidad = new Map();
    Object.entries(cuposPorHorario).forEach(([slot, cupo]) => {
      this._disponibilidad.set(slot, Number(cupo));
    });

    this._inscriptos = new Map();
  }

  _normalizarHorario(h) {
    return String(h ?? "").trim();
  }

  cupoDisponible(horario) {
    const h = this._normalizarHorario(horario);
    return this._disponibilidad.get(h) ?? 0;
  }

  _validarVisitante(visitante) {
    if (!visitante) {
      throw new Error("visitante no seleccionado");
    }

    const { nombre, dni, edad } = visitante;

    // DNI: debe ser string numérico, no vacío, sin letras ni símbolos
    if (typeof dni !== "string" || !/^\d+$/.test(dni.trim())) {
      throw new Error("dni inválido");
    }

    // Nombre: string no vacío
    if (typeof nombre !== "string" || nombre.trim() === "") {
      throw new Error("nombre inválido");
    }

    // Edad: debe ser número entero entre 1 y 99, no nulo ni string
    if (
      edad === null ||
      edad === undefined ||
      edad === "" ||
      typeof edad !== "number" ||
      !Number.isInteger(edad) ||
      edad <= 0 ||
      edad >= 100
    ) {
      throw new Error("edad inválida");
    }
  }

  inscribir(visitante, horario, { aceptaTerminos, talle } = {}) {
    const h = this._normalizarHorario(horario);

    // validar visitante (para los tests rojos)
    this._validarVisitante(visitante);

    // Horario no seleccionado (null, vacío, o solo espacios)
    if (!h) {
      throw new Error("horario no seleccionado");
    }

    // horario debe existir
    if (!this._disponibilidad.has(h)) {
      throw new Error("horario no disponible");
    }

    // aceptar términos (estrictamente true)
    if (aceptaTerminos !== true) {
      throw new Error("debe aceptar términos y condiciones");
    }

    // validar talle si se requiere
    if (this.requiereTalle) {
      if (!talle || String(talle).trim() === "") {
        throw new Error("talle de vestimenta requerido");
      }
    }
    // si NO requiere talle: parámetro se ignora si viene

    // duplicado por DNI en el mismo slot
    const dni = visitante.dni;
    if (!this._inscriptos.has(h)) this._inscriptos.set(h, new Set());
    const set = this._inscriptos.get(h);
    if (set.has(dni)) {
      throw new Error("visitante ya inscripto en este horario");
    }

    // cupo del slot
    const cupo = this._disponibilidad.get(h) ?? 0;
    if (cupo <= 0) {
      throw new Error("no hay cupo para este horario");
    }

    // aplicar inscripción
    set.add(dni);
    this._disponibilidad.set(h, cupo - 1);

    return { ok: true };
  }
}
