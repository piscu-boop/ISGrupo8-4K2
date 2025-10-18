import axios from 'axios'

// Configuración base de axios
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// Servicio para actividades
export const actividadesService = {
  // Obtener todas las actividades
  async getActividades() {
    try {
      const response = await api.get('/actividades')
      return response.data
    } catch (error) {
      console.error('Error al obtener actividades:', error)
      throw new Error('Error al cargar las actividades')
    }
  },

  // Obtener una actividad específica
  async getActividad(id) {
    try {
      const response = await api.get(`/actividades/${id}`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Actividad no encontrada')
      }
      console.error('Error al obtener actividad:', error)
      throw new Error('Error al cargar la actividad')
    }
  },

  // Obtener horarios disponibles de una actividad
  async getHorariosDisponibles(actividadId) {
    try {
      const response = await api.get(`/actividades/${actividadId}/horarios`)
      return response.data
    } catch (error) {
      console.error('Error al obtener horarios:', error)
      throw new Error('Error al cargar los horarios')
    }
  }
}

// Servicio para inscripciones
export const inscripcionesService = {
  // Realizar una inscripción
  async inscribir(data) {
    try {
      const response = await api.post(`/actividades/${data.actividadId}/inscripciones`, {
        horario: data.horario,
        visitante: {
          nombre: data.visitante.nombre,
          dni: data.visitante.dni,
          edad: data.visitante.edad
        },
        aceptaTerminos: data.aceptaTerminos,
        talle: data.talle
      })
      return response.data
    } catch (error) {
      // Mapear errores del backend a mensajes más amigables
      if (error.response) {
        const { status, data } = error.response
        switch (status) {
          case 400:
            throw new Error(data.error || 'Datos inválidos')
          case 404:
            throw new Error('Actividad no encontrada')
          case 409:
            throw new Error(data.error || 'Conflicto en la inscripción')
          default:
            throw new Error('Error del servidor')
        }
      }
      throw new Error('Error de conexión')
    }
  }
}

export default api
