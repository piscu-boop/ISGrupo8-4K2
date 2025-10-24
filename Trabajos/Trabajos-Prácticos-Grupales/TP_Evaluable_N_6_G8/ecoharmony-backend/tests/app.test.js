import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import { createApp } from "../src/app.js";

describe("App - tests EcoHarmony actividades US 'Inscribirme a actividad'", () => {
  let app;
  let container;

  beforeEach(() => {
    // Actividades simuladas con cupos y talles requeridos
    const actividades = [
      { id: "1", nombre: "Tirolesa", horarios: ["10:00", "14:00"], cupos: { "10:00": 3, "14:00": 0 }, requiereTalle: false },
      { id: "2", nombre: "Safari", horarios: ["09:00"], cupos: { "09:00": 2 }, requiereTalle: false },
      { id: "3", nombre: "Palestra", horarios: ["11:00"], cupos: { "11:00": 1 }, requiereTalle: true },
      { id: "4", nombre: "Jardinería", horarios: ["15:00"], cupos: { "15:00": 0 }, requiereTalle: false },
    ];

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

        // Validación de datos de cada visitante
        for (const v of visitantes) {
          if (!v.nombre || !v.dni || !v.edad) {
            const e = new Error("Datos incompletos del visitante");
            e.httpStatus = 400;
            throw e;
          }
        }

        if (actividad.requiereTalle) {
          if (!talle) {
            const e = new Error("Talle requerido no proporcionado");
            e.httpStatus = 400;
            throw e;
          }
        }

        // Reducimos cupo
        actividad.cupos[horario] -= visitantes.length;

        return { mensaje: "Inscripción exitosa" };
      },
    };

    function acceptCheck(aceptaTerminos) {
      return aceptaTerminos === true;
    }

    app = createApp({ container });
  });

  // ----------------- Tests individuales -----------------
  it("GET /actividades debería devolver la lista de actividades", async () => {
    const res = await request(app).get("/actividades");
    expect(res.status).toBe(200);
    expect(res.body.map(a => a.nombre)).toEqual(
      expect.arrayContaining(["Tirolesa", "Safari", "Palestra", "Jardinería"])
    );
  });

  it("POST /actividades/:id/inscripciones con cupo y datos correctos debería inscribir", async () => {
    const res = await request(app)
      .post("/actividades/1/inscripciones")
      .send({
        horario: "10:00",
        visitante: { nombre: "Juan", dni: "12345678", edad: 30 },
        aceptaTerminos: true,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("mensaje", "Inscripción exitosa");
  });

  it("POST /actividades/:id/inscripciones sin cupo debería fallar", async () => {
    const res = await request(app)
      .post("/actividades/1/inscripciones")
      .send({
        horario: "14:00",
        visitante: { nombre: "Ana", dni: "87654321", edad: 25 },
        aceptaTerminos: true,
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Sin cupo");
  });

  it("POST /actividades/:id/inscripciones sin aceptar TYC debería fallar", async () => {
    const res = await request(app)
      .post("/actividades/2/inscripciones")
      .send({
        horario: "09:00",
        visitante: { nombre: "Pedro", dni: "11223344", edad: 40 },
        aceptaTerminos: false,
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "No aceptó TYC");
  });

  it("POST /actividades/:id/inscripciones actividad no existente debería fallar", async () => {
    const res = await request(app)
      .post("/actividades/999/inscripciones")
      .send({
        horario: "10:00",
        visitante: { nombre: "Juan", dni: "12345678", edad: 30 },
        aceptaTerminos: true,
      });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Actividad no encontrada");
  });

  it("POST /actividades/:id/inscripciones con horario no disponible debería fallar", async () => {
    const res = await request(app)
      .post("/actividades/2/inscripciones")
      .send({
        horario: "12:00",
        visitante: { nombre: "Pedro", dni: "11223344", edad: 40 },
        aceptaTerminos: true,
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Horario no disponible");
  });

  it("POST /actividades/:id/inscripciones sin edad debería fallar", async () => {
    const res = await request(app)
      .post("/actividades/2/inscripciones")
      .send({
        horario: "09:00",
        visitante: { nombre: "Pedro", dni: "11223344" },
        aceptaTerminos: true,
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Datos incompletos del visitante");
  });

  it("POST /actividades/:id/inscripciones sin talle en actividad que lo requiere debería fallar", async () => {
    const res = await request(app)
      .post("/actividades/3/inscripciones")
      .send({
        horario: "11:00",
        visitante: { nombre: "Lucía", dni: "55555555", edad: 28 },
        aceptaTerminos: true,
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Talle requerido no proporcionado");
  });

  it("POST /actividades/:id/inscripciones con talle en actividad que lo requiere debería inscribir", async () => {
    const res = await request(app)
      .post("/actividades/3/inscripciones")
      .send({
        horario: "11:00",
        visitante: { nombre: "Lucía", dni: "55555555", edad: 28 },
        aceptaTerminos: true,
        talle: "M",
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("mensaje", "Inscripción exitosa");
  });

  // ----------------- Tests grupales -----------------
  it("POST /actividades/:id/inscripciones grupo dentro del cupo debería inscribir", async () => {
    const res = await request(app)
      .post("/actividades/1/inscripciones")
      .send({
        horario: "10:00",
        visitante: [
          { nombre: "Juan", dni: "123", edad: 30 },
          { nombre: "Ana", dni: "456", edad: 28 },
        ],
        aceptaTerminos: true,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("mensaje", "Inscripción exitosa");
  });

  it("POST /actividades/:id/inscripciones grupo excediendo cupo debería fallar", async () => {
    const res = await request(app)
      .post("/actividades/2/inscripciones")
      .send({
        horario: "09:00",
        visitante: [
          { nombre: "Pedro", dni: "111", edad: 35 },
          { nombre: "Lucía", dni: "222", edad: 32 },
          { nombre: "Marta", dni: "333", edad: 2900 },
        ],
        aceptaTerminos: true,
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Cantidad de participantes supera cupos disponibles");
  });
});
