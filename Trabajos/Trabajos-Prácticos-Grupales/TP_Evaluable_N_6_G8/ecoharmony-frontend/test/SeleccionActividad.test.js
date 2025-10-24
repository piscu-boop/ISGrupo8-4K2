import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SeleccionActividad from '../src/components/SeleccionActividad.vue'

describe('SeleccionActividad', () => {
  const actividadesMock = [
    {
      id: 1,
      nombre: 'Tirolesa',
      requiereTalle: true,
      descripcion: 'Actividad de tirolesa',
      horarios: [
        { hora: '10:00', cupo: 2 },
        { hora: '15:00', cupo: 0 }
      ]
    },
    {
      id: 2,
      nombre: 'Jardinería',
      requiereTalle: false,
      descripcion: 'Actividad de jardinería',
      horarios: [
        { hora: '09:00', cupo: 0 },
        { hora: '14:00', cupo: 0 }
      ]
    }
  ]

  it('debe mostrar solo horarios con cupos disponibles', () => {
    const wrapper = mount(SeleccionActividad, {
      props: {
        actividades: actividadesMock,
        loading: false
      }
    })

    // Verificar que Tirolesa muestra solo el horario con cupos
    const tirolesaCard = wrapper.find('.actividad-card')
    const horariosList = tirolesaCard.find('.horarios-list')
    
    if (horariosList.exists()) {
      const horarios = horariosList.findAll('.horario-badge')
      expect(horarios).toHaveLength(1) // Solo debe mostrar 1 horario (10:00 con 2 cupos)
      expect(horarios[0].text()).toContain('10:00 - 11:00 (2 cupos)')
    }
  })

  it('debe mostrar "Cupos agotados" cuando no hay horarios disponibles', () => {
    const wrapper = mount(SeleccionActividad, {
      props: {
        actividades: actividadesMock,
        loading: false
      }
    })

    // Verificar que Jardinería muestra "Cupos agotados"
    const cards = wrapper.findAll('.actividad-card')
    const jardineriaCard = cards[1] // Segunda tarjeta (Jardinería)
    
    const cuposAgotados = jardineriaCard.find('.cupos-agotados')
    expect(cuposAgotados.exists()).toBe(true)
    expect(cuposAgotados.text()).toBe('Cupos agotados')
  })

  it('debe deshabilitar el botón cuando no hay cupos disponibles', () => {
    const wrapper = mount(SeleccionActividad, {
      props: {
        actividades: actividadesMock,
        loading: false
      }
    })

    const cards = wrapper.findAll('.actividad-card')
    const jardineriaCard = cards[1] // Segunda tarjeta (Jardinería)
    
    const button = jardineriaCard.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('btn-disabled')
    expect(button.text()).toBe('Sin cupos disponibles')
  })

  it('debe permitir selección solo cuando hay cupos disponibles', () => {
    const wrapper = mount(SeleccionActividad, {
      props: {
        actividades: actividadesMock,
        loading: false
      }
    })

    const cards = wrapper.findAll('.actividad-card')
    const tirolesaCard = cards[0] // Primera tarjeta (Tirolesa)
    const jardineriaCard = cards[1] // Segunda tarjeta (Jardinería)

    // Tirolesa debe tener clase normal (no sin-cupos)
    expect(tirolesaCard.classes()).not.toContain('sin-cupos')
    
    // Jardinería debe tener clase sin-cupos
    expect(jardineriaCard.classes()).toContain('sin-cupos')
  })

  it('debe filtrar correctamente los horarios disponibles', () => {
    const wrapper = mount(SeleccionActividad, {
      props: {
        actividades: actividadesMock,
        loading: false
      }
    })

    const vm = wrapper.vm
    
    // Test del método getHorariosDisponibles
    const tirolesaHorarios = vm.getHorariosDisponibles(actividadesMock[0])
    expect(tirolesaHorarios).toHaveLength(1)
    expect(tirolesaHorarios[0].hora).toBe('10:00')
    expect(tirolesaHorarios[0].cupo).toBe(2)

    const jardineriaHorarios = vm.getHorariosDisponibles(actividadesMock[1])
    expect(jardineriaHorarios).toHaveLength(0)
  })
})
