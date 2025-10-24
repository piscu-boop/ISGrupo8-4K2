<template>
  <div class="terminos-condiciones">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Términos y Condiciones</h2>
        <p>Revisa y acepta los términos antes de confirmar tu inscripción</p>
      </div>
      
      <div class="card-body">
        <!-- Resumen de la inscripción -->
        <div class="resumen-inscripcion">
          <h3>Resumen de tu inscripción</h3>
          <div class="resumen-details">
            <div class="resumen-item">
              <strong>Actividad:</strong> {{ actividad?.nombre }}
            </div>
            <div class="resumen-item">
              <strong>Horario:</strong> {{ horario?.hora }}
            </div>
            <div class="resumen-item">
              <strong>Participantes:</strong> {{ visitantes.length }}
            </div>
          </div>
        </div>

        <!-- Lista de participantes -->
        <div class="participantes-section">
          <h4>Participantes inscriptos:</h4>
          <div class="participantes-list">
            <div 
              v-for="(visitante, index) in visitantes" 
              :key="index"
              class="participante-item"
            >
              <div class="participante-info">
                <strong>{{ visitante.nombre }}</strong>
                <span class="participante-details">
                  DNI: {{ visitante.dni }} | Edad: {{ visitante.edad }}
                  <span v-if="visitante.talle"> | Talla: {{ visitante.talle }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Términos y condiciones -->
        <div class="terminos-section">
          <h4>Términos y Condiciones - {{ actividad?.nombre }}</h4>
          <div class="terminos-content">
            <div v-if="showFullTerms">
              <p>Al participar en esta actividad, usted acepta:</p>
              <ul>
                <li>Cumplir con todas las normas de seguridad del parque</li>
                <li>Respetar el horario asignado y llegar puntualmente</li>
                <li>Asumir la responsabilidad por su participación</li>
                <li>Permitir el uso de su imagen para fines promocionales</li>
                <li>Cancelaciones con 24 horas de anticipación</li>
                <li>No consumir alcohol o sustancias prohibidas durante la actividad</li>
                <li>Seguir las instrucciones del personal del parque</li>
                <li>El parque se reserva el derecho de admisión</li>
              </ul>
              
              <div class="terminos-warning">
                <strong>⚠️ Importante:</strong> 
                La participación en esta actividad es bajo su propio riesgo. 
                EcoHarmony Park no se hace responsable por lesiones o accidentes 
                que puedan ocurrir durante la actividad.
              </div>
            </div>
            
            <div class="terminos-link">
              <a href="#" @click.prevent="showFullTerms = !showFullTerms" class="terms-link">
                {{ showFullTerms ? 'Ocultar términos completos' : 'Ver términos y condiciones completos' }}
              </a>
            </div>
          </div>
        </div>

        <!-- Checkbox de aceptación -->
        <div class="aceptacion-section">
          <div class="form-check">
            <input
              id="aceptaTerminos"
              v-model="aceptaTerminos"
              type="checkbox"
              class="form-check-input"
              :class="{ 'is-invalid': !aceptaTerminos && showValidation }"
            />
            <label for="aceptaTerminos" class="form-check-label">
              <strong>He leído y acepto los términos y condiciones</strong>
              <span class="text-muted">*</span>
            </label>
          </div>
          <div v-if="!aceptaTerminos && showValidation" class="invalid-feedback">
            Debe aceptar los términos y condiciones para continuar
          </div>
        </div>

        <!-- Botones de navegación -->
        <div class="navigation-buttons">
          <button @click="volver" class="btn btn-secondary">
            ← Volver a Datos
          </button>
          <button 
            @click="confirmar" 
            class="btn btn-primary btn-lg"
            :disabled="!aceptaTerminos || loading"
          >
            <span v-if="loading" class="spinner-sm"></span>
            {{ loading ? 'Procesando...' : 'Confirmar Inscripción' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TerminosCondiciones',
  props: {
    actividad: {
      type: Object,
      default: null
    },
    horario: {
      type: Object,
      default: null
    },
    visitantes: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['volver', 'confirmar'],
  data() {
    return {
      aceptaTerminos: false,
      showValidation: false,
      showFullTerms: false
    }
  },
  methods: {
    volver() {
      this.$emit('volver')
    },
    confirmar() {
      this.showValidation = true
      if (this.aceptaTerminos) {
        this.$emit('confirmar')
      }
    }
  }
}
</script>

<style scoped>
.resumen-inscripcion {
  background: linear-gradient(135deg, #4a7c59, #2c5530);
  color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.resumen-inscripcion h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.resumen-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.resumen-item {
  font-size: 1rem;
}

.participantes-section {
  margin-bottom: 2rem;
}

.participantes-section h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.participantes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.participante-item {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid #4a7c59;
}

.participante-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.participante-details {
  font-size: 0.875rem;
  color: #6c757d;
}

.terminos-section {
  margin-bottom: 2rem;
}

.terminos-section h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.terminos-content {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.terminos-content p {
  margin: 0 0 1rem 0;
  font-weight: 500;
  color: #495057;
}

.terminos-content ul {
  margin: 0 0 1.5rem 0;
  padding-left: 1.5rem;
}

.terminos-content li {
  margin-bottom: 0.5rem;
  color: #6c757d;
  line-height: 1.6;
}

.terminos-warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 0.5rem;
  padding: 1rem;
  color: #856404;
  margin-bottom: 1rem;
}

.terminos-link {
  text-align: center;
}

.terms-link {
  color: var(--primary-medium);
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.aceptacion-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  border: 2px solid #e9ecef;
}

.form-check {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.form-check-input {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  line-height: 1.5;
}

.text-muted {
  color: #6c757d;
  font-weight: normal;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.spinner-sm {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .resumen-details {
    grid-template-columns: 1fr;
  }
  
  .navigation-buttons {
    flex-direction: column;
  }
  
  .form-check {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
