import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import { createApp } from "../src/app.js";

describe("App - US 'Inscribirme a actividad' con flujo Red-Green-Refactor", () => {
  let app;
  let container;

  beforeEach(() => {
    const actividades = [
      { id: "1", nombre: "Tirolesa", horarios: ["10:00", "14:00"], cupos: { "10:00": 3, "14:00": 0 }, requiereTalle: false },
      { id: "2", nombre: "Safari", horarios: ["09:00"], cupos: { "09:00": 2 }, requiereTalle: false },
      { id: "3", nombre: "Palestra", horarios: ["11:00"], cupos: { "11:00": 1 }, requiereTalle: true },
      { id: "4", nombre: "Jardinería", horarios: ["15:00"], cupos: { "15:00": 0 }, requiereTalle: false },
    ];

    function acceptCheck(aceptaTerminos) {
      return aceptaTerminos === true;
    }

    container = {
      getActividades: async () => actividades.map(a => ({ id: a.id, nombre: a.nombre })),
      getActividad: async (id) => actividades.find(a => a.id === id) ?? null,
      getHorariosActividad: async (id) => {
        const act = actividades.find(a => a.id === id);
        return act ? act.horarios : [];
      },
      inscribirEnActividad: async ({ actividadId, horario, visitante, aceptaTerminos, talle }) => {
        if (!acceptCheck(aceptaTerminos)) {
          const e = new Error("No aceptó TYC");
          e.httpStatus = 400;
          throw e;
        }

        const actividad = actividades.find(a => a.id === actividadId);
        if (!actividad) {
          const e = new Error("Actividad no encontrada");
          e.httpStatus = 404;
          throw e;
        }

        if (!actividad.horarios.includes(horario)) {
          const e = new Error("Horario no disponible");
          e.httpStatus = 400;
          throw e;
        }

        const visitantes = Array.isArray(visitante) ? visitante : [visitante];
        const cupoDisponible = actividad.cupos[horario] ?? 0;

        if (cupoDisponible === 0) {
          const e = new Error("Sin cupo");
          e.httpStatus = 400;
          throw e;
        }

        if (visitantes.length > cupoDisponible) {
          const e = new Error("Cantidad de participantes supera cupos disponibles");
          e.httpStatus = 400;
          throw e;
        }

        for (const v of visitantes) {
          if (!v.nombre || !v.dni || !v.edad) {
            const e = new Error("Datos incompletos del visitante");
            e.httpStatus = 400;
            throw e;
          }
        }

        if (actividad.requiereTalle && !talle) {
          const e = new Error("Talle requerido no proporcionado");
          e.httpStatus = 400;
          throw e;
        }

        actividad.cupos[horario] -= visitantes.length;
        return { mensaje: "Inscripción exitosa" };
      },
    };

    app = createApp({ container });
  });

  // ------------------- HELPERS -------------------
  const inscribir = async ({ actividadId, horario, visitante, aceptaTerminos = true, talle }) => {
    const body = { horario, visitante, aceptaTerminos };
    if (talle) body.talle = talle;
    return request(app).post(`/actividades/${actividadId}/inscripciones`).send(body);
  };

  // ------------------- RED -------------------
  it("🔴 RED: POST sin aceptar TYC debería fallar", async () => {
    const res = await inscribir({
      actividadId: "2",
      horario: "09:00",
      visitante: { nombre: "Pedro", dni: "11223344", edad: 40 },
      aceptaTerminos: false,
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "No aceptó TYC");
  });

  it("🔴 RED: POST actividad no existente debería fallar", async () => {
    const res = await inscribir({
      actividadId: "999",
      horario: "10:00",
      visitante: { nombre: "Juan", dni: "12345678", edad: 30 },
    });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Actividad no encontrada");
  });

  it("🔴 RED: POST horario no disponible debería fallar", async () => {
    const res = await inscribir({
      actividadId: "2",
      horario: "12:00",
      visitante: { nombre: "Pedro", dni: "11223344", edad: 40 },
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Horario no disponible");
  });

  it("🔴 RED: POST sin cupo debería fallar", async () => {
    const res = await inscribir({
      actividadId: "1",
      horario: "14:00",
      visitante: { nombre: "Ana", dni: "87654321", edad: 25 },
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Sin cupo");
  });

  it("🔴 RED: POST sin datos completos del visitante debería fallar", async () => {
    const res = await inscribir({
      actividadId: "2",
      horario: "09:00",
      visitante: { nombre: "Pedro", dni: "11223344" }, // falta edad
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Datos incompletos del visitante");
  });

  it("🔴 RED: POST sin talle en actividad que lo requiere debería fallar", async () => {
    const res = await inscribir({
      actividadId: "3",
      horario: "11:00",
      visitante: { nombre: "Lucía", dni: "55555555", edad: 28 },
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Talle requerido no proporcionado");
  });

  // ------------------- GREEN -------------------
  it("🟢 GREEN: POST con datos correctos debería inscribir", async () => {
    const res = await inscribir({
      actividadId: "1",
      horario: "10:00",
      visitante: { nombre: "Juan", dni: "12345678", edad: 30 },
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("mensaje", "Inscripción exitosa");
  });

  it("🟢 GREEN: POST con talle en actividad que lo requiere debería inscribir", async () => {
    const res = await inscribir({
      actividadId: "3",
      horario: "11:00",
      visitante: { nombre: "Lucía", dni: "55555555", edad: 28 },
      talle: "M",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("mensaje", "Inscripción exitosa");
  });

  it("🟢 GREEN: POST grupo dentro del cupo debería inscribir", async () => {
    const res = await inscribir({
      actividadId: "1",
      horario: "10:00",
      visitante: [
        { nombre: "Juan", dni: "123", edad: 30 },
        { nombre: "Ana", dni: "456", edad: 28 },
      ],
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("mensaje", "Inscripción exitosa");
  });

  // ------------------- REFACTOR -------------------
  it("🔵 REFACTOR: POST grupo excediendo cupo debería fallar", async () => {
    const res = await inscribir({
      actividadId: "2",
      horario: "09:00",
      visitante: [
        { nombre: "Pedro", dni: "111", edad: 35 },
        { nombre: "Lucía", dni: "222", edad: 32 },
        { nombre: "Marta", dni: "333", edad: 29 },
      ],
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Cantidad de participantes supera cupos disponibles");
  });

  it("🔵 REFACTOR: GET /actividades debería devolver la lista de actividades", async () => {
    const res = await request(app).get("/actividades");
    expect(res.status).toBe(200);
    expect(res.body.map(a => a.nombre)).toEqual(
      expect.arrayContaining(["Tirolesa", "Safari", "Palestra", "Jardinería"])
    );
  });
});
