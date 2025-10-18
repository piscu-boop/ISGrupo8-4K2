import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { createApp } from "../../src/app.js";
import { setupTestDb, seedActividades } from "./support/dbTestUtils.js";
import { makeInscripcionesService } from "../../src/services/inscripcionesService.js";

describe("POST /actividades/:id/inscripciones (MySQL + Sequelize)", () => {
  let app, sequelize, models, seeded, container;

  beforeEach(async () => {
    const db = await setupTestDb();
    sequelize = db.sequelize;
    models = db.models;
    seeded = await seedActividades({ models });

    const service = makeInscripcionesService({ sequelize, models });
    container = {
      inscribirEnActividad: (args) => service.inscribirEnActividad(args),
    };
    app = createApp({ container });
  });

  afterAll(async () => {
    if (sequelize) await sequelize.close();
  });

  it("201 → inscribe correctamente y decrementa cupo en DB", async () => {
    const res = await request(app)
      .post(`/actividades/${seeded.tirolesa.id}/inscripciones`)
      .send({
        horario: "10:00",
        visitante: { nombre: "Gaston", dni: "12345678", edad: 25 },
        aceptaTerminos: true,
        talle: "M",
      })
      .expect(201);

    expect(res.body).toEqual({ ok: true });

    const row = await models.ActividadHorario.findOne({ where: { actividad_id: seeded.tirolesa.id, hora: "10:00" } });
    expect(row.cupo).toBe(1);
  });

  it("409 → cupo insuficiente", async () => {
    const id = seeded.jardineria.id;
    await request(app)
      .post(`/actividades/${id}/inscripciones`)
      .send({ horario: "09:00", visitante: { nombre: "Uno", dni: "1", edad: 20 }, aceptaTerminos: true })
      .expect(201);

    const r2 = await request(app)
      .post(`/actividades/${id}/inscripciones`)
      .send({ horario: "09:00", visitante: { nombre: "Dos", dni: "2", edad: 22 }, aceptaTerminos: true })
      .expect(409);

    expect(r2.body).toEqual({ error: "no hay cupo para este horario" });
  });

  it("409 → ya inscripto (unique por actividad+horario+dni)", async () => {
    const id = seeded.tirolesa.id;
    const payload = {
      horario: "15:00",
      visitante: { nombre: "Gaston", dni: "12345678", edad: 25 },
      aceptaTerminos: true,
      talle: "M",
    };

    await request(app).post(`/actividades/${id}/inscripciones`).send(payload).expect(201);

    const r2 = await request(app).post(`/actividades/${id}/inscripciones`).send(payload).expect(409);
    expect(r2.body).toEqual({ error: "visitante ya inscripto en este horario" });
  });
});
