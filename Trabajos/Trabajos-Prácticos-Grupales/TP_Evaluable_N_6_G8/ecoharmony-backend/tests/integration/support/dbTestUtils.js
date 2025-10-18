import { makeSequelize } from "../../../src/db/sequelize.js";

export async function setupTestDb() {
  const { sequelize, models } = makeSequelize();
  await sequelize.authenticate();
  await sequelize.sync({ force: true }); // recrea schema limpio para cada suite
  return { sequelize, models };
}

export async function seedActividades({ models }) {
  const { Actividad, ActividadHorario } = models;
  const tirolesa = await Actividad.create({ nombre: "Tirolesa", requiereTalle: true });
  const jardineria = await Actividad.create({ nombre: "Jardinería", requiereTalle: false });

  await ActividadHorario.bulkCreate([
    { actividad_id: tirolesa.id, hora: "10:00", cupo: 2 },
    { actividad_id: tirolesa.id, hora: "15:00", cupo: 2 },
    { actividad_id: jardineria.id, hora: "09:00", cupo: 1 },
  ]);

  return { tirolesa, jardineria };
}
