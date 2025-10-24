import { describe, it, expect, beforeEach } from "vitest";
import { Actividad } from "../src/domain/actividad.js";
import { Visitante } from "../src/domain/visitante.js";

/**
 * Diseño de dominio (contrato que la implementación debe respetar):
 * - new Actividad(nombre, { requiereTalle, cuposPorHorario: { "HH:MM": numero } })
 * - actividad.inscribir(visitante, horario, { aceptaTerminos, talle? }) -> { ok: true } o lanza Error con message estándar.
 * - El cupo es POR HORARIO (slot), no global.
 */

describe("Inscripción a actividad", () => {
  let tirolesa, jardineria, visitante;

  beforeEach(() => {
    tirolesa = new Actividad("Tirolesa", {
      requiereTalle: true,
      cuposPorHorario: { "10:00": 2, "15:00": 2 },
    });
    jardineria = new Actividad("Jardinería", {
      requiereTalle: false,
      cuposPorHorario: { "09:00": 1 },
    });
    visitante = new Visitante({ nombre: "Gaston", dni: "12345678", edad: 25 });
  });

  it("Inscripción exitosa (requiere talle + TyC aceptados)", () => {
    const res = tirolesa.inscribir(visitante, "10:00", {
      aceptaTerminos: true,
      talle: "M",
    });
    expect(res.ok).toBe(true);
    // post-condición: decrementa cupo del slot
    expect(tirolesa.cupoDisponible("10:00")).toBe(1);
  });

  it("Pasa sin talle cuando la actividad NO lo requiere", () => {
    const res = jardineria.inscribir(visitante, "09:00", {
      aceptaTerminos: true,
      // talle omitido
    });
    expect(res.ok).toBe(true);
  });

  it("Inscripción Fallida (Actividad no existe)", () => {
    const actividades = {
      Tirolesa: tirolesa,
      Jardinería: jardineria,
    };

    const nombre = "Safari"; // no existe en el catálogo

    const actividad = actividades[nombre];
    expect(actividad).toBeUndefined();

    expect(() => {
      if (!actividad) throw new Error("actividad inexistente");
      actividad.inscribir(visitante, "10:00", { aceptaTerminos: true, talle: "M" });
    }).toThrowError("actividad inexistente");

    // Ningún cupo fue afectado
    expect(tirolesa.cupoDisponible("10:00")).toBe(2);
  });

  it("Inscripción Fallida (Actividad no seleccionada)", () => {
    const intentar = () => {
      const actividad = null; // no eligieron nada en el combo
      if (!actividad) throw new Error("actividad no seleccionada");
      actividad.inscribir(visitante, "10:00", { aceptaTerminos: true, talle: "M" });
    };

    expect(intentar).toThrowError("actividad no seleccionada");
    // No debe alterarse ningún cupo de actividades existentes
    expect(tirolesa.cupoDisponible("10:00")).toBe(2);
  });

  it("Falla si no hay cupo disponible en el horario", () => {
    jardineria.inscribir(visitante, "09:00", { aceptaTerminos: true });
    const otro = new Visitante({ nombre: "Juan", dni: "99999999", edad: 30 });
    expect(() =>
      jardineria.inscribir(otro, "09:00", { aceptaTerminos: true })
    ).toThrowError("no hay cupo para este horario");
  });

  it("Falla si el horario no existe", () => {
    expect(() =>
      tirolesa.inscribir(visitante, "18:00", {
        aceptaTerminos: true,
        talle: "M",
      })
    ).toThrowError("horario no disponible");
  });

  it("Falla si el horario no fue seleccionado", () => {
    expect(() =>
      tirolesa.inscribir(visitante, null, {
        aceptaTerminos: true,
        talle: "M",
      })
    ).toThrowError("horario no seleccionado");

    // post-condición: no cambia el cupo
    expect(tirolesa.cupoDisponible("10:00")).toBe(2);
  });

  it("Falla si el visitante no fue seleccionado", () => {
    // null
    expect(() =>
      tirolesa.inscribir(null, "10:00", { aceptaTerminos: true, talle: "M" })
    ).toThrowError("visitante no seleccionado");

    // undefined
    expect(() =>
      tirolesa.inscribir(undefined, "10:00", { aceptaTerminos: true, talle: "M" })
    ).toThrowError("visitante no seleccionado");

    // Post: no debe alterarse el cupo
    expect(tirolesa.cupoDisponible("10:00")).toBe(2);
  });

  it("Falla al intentar inscribir más visitantes que el cupo del horario", () => {

    const v1 = new Visitante({ nombre: "A", dni: "11111111", edad: 20 });
    const v2 = new Visitante({ nombre: "B", dni: "22222222", edad: 21 });
    const v3 = new Visitante({ nombre: "C", dni: "33333333", edad: 22 });

    const ok1 = tirolesa.inscribir(v1, "10:00", { aceptaTerminos: true, talle: "M" });
    expect(ok1.ok).toBe(true);
    expect(tirolesa.cupoDisponible("10:00")).toBe(1);

    const ok2 = tirolesa.inscribir(v2, "10:00", { aceptaTerminos: true, talle: "S" });
    expect(ok2.ok).toBe(true);
    expect(tirolesa.cupoDisponible("10:00")).toBe(0);

    // Tercer intento excede el cupo → debe fallar
    expect(() =>
      tirolesa.inscribir(v3, "10:00", { aceptaTerminos: true, talle: "L" })
    ).toThrowError("no hay cupo para este horario");

    // El cupo no debe quedar negativo
    expect(tirolesa.cupoDisponible("10:00")).toBe(0);
  });

  it("Falla si no se aceptan términos y condiciones", () => {
    expect(() =>
      tirolesa.inscribir(visitante, "10:00", {
        aceptaTerminos: false,
        talle: "M",
      })
    ).toThrowError("debe aceptar términos y condiciones");
  });

  it("Falla si requiere talle y no se envía", () => {
    expect(() =>
      tirolesa.inscribir(visitante, "15:00", { aceptaTerminos: true })
    ).toThrowError("talle de vestimenta requerido");
  });

  // ---- Reglas de negocio ----

  it("El cupo es por horario (llenar 10:00 no afecta 15:00)", () => {
    tirolesa.inscribir(visitante, "10:00", {
      aceptaTerminos: true,
      talle: "L",
    });
    const v2 = new Visitante({ nombre: "Ana", dni: "22222222", edad: 22 });
    const res = tirolesa.inscribir(v2, "15:00", {
      aceptaTerminos: true,
      talle: "S",
    });
    expect(res.ok).toBe(true);
  });

  it("No permite reinscripción del mismo DNI al mismo horario", () => {
    tirolesa.inscribir(visitante, "10:00", {
      aceptaTerminos: true,
      talle: "M",
    });
    expect(() =>
      tirolesa.inscribir(visitante, "10:00", {
        aceptaTerminos: true,
        talle: "M",
      })
    ).toThrowError("visitante ya inscripto en este horario");
  });

  it('Normaliza horario con espacios (" 10:00 ")', () => {
    const res = tirolesa.inscribir(visitante, " 10:00 ", {
      aceptaTerminos: true,
      talle: "M",
    });
    expect(res.ok).toBe(true);
  });

  it("aceptaTerminos debe ser boolean true", () => {
    expect(() =>
      tirolesa.inscribir(visitante, "10:00", {
        aceptaTerminos: null,
        talle: "M",
      })
    ).toThrowError("debe aceptar términos y condiciones");
  });

  it("Permite que el mismo DNI se inscriba en otro horario distinto", () => {
    tirolesa.inscribir(visitante, "10:00", {
      aceptaTerminos: true,
      talle: "M",
    });
    const res = tirolesa.inscribir(visitante, "15:00", {
      aceptaTerminos: true,
      talle: "M",
    });
    expect(res.ok).toBe(true);
  });

  it("Ignora el talle cuando la actividad NO lo requiere (no falla)", () => {
    const res = jardineria.inscribir(visitante, "09:00", {
      aceptaTerminos: true,
      talle: "L", // enviado pero no requerido
    });
    expect(res.ok).toBe(true);
  });

  describe("Validación de datos del visitante", () => {
    it("Falla si DNI está vacío", () => {
      const v = new Visitante({ nombre: "A", dni: "", edad: 25 });
      expect(() =>
        tirolesa.inscribir(v, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("dni inválido");
    });

    it("Falla si DNI contiene letras o no es numérico", () => {
      const v = new Visitante({ nombre: "A", dni: "12A4567", edad: 25 });
      expect(() =>
        tirolesa.inscribir(v, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("dni inválido");
    });

    it("Falla si nombre está vacío", () => {
      const v = new Visitante({ nombre: "", dni: "11111111", edad: 25 });
      expect(() =>
        tirolesa.inscribir(v, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("nombre inválido");
    });

    it("Falla si edad <= 0", () => {
      const v = new Visitante({ nombre: "A", dni: "11111111", edad: 0 });
      expect(() =>  
        tirolesa.inscribir(v, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("edad inválida");
    });

    it("Falla si edad >= 100", () => {
      const v = new Visitante({ nombre: "A", dni: "11111111", edad: 100 });
      expect(() =>
        tirolesa.inscribir(v, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("edad inválida");
    });

    it("Falla si la edad no es un número entero", () => {
      const v = new Visitante({ nombre: "A", dni: "11111111", edad: "veinticinco" });
      expect(() =>
        tirolesa.inscribir(v, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("edad inválida");

      const v2 = new Visitante({ nombre: "A", dni: "11111111", edad: "25a" });
      expect(() =>
        tirolesa.inscribir(v2, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("edad inválida");

      const v3 = new Visitante({ nombre: "A", dni: "11111111", edad: "25.5" });
      expect(() =>
        tirolesa.inscribir(v3, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("edad inválida");
    });
    
    it("Falla si la edad está vacía o nula", () => {
      // edad vacía como string
      const v1 = new Visitante({ nombre: "A", dni: "11111111", edad: "" });
      expect(() =>
        tirolesa.inscribir(v1, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("edad inválida");

      // edad nula
      const v2 = new Visitante({ nombre: "A", dni: "11111111", edad: null });
      expect(() =>
        tirolesa.inscribir(v2, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("edad inválida");

      // edad indefinida
      const v3 = new Visitante({ nombre: "A", dni: "11111111" }); // sin edad
      expect(() =>
        tirolesa.inscribir(v3, "10:00", { aceptaTerminos: true, talle: "S" })
      ).toThrowError("edad inválida");
    });
  });

  it("Carrera al último cupo: la segunda inscripción consecutiva falla", () => {
    const act = new Actividad("Palestra", {
      requiereTalle: false,
      cuposPorHorario: { "11:00": 1 },
    });
    const v1 = new Visitante({ nombre: "Uno", dni: "1", edad: 20 });
    const v2 = new Visitante({ nombre: "Dos", dni: "2", edad: 22 });

    const ok = act.inscribir(v1, "11:00", { aceptaTerminos: true });
    expect(ok.ok).toBe(true);

    expect(() =>
      act.inscribir(v2, "11:00", { aceptaTerminos: true })
    ).toThrowError("no hay cupo para este horario");
  });

});
