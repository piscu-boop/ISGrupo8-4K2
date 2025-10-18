<template>
  <div class="seleccion-horario">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Selecciona un Horario</h2>
        <p>{{ actividad?.nombre }} - Elige el horario que prefieras</p>
      </div>
      
      <div class="card-body">
        <!-- Horarios disponibles -->
        <div class="horarios-section">
          <h4>Horarios disponibles:</h4>
          <div class="horarios-grid">
            <div 
              v-for="horario in horariosDisponibles" 
              :key="horario.hora"
              class="horario-card"
              @click="seleccionarHorario(horario)"
            >
              <div class="horario-time">{{ formatTimeRange(horario.hora) }}</div>
              <div class="horario-cupo">
                <span class="cupo-disponible">
                  {{ horario.cupo }} cupo{{ horario.cupo !== 1 ? 's' : '' }} disponible{{ horario.cupo !== 1 ? 's' : '' }}
                </span>
              </div>
              <div class="horario-action">
                <button class="btn btn-primary btn-sm">
                  Seleccionar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de navegación -->
        <div class="navigation-buttons">
          <button @click="volver" class="btn btn-secondary">
            ← Volver a Actividades
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeleccionHorario',
  props: {
    actividad: {
      type: Object,
      default: null
    },
    horarios: {
      type: Array,
      default: () => []
    }
  },
  emits: ['seleccionar', 'volver'],
  computed: {
    horariosDisponibles() {
      // Filtrar solo horarios con cupos disponibles
      return this.horarios.filter(horario => horario.cupo > 0)
    }
  },
  methods: {
    seleccionarHorario(horario) {
      this.$emit('seleccionar', horario)
    },
    volver() {
      this.$emit('volver')
    },
    getActivityIcon(nombre) {
      const icons = {
        'Tirolesa': '🪂',
        'Safari': '🦁',
        'Palestra': '🧗',
        'Jardinería': '🌱'
      }
      return icons[nombre] || '🎯'
    },
    formatTimeRange(hora) {
      // Convertir hora de inicio a hora de fin (agregar 1 hora)
      const [hours, minutes] = hora.split(':')
      const startTime = parseInt(hours)
      const endTime = startTime + 1
      const endTimeFormatted = endTime.toString().padStart(2, '0') + ':' + minutes
      return `${hora} - ${endTimeFormatted}`
    }
  }
}
</script>

<style scoped>
.actividad-info {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--primary-light);
}

.actividad-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.actividad-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-dark);
  font-size: 1.5rem;
}

.actividad-info p {
  margin: 0 0 1rem 0;
  color: #6c757d;
  line-height: 1.6;
}

.actividad-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: #e9ecef;
  color: #6c757d;
}

.actividad-badge.requiere-talle {
  background: #fff3cd;
  color: #856404;
}

.horarios-section h4 {
  margin: 0 0 1.5rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.horario-card {
  border: 2px solid #e9ecef;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.horario-card:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 163, 93, 0.15);
}

.horario-time {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
}

.horario-cupo {
  margin-bottom: 1rem;
}

.cupo-disponible {
  color: #28a745;
  font-weight: 500;
}

.cupo-agotado {
  color: #dc3545;
  font-weight: 500;
}

.horario-action {
  margin-top: 1rem;
}

.navigation-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
}

@media (max-width: 768px) {
  .horarios-grid {
    grid-template-columns: 1fr;
  }
  
  .horario-time {
    font-size: 1.5rem;
  }
  
  .navigation-buttons {
    justify-content: center;
  }
}
</style>
