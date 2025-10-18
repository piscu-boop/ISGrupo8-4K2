import express from "express";

/**
 * Factory de la app HTTP.
 * Espera un objeto { container } con:
 *   - container.inscribirEnActividad({ actividadId, horario, visitante, aceptaTerminos, talle })
 *     -> { ok: true } o lanza Error con e.httpStatus y e.message
 */
export function createApp({ container }) {
  const app = express();
  app.use(express.json());

  app.post("/actividades/:id/inscripciones", async (req, res) => {
    const { id } = req.params;
    const { horario, visitante, aceptaTerminos, talle } = req.body || {};
    try {
      const result = await container.inscribirEnActividad({
        actividadId: id,
        horario,
        visitante,
        aceptaTerminos,
        talle,
      });
      return res.status(201).json(result);
    } catch (e) {
      const status = e?.httpStatus ?? 400;
      const message = e?.message ?? "error";
      if (status >= 500) console.error(e);
      return res.status(status).json({ error: message });
    }
  });

  app.use((req, res) => res.status(404).json({ error: "not found" }));
  return app;
}