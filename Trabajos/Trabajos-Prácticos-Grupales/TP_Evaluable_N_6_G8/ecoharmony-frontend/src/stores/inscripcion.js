import { defineStore } from 'pinia'
import { actividadesService, inscripcionesService } from '../services/api.js'

export const useInscripcionStore = defineStore('inscripcion', {
  state: () => ({
    // Datos de la inscripción
    actividadSeleccionada: null,
    horarioSeleccionado: null,
    visitantes: [],
    aceptaTerminos: false,
    
    // Estado de la aplicación
    actividades: [],
    loading: false,
    error: null,
    success: null,
    
    // Paso actual del formulario
    pasoActual: 1,
    totalPasos: 4
  }),

  getters: {
    // Obtener actividad por ID
    getActividadById: (state) => (id) => {
      return state.actividades.find(act => act.id === id)
    },

    // Obtener horarios disponibles de la actividad seleccionada
    horariosDisponibles: (state) => {
      if (!state.actividadSeleccionada) return []
      return state.actividadSeleccionada.horarios || []
    },

    // Verificar si se puede avanzar al siguiente paso
    puedeAvanzar: (state) => {
      switch (state.pasoActual) {
        case 1:
          return state.actividadSeleccionada !== null
        case 2:
          return state.horarioSeleccionado !== null
        case 3:
          return state.visitantes.length > 0 && 
                 state.visitantes.every(v => v.nombre && v.dni && v.edad)
        case 4:
          return state.aceptaTerminos
        default:
          return false
      }
    },

    // Verificar si la actividad requiere talla
    requiereTalle: (state) => {
      return state.actividadSeleccionada?.requiereTalle || false
    },

    // Verificar si todos los visitantes tienen talla (si es requerida)
    todosTienenTalla: (state) => {
      if (!state.requiereTalle) return true
      return state.visitantes.every(v => v.talle && v.talle.trim() !== '')
    }
  },

  actions: {
    // Cargar actividades
    async cargarActividades() {
      this.loading = true
      this.error = null
      try {
        this.actividades = await actividadesService.getActividades()
      } catch (error) {
        this.error = 'Error al cargar las actividades: ' + error.message
      } finally {
        this.loading = false
      }
    },

    // Seleccionar actividad
    seleccionarActividad(actividad) {
      this.actividadSeleccionada = actividad
      this.horarioSeleccionado = null
      this.visitantes = []
      this.aceptaTerminos = false
      this.pasoActual = 2
    },

    // Seleccionar horario
    seleccionarHorario(horario) {
      this.horarioSeleccionado = horario
      this.pasoActual = 3
    },

    // Agregar visitante
    agregarVisitante() {
      this.visitantes.push({
        nombre: '',
        dni: '',
        edad: null,
        talle: ''
      })
    },

    // Remover visitante
    removerVisitante(index) {
      this.visitantes.splice(index, 1)
    },

    // Actualizar visitante
    actualizarVisitante(index, campo, valor) {
      if (this.visitantes[index]) {
        this.visitantes[index][campo] = valor
      }
    },

    // Aceptar términos y condiciones
    aceptarTerminos() {
      this.aceptaTerminos = true
      this.pasoActual = 4
    },

    // Realizar inscripción
    async realizarInscripcion() {
      this.loading = true
      this.error = null
      this.success = null

      try {
        // Validar DNIs duplicados antes de enviar
        const dnis = this.visitantes.map(v => v.dni?.trim().toLowerCase()).filter(dni => dni)
        const dnisUnicos = new Set(dnis)
        
        if (dnis.length !== dnisUnicos.size) {
          throw new Error('No se pueden inscribir visitantes con el mismo DNI')
        }

        // Verificar que hay suficientes cupos disponibles
        const cuposDisponibles = this.horarioSeleccionado?.cupo || 0
        if (this.visitantes.length > cuposDisponibles) {
          throw new Error(`No hay suficientes cupos disponibles. Se requieren ${this.visitantes.length} cupos pero solo hay ${cuposDisponibles} disponibles.`)
        }

        // Realizar inscripción para cada visitante de forma secuencial
        // para evitar condiciones de carrera con los cupos
        for (const visitante of this.visitantes) {
          await inscripcionesService.inscribir({
            actividadId: this.actividadSeleccionada.id,
            horario: this.horarioSeleccionado.hora,
            visitante: {
              nombre: visitante.nombre,
              dni: visitante.dni,
              edad: visitante.edad
            },
            aceptaTerminos: this.aceptaTerminos,
            talle: this.requiereTalle ? visitante.talle : null
          })
          
          // Actualizar cupos disponibles después de cada inscripción
          await this.actualizarCuposDisponibles()
        }
        
        this.success = `🎉 ¡Inscripción exitosa! Se inscribieron ${this.visitantes.length} persona(s) en ${this.actividadSeleccionada.nombre} para el horario ${this.horarioSeleccionado}. ¡Disfruten su actividad en EcoHarmony Park!`
        
        // Limpiar formulario
        this.resetearFormulario()
        
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Resetear formulario
    resetearFormulario() {
      this.actividadSeleccionada = null
      this.horarioSeleccionado = null
      this.visitantes = []
      this.aceptaTerminos = false
      this.pasoActual = 1
    },

    // Navegar entre pasos
    irAPaso(paso) {
      if (paso >= 1 && paso <= this.totalPasos) {
        this.pasoActual = paso
      }
    },

    // Ir al paso anterior
    pasoAnterior() {
      if (this.pasoActual > 1) {
        this.pasoActual--
      }
    },

    // Ir al siguiente paso
    siguientePaso() {
      if (this.pasoActual < this.totalPasos && this.puedeAvanzar) {
        this.pasoActual++
      }
    },

    // Actualizar cupos disponibles
    async actualizarCuposDisponibles() {
      if (this.actividadSeleccionada && this.horarioSeleccionado) {
        try {
          const horarios = await actividadesService.getHorariosDisponibles(this.actividadSeleccionada.id)
          const horarioActualizado = horarios.find(h => h.hora === this.horarioSeleccionado.hora)
          if (horarioActualizado) {
            this.horarioSeleccionado.cupo = horarioActualizado.cupo
          }
        } catch (error) {
          console.warn('Error al actualizar cupos:', error)
        }
      }
    },

    // Limpiar mensajes
    limpiarMensajes() {
      this.error = null
      this.success = null
    }
  }
})
