// src/services/inscripcionesService.js
import { Visitante } from '../domain/visitante.js';
import { Actividad as ActividadDominio } from '../domain/actividad.js';

export function makeInscripcionesService({ sequelize, models }) {
  const { Actividad, ActividadHorario, Inscripcion } = models;

  return {
    async getActividades() {
      const actividades = await Actividad.findAll({ 
        include: [{ model: ActividadHorario, as: 'horarios' }] 
      });
      
      return actividades.map(act => ({
        id: act.id,
        nombre: act.nombre,
        requiereTalle: act.requiereTalle,
        descripcion: getDescripcionActividad(act.nombre),
        horarios: act.horarios.map(h => ({
          hora: h.hora,
          cupo: h.cupo
        }))
      }));
    },

    async getActividad(id) {
      const actividad = await Actividad.findByPk(id, { 
        include: [{ model: ActividadHorario, as: 'horarios' }] 
      });
      
      if (!actividad) return null;
      
      return {
        id: actividad.id,
        nombre: actividad.nombre,
        requiereTalle: actividad.requiereTalle,
        descripcion: getDescripcionActividad(actividad.nombre),
        horarios: actividad.horarios.map(h => ({
          hora: h.hora,
          cupo: h.cupo
        }))
      };
    },

    async getHorariosActividad(actividadId) {
      const actividad = await Actividad.findByPk(actividadId, { 
        include: [{ model: ActividadHorario, as: 'horarios' }] 
      });
      
      if (!actividad) {
        const err = new Error('actividad no encontrada');
        err.httpStatus = 404;
        throw err;
      }
      
      return actividad.horarios.map(h => ({
        hora: h.hora,
        cupo: h.cupo
      }));
    },

    async inscribirEnActividad({ actividadId, horario, visitante, aceptaTerminos, talle }) {
      const act = await Actividad.findByPk(actividadId, { include: [{ model: ActividadHorario, as: 'horarios' }] });
      if (!act) {
        const err = new Error('actividad no encontrada');
        err.httpStatus = 404;
        throw err;
      }

      const cuposPorHorario = {};
      for (const h of act.horarios) cuposPorHorario[h.hora] = h.cupo;

      const actividadDom = new ActividadDominio(act.nombre, {
        requiereTalle: act.requiereTalle,
        cuposPorHorario,
      });

      // ⚠️ Mapear errores del dominio (antes de ir a la DB)
      try {
        actividadDom.inscribir(new Visitante(visitante), horario, { aceptaTerminos, talle });
      } catch (e) {
        const msg = e?.message || 'error';
        const conflictMsgs = [
          'no hay cupo para este horario',
          'visitante ya inscripto en este horario',
        ];
        const err = new Error(msg);
        err.httpStatus = conflictMsgs.includes(msg) ? 409 : 400;
        throw err;
      }

      // Persistencia con transacción y lock
      return await sequelize.transaction(async (t) => {
        const hNorm = String(horario ?? '').trim();

        const horarioRow = await ActividadHorario.findOne({
          where: { actividad_id: actividadId, hora: hNorm },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!horarioRow) {
          const e = new Error('horario no disponible');
          e.httpStatus = 400;
          throw e;
        }
        if (horarioRow.cupo <= 0) {
          const e = new Error('no hay cupo para este horario');
          e.httpStatus = 409;
          throw e;
        }

        // (a) Chequeo explícito de duplicado ANTES de insertar (defensivo)
        const existe = await Inscripcion.findOne({
          where: { actividad_id: actividadId, horario: hNorm, dni: visitante.dni },
          transaction: t,
          lock: t.LOCK.UPDATE, // leve contención
        });
        if (existe) {
          const e = new Error('visitante ya inscripto en este horario');
          e.httpStatus = 409;
          throw e;
        }

        // (b) Insertar inscripción — si el índice único salta, atrapamos y mapeamos
        try {
          await Inscripcion.create({
            actividad_id: actividadId,
            horario: hNorm,
            dni: visitante.dni,
            nombre: visitante.nombre,
            edad: visitante.edad,
            talle: talle ?? null,
          }, { transaction: t });
        } catch (err) {
          // SequelizeUniqueConstraintError u otros
          if (err?.name === 'SequelizeUniqueConstraintError') {
            const e = new Error('visitante ya inscripto en este horario');
            e.httpStatus = 409;
            throw e;
          }
          throw err;
        }

        // (c) Decrementar cupo
        horarioRow.cupo = horarioRow.cupo - 1;
        await horarioRow.save({ transaction: t });

        return { ok: true };
      });
    },
  };
}

// Función helper para obtener descripciones de actividades
function getDescripcionActividad(nombre) {
  const descripciones = {
    'Tirolesa': 'Deslizate por la tirolesa y disfruta de las vistas panorámicas del parque. Se requiere vestimenta especial.',
    'Safari': 'Recorre el parque en un safari guiado para observar la fauna local. No se requiere vestimenta especial.',
    'Palestra': 'Escala nuestra palestra artificial y desafía tus límites físicos. Se requiere vestimenta deportiva.',
    'Jardinería': 'Aprende técnicas de jardinería y cuida nuestro hermoso jardín. Se requiere ropa de trabajo.'
  };
  return descripciones[nombre] || 'Actividad recreativa en EcoHarmony Park';
}
