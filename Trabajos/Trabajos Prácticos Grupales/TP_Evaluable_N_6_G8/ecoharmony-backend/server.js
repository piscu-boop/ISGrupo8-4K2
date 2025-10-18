import { createApp } from './src/app.js';
import { makeSequelize } from './src/db/sequelize.js';
import { makeInscripcionesService } from './src/services/inscripcionesService.js';

async function startServer() {
  try {
    // Configurar base de datos
    const { sequelize, models } = makeSequelize();
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Sincronizar modelos
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');

    // Crear servicio de inscripciones
    const inscripcionesService = makeInscripcionesService({ sequelize, models });

    // Crear contenedor de dependencias
    const container = {
      getActividades: () => inscripcionesService.getActividades(),
      getActividad: (id) => inscripcionesService.getActividad(id),
      getHorariosActividad: (id) => inscripcionesService.getHorariosActividad(id),
      inscribirEnActividad: (data) => inscripcionesService.inscribirEnActividad(data)
    };

    // Crear aplicación
    const app = createApp({ container });

    // Iniciar servidor
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log('📋 Endpoints disponibles:');
      console.log('  GET  /actividades - Listar todas las actividades');
      console.log('  GET  /actividades/:id - Obtener actividad específica');
      console.log('  GET  /actividades/:id/horarios - Obtener horarios de actividad');
      console.log('  POST /actividades/:id/inscripciones - Realizar inscripción');
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
