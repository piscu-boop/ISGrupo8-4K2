import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";

// 👇 Asumimos que exportarás una factoría de app que recibe dependencias de dominio.
// La implementaremos después. Por ahora, TDD: este import hará fallar hasta crear el archivo.
import { createApp } from "../../src/app.js";

// Utilidad: construimos un "contenedor" de dominio fake para las pruebas de integración.
// La idea es inyectar actividades y servicios SIN tocar DB todavía.
function makeInMemoryContainer() {
  // Reusamos tus clases de dominio reales (unit tested).
  const { Actividad } = require("../../src/domain/actividad.js");
  const { Visitante } = require("../../src/domain/visitante.js");

  const actividades = new Map();
  // id "1": Tirolesa (requiere talle)
  actividades.set("1", new Actividad("Tirolesa", {
    requiereTalle: true,
    cuposPorHorario: { "10:00": 2, "15:00": 2 },
  }));
  // id "2": Jardinería (no requiere talle)
  actividades.set("2", new Actividad("Jardinería", {
    requiereTalle: false,
    cuposPorHorario: { "09:00": 1 },
  }));

  // Servicio de aplicación mínimo que envuelve el dominio
  const inscribirEnActividad = ({ actividadId, horario, visitante, aceptaTerminos, talle }) => {
    const actividad = actividades.get(String(actividadId));
    if (!actividad) {
      const err = new Error("actividad no encontrada");
      err.httpStatus = 404;
      throw err;
    }

    // Normalizamos el visitante a la clase real
    const v = new Visitante(visitante);
    try {
      const res = actividad.inscribir(v, horario, { aceptaTerminos, talle });
      return res; // { ok: true }
    } catch (e) {
      // Propagamos el mensaje del dominio y mapeamos status:
      const msg = (e && e.message) || "error";
      const is409 = [
        "no hay cupo para este horario",
        "visitante ya inscripto en este horario",
      ].includes(msg);
      const is400 = !is409;

      const err = new Error(msg);
      err.httpStatus = is409 ? 409 : 400;
      throw err;
    }
  };

  return { actividades, inscribirEnActividad };
}

describe("POST /actividades/:id/inscripciones (integración)", () => {
  let app;
  let container;

  beforeEach(() => {
    container = makeInMemoryContainer();
    app = createApp({ container });
  });

  it("201 → inscribe correctamente (talle requerido, TyC true)", async () => {
    const res = await request(app)
      .post("/actividades/1/inscripciones")
      .send({
        horario: "10:00",
        visitante: { nombre: "Gaston", dni: "12345678", edad: 25 },
        aceptaTerminos: true,
        talle: "M",
      })
      .expect(201);

    expect(res.body).toEqual({ ok: true });

    // post: verifica que el cupo baje a 1 (usando el contenedor inyectado)
    const act = container.actividades.get("1");
    expect(act.cupoDisponible("10:00")).toBe(1);
  });

  it("404 → actividad no encontrada", async () => {
    const res = await request(app)
      .post("/actividades/999/inscripciones")
      .send({
        horario: "10:00",
        visitante: { nombre: "A", dni: "1", edad: 20 },
        aceptaTerminos: true,
        talle: "S",
      })
      .expect(404);

    expect(res.body).toEqual({ error: "actividad no encontrada" });
  });

  it("400 → falla por horario inexistente", async () => {
    const res = await request(app)
      .post("/actividades/1/inscripciones")
      .send({
        horario: "18:00",
        visitante: { nombre: "Gaston", dni: "12345678", edad: 25 },
        aceptaTerminos: true,
        talle: "M",
      })
      .expect(400);

    expect(res.body).toEqual({ error: "horario no disponible" });
  });

  it("400 → falla por no aceptar TyC", async () => {
    const res = await request(app)
      .post("/actividades/1/inscripciones")
      .send({
        horario: "10:00",
        visitante: { nombre: "Gaston", dni: "12345678", edad: 25 },
        aceptaTerminos: false,
        talle: "M",
      })
      .expect(400);

    expect(res.body).toEqual({ error: "debe aceptar términos y condiciones" });
  });

  it("400 → falla por talle requerido faltante", async () => {
    const res = await request(app)
      .post("/actividades/1/inscripciones")
      .send({
        horario: "10:00",
        visitante: { nombre: "Gaston", dni: "12345678", edad: 25 },
        aceptaTerminos: true
      })
      .expect(400);

    expect(res.body).toEqual({ error: "talle de vestimenta requerido" });
  });

  it("409 → falla por cupo insuficiente", async () => {
    // Jardinería tiene 1 cupo a las 09:00
    await request(app)
      .post("/actividades/2/inscripciones")
      .send({
        horario: "09:00",
        visitante: { nombre: "Uno", dni: "1", edad: 20 },
        aceptaTerminos: true
      })
      .expect(201);

    const res = await request(app)
      .post("/actividades/2/inscripciones")
      .send({
        horario: "09:00",
        visitante: { nombre: "Dos", dni: "2", edad: 22 },
        aceptaTerminos: true
      })
      .expect(409);

    expect(res.body).toEqual({ error: "no hay cupo para este horario" });
  });

  it("409 → falla por visitante ya inscripto en el mismo slot", async () => {
    const payload = {
      horario: "10:00",
      visitante: { nombre: "Gaston", dni: "12345678", edad: 25 },
      aceptaTerminos: true,
      talle: "M",
    };

    await request(app).post("/actividades/1/inscripciones").send(payload).expect(201);

    const res = await request(app)
      .post("/actividades/1/inscripciones")
      .send(payload)
      .expect(409);

    expect(res.body).toEqual({ error: "visitante ya inscripto en este horario" });
  });

  it("201 → pasa sin talle cuando la actividad no lo requiere", async () => {
    const res = await request(app)
      .post("/actividades/2/inscripciones")
      .send({
        horario: "09:00",
        visitante: { nombre: "Gaston", dni: "12345678", edad: 25 },
        aceptaTerminos: true
      })
      .expect(201);

    expect(res.body).toEqual({ ok: true });
  });

  it("400 → valida datos de visitante (dni, nombre, edad)", async () => {
    const bads = [
      { visitante: { nombre: "A", dni: "", edad: 25 }, error: "dni inválido" },
      { visitante: { nombre: "", dni: "1", edad: 25 }, error: "nombre inválido" },
      { visitante: { nombre: "A", dni: "1", edad: 0 }, error: "edad inválida" },
    ];

    for (const b of bads) {
      const r = await request(app)
        .post("/actividades/1/inscripciones")
        .send({
          horario: "10:00",
          visitante: b.visitante,
          aceptaTerminos: true,
          talle: "M",
        })
        .expect(400);

      expect(r.body).toEqual({ error: b.error });
    }
  });
});

// Nota: este test inyecta un contenedor de dominio en memoria a createApp({ container }), 
// así no dependemos de MySQL todavía. Es una muy buena práctica para TDD: integración HTTP 
// real, dominio “real”, sin infraestructura.
