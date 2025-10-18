<template>
  <div class="seleccion-actividad">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Seleccione una Actividad</h2>
        <p>Elige la actividad en la que deseas participar</p>
      </div>
      
      <div class="card-body">
        <!-- Loading -->
        <div v-if="loading" class="text-center">
          <div class="spinner"></div>
          <p>Cargando actividades...</p>
        </div>

        <!-- Lista de actividades -->
        <div v-else class="actividades-grid">
          <div 
            v-for="actividad in actividades" 
            :key="actividad.id"
            class="actividad-card"
            :class="{ 'sin-cupos': getHorariosDisponibles(actividad).length === 0 }"
            @click="seleccionarActividad(actividad)"
          >
            <div class="actividad-header">
              <div class="actividad-icon">
                {{ getActivityIcon(actividad.nombre) }}
              </div>
              <h3>{{ actividad.nombre }}</h3>
              <div class="actividad-badge" :class="{ 'requiere-talle': actividad.requiereTalle }">
                {{ actividad.requiereTalle ? 'Requiere talle' : 'No requiere talle' }}
              </div>
            </div>
            
            <p class="actividad-descripcion">{{ actividad.descripcion }}</p>
            
            <div class="actividad-horarios">
              <h4 v-if="getHorariosDisponibles(actividad).length > 0">Horarios disponibles:</h4>
              <h4 v-else class="cupos-agotados">Cupos agotados</h4>
              <div class="horarios-list" v-if="getHorariosDisponibles(actividad).length > 0">
                <span 
                  v-for="horario in getHorariosDisponibles(actividad)" 
                  :key="horario.hora"
                  class="horario-badge"
                >
                  {{ formatTimeRange(horario.hora) }} ({{ horario.cupo }} cupos)
                </span>
              </div>
            </div>
            
            <div class="actividad-footer">
              <button 
                class="btn"
                :class="getHorariosDisponibles(actividad).length > 0 ? 'btn-primary' : 'btn-disabled'"
                :disabled="getHorariosDisponibles(actividad).length === 0"
              >
                {{ getHorariosDisponibles(actividad).length > 0 ? `Seleccionar ${actividad.nombre}` : 'Sin cupos disponibles' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeleccionActividad',
  props: {
    actividades: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['seleccionar'],
  methods: {
    seleccionarActividad(actividad) {
      // Solo permitir selección si hay horarios disponibles
      if (this.getHorariosDisponibles(actividad).length > 0) {
        this.$emit('seleccionar', actividad)
      }
    },
    getHorariosDisponibles(actividad) {
      // Filtrar solo los horarios con cupos > 0
      return actividad.horarios ? actividad.horarios.filter(horario => horario.cupo > 0) : []
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
.actividades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.actividad-card {
  border: 2px solid #e9ecef;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.actividad-card:hover {
  border-color: var(--primary-light);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(61, 163, 93, 0.15);
}

.actividad-card.sin-cupos {
  opacity: 0.6;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.actividad-card.sin-cupos:hover {
  transform: none;
  box-shadow: none;
  border-color: #dee2e6;
}

.actividad-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.actividad-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.actividad-header h3 {
  margin: 0;
  color: var(--primary-dark);
  font-size: 1.5rem;
  text-align: center;
}

.actividad-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: #e9ecef;
  color: #6c757d;
}

.actividad-badge.requiere-talle {
  background: #fff3cd;
  color: #856404;
}

.actividad-descripcion {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.actividad-horarios h4 {
  margin: 0 0 0.75rem 0;
  color: #495057;
  font-size: 1rem;
}

.cupos-agotados {
  margin: 0 0 0.75rem 0;
  color: #dc3545;
  font-size: 1rem;
  font-weight: 600;
}

.horarios-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.horario-badge {
  padding: 0.25rem 0.5rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #495057;
}

.actividad-footer {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a7c59;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estilos para botones */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: var(--primary-light);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.btn-disabled {
  background: #6c757d;
  color: #fff;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-disabled:hover {
  background: #6c757d;
  transform: none;
}

@media (max-width: 768px) {
  .actividades-grid {
    grid-template-columns: 1fr;
  }
  
  .actividad-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .horarios-list {
    justify-content: center;
  }
}
</style>
