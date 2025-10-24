<template>
  <div class="inscripcion-view">
    <!-- Mensajes de estado -->
    <AlertModal
      :visible="!!store.error"
      type="error"
      :message="errorMessage"
      @close="store.limpiarMensajes()"
    />
    <AlertModal
      :visible="!!store.success"
      type="success"
      :message="successMessage"
      @close="store.limpiarMensajes()"
    />

    <!-- Indicador de progreso -->
    <div class="progress-indicator">
      <div class="progress-steps">
        <div 
          v-for="paso in store.totalPasos" 
          :key="paso"
          class="step"
          :class="{ 
            'active': paso === store.pasoActual,
            'completed': paso < store.pasoActual 
          }"
        >
          <div class="step-number">{{ paso }}</div>
          <div class="step-label">{{ getStepLabel(paso) }}</div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Paso 1: Selección de Actividad -->
      <div v-if="store.pasoActual === 1" class="step-content">
        <SeleccionActividad 
          :actividades="store.actividades"
          :loading="store.loading"
          @seleccionar="store.seleccionarActividad"
        />
      </div>

      <!-- Paso 2: Selección de Horario -->
      <div v-if="store.pasoActual === 2" class="step-content">
        <SeleccionHorario 
          :actividad="store.actividadSeleccionada"
          :horarios="store.horariosDisponibles"
          @seleccionar="store.seleccionarHorario"
          @volver="store.pasoAnterior"
        />
      </div>

      <!-- Paso 3: Datos de Visitantes -->
      <div v-if="store.pasoActual === 3" class="step-content">
        <DatosVisitantes 
          :visitantes="store.visitantes"
          :requiere-talle="store.requiereTalle"
          :actividad="store.actividadSeleccionada"
          :horario="store.horarioSeleccionado"
          @agregar="store.agregarVisitante"
          @remover="store.removerVisitante"
          @actualizar="store.actualizarVisitante"
          @volver="store.pasoAnterior"
          @continuar="store.aceptarTerminos"
        />
      </div>

      <!-- Paso 4: Términos y Condiciones -->
      <div v-if="store.pasoActual === 4" class="step-content">
        <TerminosCondiciones 
          :actividad="store.actividadSeleccionada"
          :horario="store.horarioSeleccionado"
          :visitantes="store.visitantes"
          :loading="store.loading"
          @volver="store.pasoAnterior"
          @confirmar="store.realizarInscripcion"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useInscripcionStore } from '../stores/inscripcion.js'
import AlertModal from '../components/AlertModal.vue'
import SeleccionActividad from '../components/SeleccionActividad.vue'
import SeleccionHorario from '../components/SeleccionHorario.vue'
import DatosVisitantes from '../components/DatosVisitantes.vue'
import TerminosCondiciones from '../components/TerminosCondiciones.vue'

export default {
  name: 'InscripcionView',
  components: { AlertModal, SeleccionActividad, SeleccionHorario, DatosVisitantes, TerminosCondiciones },
  setup() {
    const store = useInscripcionStore()
    store.cargarActividades()

    // Evita mostrar [object Object] si el store guarda objetos
    const errorMessage = computed(() => {
      const e = store.error
      if (!e) return ''
      return typeof e === 'string' ? e : (e.mensaje || JSON.stringify(e))
    })

    const successMessage = computed(() => {
      const s = store.success
      if (!s) return ''
      if (typeof s === 'object') {
        const act = s.actividad?.nombre ?? 'Actividad'
        const hora = s.horario?.hora ?? s.horario ?? 'horario'
        const cant = s.cantidad ?? s.personas ?? s.visitantes?.length ?? 1
        return `¡Inscripción exitosa! Se inscribieron ${cant} persona(s) en ${act} para el horario ${hora}. ¡Disfruten su actividad en EcoHarmony Park!`
      }
      return s
    })

    return { store, errorMessage, successMessage }
  },
  methods: {
    getStepLabel(paso) { /* igual que antes */ }
  }
}
</script>

<style scoped>
.inscripcion-view {
  max-width: 800px;
  margin: 0 auto;
}

.progress-indicator {
  margin-bottom: 2rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: #e9ecef;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: var(--primary-light);
  color: var(--white);
}

.step.completed .step-number {
  background: var(--success);
  color: var(--white);
}

.step-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-align: center;
}

.step.active .step-label {
  color: var(--primary-light);
  font-weight: 500;
}

.step.completed .step-label {
  color: var(--success);
}

.main-content {
  min-height: 400px;
}

.step-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .progress-steps {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-steps::before {
    display: none;
  }
  
  .step {
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
  }
  
  .step-number {
    margin-right: 1rem;
    margin-bottom: 0;
  }
}
</style>
