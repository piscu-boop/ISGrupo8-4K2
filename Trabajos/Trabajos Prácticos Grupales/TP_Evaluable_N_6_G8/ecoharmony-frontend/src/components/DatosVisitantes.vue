<template>
  <div class="datos-visitantes">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Datos de los Visitantes</h2>
        <p>Ingresa la información de cada persona que participará</p>
      </div>
      
      <div class="card-body">
        <!-- Resumen de la selección -->
        <div class="resumen-seleccion">
          <div class="resumen-header">
            <div class="actividad-icon">{{ getActivityIcon(actividad?.nombre) }}</div>
            <h3>{{ actividad?.nombre }}</h3>
          </div>
          <div class="resumen-details">
            <div class="detail-item">
              <span class="detail-label">Horario:</span>
              <span class="detail-value">{{ formatTimeRange(horario?.hora) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Cupos disponibles:</span>
              <span class="detail-value">{{ horario?.cupo }}</span>
            </div>
          </div>
        </div>

        <!-- Lista de visitantes -->
        <div class="visitantes-section">
          <div class="visitantes-header">
            <h4>Visitantes ({{ visitantes.length }})</h4>
            <button @click="agregarVisitante" class="btn btn-primary btn-sm">
              + Agregar Visitante
            </button>
          </div>

          <div class="visitantes-list">
            <div 
              v-for="(visitante, index) in visitantes" 
              :key="index"
              class="visitante-card"
            >
              <div class="visitante-header">
                <h5>Visitante {{ index + 1 }}</h5>
                <button 
                  v-if="visitantes.length > 1"
                  @click="removerVisitante(index)" 
                  class="btn btn-danger btn-sm"
                >
                  ✕
                </button>
              </div>

              <div class="visitante-form">
                <div class="row">
                  <div class="col-6">
                    <div class="form-group">
                      <label class="form-label">Nombre completo *</label>
                      <input
                        v-model="visitante.nombre"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': !visitante.nombre && showValidation }"
                        placeholder="Ingresa el nombre completo"
                        @input="actualizarVisitante(index, 'nombre', $event.target.value)"
                      />
                      <div v-if="!visitante.nombre && showValidation" class="invalid-feedback">
                        El nombre es obligatorio
                      </div>
                    </div>
                  </div>

                  <div class="col-6">
                    <div class="form-group">
                      <label class="form-label">DNI *</label>
                      <input
                        v-model="visitante.dni"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': (!visitante.dni && showValidation) || isDniDuplicado(visitante.dni, index) }"
                        placeholder="Ingresa el DNI"
                        @input="actualizarVisitante(index, 'dni', $event.target.value)"
                      />
                      <div v-if="!visitante.dni && showValidation" class="invalid-feedback">
                        El DNI es obligatorio
                      </div>
                      <div v-if="isDniDuplicado(visitante.dni, index) && visitante.dni" class="invalid-feedback">
                        Este DNI ya está registrado para otro visitante
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-6">
                    <div class="form-group">
                      <label class="form-label">Edad *</label>
                      <input
                        v-model.number="visitante.edad"
                        type="number"
                        min="1"
                        max="120"
                        class="form-control"
                        :class="{ 'is-invalid': (!visitante.edad || visitante.edad <= 0) && showValidation }"
                        placeholder="Ingresa la edad"
                        @input="actualizarVisitante(index, 'edad', parseInt($event.target.value))"
                      />
                      <div v-if="(!visitante.edad || visitante.edad <= 0) && showValidation" class="invalid-feedback">
                        La edad debe ser mayor a 0
                      </div>
                    </div>
                  </div>

                  <div v-if="requiereTalle" class="col-6">
                    <div class="form-group">
                      <label class="form-label">Talla de vestimenta *</label>
                      <select
                        v-model="visitante.talle"
                        class="form-control"
                        :class="{ 'is-invalid': (!visitante.talle || visitante.talle.trim() === '') && showValidation }"
                        @change="actualizarVisitante(index, 'talle', $event.target.value)"
                      >
                        <option value="">Selecciona una talla</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                      <div v-if="(!visitante.talle || visitante.talle.trim() === '') && showValidation" class="invalid-feedback">
                        La talla es obligatoria para esta actividad
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de navegación -->
        <div class="navigation-buttons">
          <button @click="volver" class="btn btn-secondary">
            ← Volver a Horarios
          </button>
          <button 
            @click="continuar" 
            class="btn btn-primary"
            :disabled="!puedeContinuar"
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DatosVisitantes',
  props: {
    visitantes: {
      type: Array,
      default: () => []
    },
    requiereTalle: {
      type: Boolean,
      default: false
    },
    actividad: {
      type: Object,
      default: null
    },
    horario: {
      type: Object,
      default: null
    }
  },
  emits: ['agregar', 'remover', 'actualizar', 'volver', 'continuar'],
  data() {
    return {
      showValidation: false
    }
  },
  computed: {
    puedeContinuar() {
      if (this.visitantes.length === 0) return false
      
      // Verificar que todos los visitantes tengan datos válidos
      const datosValidos = this.visitantes.every(visitante => {
        const datosBasicos = visitante.nombre && visitante.dni && visitante.edad && visitante.edad > 0
        const talla = this.requiereTalle ? (visitante.talle && visitante.talle.trim() !== '') : true
        return datosBasicos && talla
      })
      
      // Verificar que no haya DNIs duplicados
      const sinDnisDuplicados = this.visitantes.every((visitante, index) => 
        !this.isDniDuplicado(visitante.dni, index)
      )
      
      return datosValidos && sinDnisDuplicados
    }
  },
  methods: {
    agregarVisitante() {
      this.$emit('agregar')
    },
    removerVisitante(index) {
      this.$emit('remover', index)
    },
    actualizarVisitante(index, campo, valor) {
      this.$emit('actualizar', index, campo, valor)
    },
    volver() {
      this.$emit('volver')
    },
    continuar() {
      this.showValidation = true
      if (this.puedeContinuar) {
        this.$emit('continuar')
      }
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
      if (!hora) return ''
      // Convertir hora de inicio a hora de fin (agregar 1 hora)
      const [hours, minutes] = hora.split(':')
      const startTime = parseInt(hours)
      const endTime = startTime + 1
      const endTimeFormatted = endTime.toString().padStart(2, '0') + ':' + minutes
      return `${hora} - ${endTimeFormatted}`
    },
    isDniDuplicado(dni, currentIndex) {
      if (!dni || dni.trim() === '') return false
      
      // Buscar si hay otro visitante con el mismo DNI
      return this.visitantes.some((visitante, index) => 
        index !== currentIndex && 
        visitante.dni && 
        visitante.dni.trim().toLowerCase() === dni.trim().toLowerCase()
      )
    }
  }
}
</script>

<style scoped>
.resumen-seleccion {
  background: var(--gray-light);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--primary-light);
}

.resumen-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.actividad-icon {
  font-size: 2.5rem;
}

.resumen-seleccion h3 {
  margin: 0;
  color: var(--primary-dark);
  font-size: 1.5rem;
  text-align: center;
}

.resumen-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: var(--text-medium);
}

.detail-value {
  font-weight: 600;
  color: var(--primary-dark);
}

.visitantes-section h4 {
  margin: 0 0 1.5rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.visitantes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.visitantes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.visitante-card {
  border: 2px solid #e9ecef;
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: white;
  transition: border-color 0.3s ease;
}

.visitante-card:hover {
  border-color: var(--primary-light);
}

.visitante-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.visitante-header h5 {
  margin: 0;
  color: var(--primary-dark);
  font-size: 1.25rem;
}

.visitante-form {
  margin-top: 1rem;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .visitantes-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .navigation-buttons {
    flex-direction: column;
  }
  
  .row {
    flex-direction: column;
  }
  
  .col-6 {
    flex: 0 0 100%;
  }
}
</style>
