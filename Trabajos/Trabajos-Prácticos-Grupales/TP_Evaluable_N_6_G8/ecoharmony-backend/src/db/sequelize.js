import 'dotenv/config';
import { Sequelize, DataTypes } from 'sequelize';

export function makeSequelize() {
  const {
    DB_HOST = '127.0.0.1',
    DB_PORT = '3306',
    DB_NAME = 'ecoharmony_test',
    DB_USER = 'root',
    DB_PASS = 'root',
    DB_LOG = 'false'
  } = process.env;

  const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: 'mysql',
    logging: DB_LOG === 'true' ? console.log : false,
  });

  const Actividad = sequelize.define('Actividad', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    requiereTalle: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, {
    tableName: 'actividades',
    underscored: true,
  });

  const ActividadHorario = sequelize.define('ActividadHorario', {
    hora: { type: DataTypes.STRING(5), allowNull: false }, // "HH:MM"
    cupo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'actividad_horarios',
    underscored: true,
    indexes: [
      { unique: true, fields: ['actividad_id', 'hora'] }, // <-- único por actividad+hora
    ],
  });

  const Inscripcion = sequelize.define('Inscripcion', {
    horario: { type: DataTypes.STRING(5), allowNull: false },
    dni: { type: DataTypes.STRING, allowNull: false },
    nombre: { type: DataTypes.STRING, allowNull: false },
    edad: { type: DataTypes.INTEGER, allowNull: false },
    talle: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'inscripciones',
    underscored: true,
    indexes: [
      { unique: true, fields: ['actividad_id', 'horario', 'dni'] }, // <-- único por actividad+horario+dni
    ],
  });

  Actividad.hasMany(ActividadHorario, { foreignKey: 'actividad_id', as: 'horarios' });
  ActividadHorario.belongsTo(Actividad, { foreignKey: 'actividad_id', as: 'actividad' });

  Actividad.hasMany(Inscripcion, { foreignKey: 'actividad_id', as: 'inscripciones' });
  Inscripcion.belongsTo(Actividad, { foreignKey: 'actividad_id', as: 'actividad' });

  return { sequelize, models: { Actividad, ActividadHorario, Inscripcion } };
}
