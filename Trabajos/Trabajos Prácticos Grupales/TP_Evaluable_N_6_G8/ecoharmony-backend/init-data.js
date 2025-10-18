import { makeSequelize } from './src/db/sequelize.js';

async function initializeData() {
  try {
    console.log('🔄 Inicializando datos de ejemplo...');
    
    const { sequelize, models } = makeSequelize();
    await sequelize.authenticate();
    
    // Sincronizar modelos (crear tablas)
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas');

    const { Actividad, ActividadHorario } = models;

    // Crear actividades
    const actividades = await Actividad.bulkCreate([
      { nombre: 'Tirolesa', requiereTalle: true },
      { nombre: 'Safari', requiereTalle: false },
      { nombre: 'Palestra', requiereTalle: true },
      { nombre: 'Jardinería', requiereTalle: true }
    ]);
    console.log('✅ Actividades creadas');

    // Crear horarios para cada actividad
    const horarios = [
      // Tirolesa
      { actividad_id: actividades[0].id, hora: '10:00', cupo: 4 },
      { actividad_id: actividades[0].id, hora: '14:00', cupo: 4 },
      { actividad_id: actividades[0].id, hora: '16:00', cupo: 4 },
      
      // Safari
      { actividad_id: actividades[1].id, hora: '09:00', cupo: 2 },
      { actividad_id: actividades[1].id, hora: '11:00', cupo: 2 },
      { actividad_id: actividades[1].id, hora: '15:00', cupo: 2 },
      
      // Palestra
      { actividad_id: actividades[2].id, hora: '10:00', cupo: 3 },
      { actividad_id: actividades[2].id, hora: '12:00', cupo: 3 },
      { actividad_id: actividades[2].id, hora: '15:00', cupo: 3 },
      
      // Jardinería
      { actividad_id: actividades[3].id, hora: '08:00', cupo: 5 },
      { actividad_id: actividades[3].id, hora: '10:00', cupo: 5 },
      { actividad_id: actividades[3].id, hora: '14:00', cupo: 5 }
    ];

    await ActividadHorario.bulkCreate(horarios);
    console.log('✅ Horarios creados');

    console.log('🎉 Datos inicializados correctamente');
    console.log('\n📋 Actividades disponibles:');
    for (const actividad of actividades) {
      console.log(`  - ${actividad.nombre} (ID: ${actividad.id})`);
    }

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al inicializar datos:', error);
    process.exit(1);
  }
}

initializeData();
