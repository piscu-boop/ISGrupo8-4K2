# 📋 Guía de Estilo de Código - EcoHarmony Park

## 🎯 **Información del Proyecto**

**Proyecto**: Sistema de Inscripción a Actividades EcoHarmony Park  
**Stack Tecnológico**: Node.js + Vue.js + MySQL + Docker   
**Fecha**: 2025 

---

## 🏗️ **Stack Tecnológico Completo**

### **Backend**
- **Node.js** 18+ (Runtime JavaScript)
- **Express.js** 5.1.0 (Framework web)
- **Sequelize** 6.37.7 (ORM para MySQL)
- **MySQL** 8.0 (Base de datos)
- **Vitest** 3.2.4 (Framework de testing)
- **Supertest** 7.1.4 (Testing de APIs)

### **Frontend**
- **Vue.js** 3.4.0 (Framework frontend)
- **Pinia** 2.1.0 (Manejo de estado)
- **Vue Router** 4.2.0 (Enrutamiento)
- **Axios** 1.6.0 (Cliente HTTP)
- **Vite** 5.0.0 (Build tool)
- **Vitest** 1.0.0 (Testing)
- **Vue Test Utils** 2.4.0 (Testing Vue)

### **DevOps & Herramientas**
- **Docker** & **Docker Compose** (Contenedorización)
- **Git** (Control de versiones)
- **npm** (Gestor de paquetes)

---

## 📁 **Estructura del Proyecto**

```
TP_Evaluable_N_6_G8/
├── ecoharmony-backend/          # Backend Node.js
│   ├── src/
│   │   ├── app.js               # Configuración Express
│   │   ├── domain/              # Lógica de negocio
│   │   ├── services/            # Servicios de aplicación
│   │   └── db/                  # Configuración DB
│   ├── tests/                   # Tests del backend
│   ├── server.js                # Servidor principal
│   └── package.json
├── ecoharmony-frontend/         # Frontend Vue.js
│   ├── src/
│   │   ├── components/          # Componentes Vue
│   │   ├── views/              # Vistas
│   │   ├── stores/             # Pinia stores
│   │   └── services/            # Servicios API
│   └── package.json
├── docker-compose.yml           # Configuración Docker
└── README.md
```

---

## 🎨 **Estilo de Código General**

### **1. Nomenclatura**

#### **Variables y Funciones**
```javascript
// ✅ Correcto - camelCase
const nombreVisitante = 'Juan';
const obtenerActividades = () => {};

// ❌ Incorrecto
const nombre_visitante = 'Juan';
const ObtenerActividades = () => {};
```

#### **Clases y Constructores**
```javascript
// ✅ Correcto - PascalCase
class Actividad {
  constructor(nombre) {
    this.nombre = nombre;
  }
}

// ❌ Incorrecto
class actividad {}

#### **Archivos y Directorios**
```javascript
// ✅ Correcto - kebab-case
// archivos: seleccion-actividad.vue
// directorios: /src/components/

// ❌ Incorrecto
// archivos: SeleccionActividad.vue
// directorios: /src/Components/
```

### **2. Formato y Espaciado**

#### **Indentación**
```javascript
// ✅ Correcto - 2 espacios
function inscribirUsuario(usuario) {
  if (usuario.aceptaTerminos) {
    return { ok: true };
  }
}

// ❌ Incorrecto - tabs o 4 espacios
function inscribirUsuario(usuario) {
    if (usuario.aceptaTerminos) {
        return { ok: true };
    }
}
```
---

## 🚀 **Backend - Node.js + Express**

### **1. Estructura de Archivos**

#### **Organización por Capas**
```
src/
├── app.js                 # Configuración Express
├── server.js             # Punto de entrada
├── domain/               # Lógica de negocio pura
│   ├── actividad.js
│   └── visitante.js
├── services/             # Servicios de aplicación
│   └── inscripcionesService.js
└── db/                   # Configuración base de datos
    └── sequelize.js
```

### **2. Estilo de Código Backend**

#### **Imports y Exports**
```javascript
// ✅ Correcto - ES6 modules
import express from 'express';
import { createApp } from './app.js';
import { Actividad } from './domain/actividad.js';

// ❌ Incorrecto - CommonJS
const express = require('express');
const { createApp } = require('./app.js');
```

#### **Funciones y Métodos**
```javascript
// ✅ Correcto - Funciones descriptivas
async function inscribirEnActividad({ actividadId, horario, visitante, aceptaTerminos, talle }) {
  try {
    const actividad = await Actividad.findByPk(actividadId);
    if (!actividad) {
      throw new Error('Actividad no encontrada');
    }
    
    return await actividad.inscribir(visitante, horario, { aceptaTerminos, talle });
  } catch (error) {
    throw error;
  }
}

// ❌ Incorrecto - Función genérica
async function process(data) {
  // lógica aquí
}
```

#### **Manejo de Errores**
```javascript
// ✅ Correcto - Errores específicos
try {
  const resultado = await inscribirEnActividad(datos);
  return res.status(201).json(resultado);
} catch (error) {
  const status = error?.httpStatus ?? 500;
  const message = error?.message ?? 'Error interno del servidor';
  
  if (status >= 500) {
    console.error('Error del servidor:', error);
  }
  
  return res.status(status).json({ error: message });
}

// ❌ Incorrecto - Manejo genérico
try {
  // lógica
} catch (error) {
  return res.status(500).json({ error: 'Error' });
}
```

#### **Validaciones**
```javascript
// ✅ Correcto - Validaciones específicas
_validarVisitante(visitante) {
  const { nombre, dni, edad } = visitante;
  
  if (typeof dni !== 'string' || dni.trim() === '') {
    throw new Error('dni inválido');
  }
  
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    throw new Error('nombre inválido');
  }
  
  if (typeof edad !== 'number' || !Number.isFinite(edad) || edad <= 0) {
    throw new Error('edad inválida');
  }
}
```

### **3. Testing Backend**

#### **Estructura de Tests**
```javascript
// ✅ Correcto - Tests organizados
import { describe, it, expect, beforeEach } from 'vitest';
import { Actividad } from '../src/domain/actividad.js';

describe('Inscripción a actividad', () => {
  let actividad, visitante;

  beforeEach(() => {
    actividad = new Actividad('Tirolesa', {
      requiereTalle: true,
      cuposPorHorario: { '10:00': 2 }
    });
    visitante = new Visitante({ nombre: 'Juan', dni: '12345678', edad: 25 });
  });

  it('debe inscribir correctamente cuando hay cupo', () => {
    const resultado = actividad.inscribir(visitante, '10:00', {
      aceptaTerminos: true,
      talle: 'M'
    });
    
    expect(resultado.ok).toBe(true);
    expect(actividad.cupoDisponible('10:00')).toBe(1);
  });
});
```

---

## 🎨 **Frontend - Vue.js**

### **1. Estructura de Componentes**

#### **Single File Components (SFC)**
```vue
<!-- ✅ Correcto - Estructura SFC -->
<template>
  <div class="seleccion-actividad">
    <h2>{{ titulo }}</h2>
    <div class="actividades-grid">
      <div 
        v-for="actividad in actividades" 
        :key="actividad.id"
        class="actividad-card"
        @click="seleccionarActividad(actividad)"
      >
        {{ actividad.nombre }}
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
    }
  },
  emits: ['seleccionar'],
  methods: {
    seleccionarActividad(actividad) {
      this.$emit('seleccionar', actividad);
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
</style>
```

### **2. Estilo de Código Frontend**

#### **Props y Emits**
```javascript
// ✅ Correcto - Props tipadas
props: {
  actividades: {
    type: Array,
    default: () => [],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
},

// ✅ Correcto - Emits declarados
emits: ['seleccionar', 'error', 'loading']
```

#### **Métodos y Computed**
```javascript
// ✅ Correcto - Métodos descriptivos
methods: {
  seleccionarActividad(actividad) {
    if (this.getHorariosDisponibles(actividad).length > 0) {
      this.$emit('seleccionar', actividad);
    }
  },
  
  getHorariosDisponibles(actividad) {
    return actividad.horarios?.filter(horario => horario.cupo > 0) || [];
  }
},

// ✅ Correcto - Computed para datos derivados
computed: {
  actividadesDisponibles() {
    return this.actividades.filter(actividad => 
      this.getHorariosDisponibles(actividad).length > 0
    );
  }
}
```

#### **Pinia Stores**
```javascript
// ✅ Correcto - Store organizado
import { defineStore } from 'pinia';

export const useInscripcionStore = defineStore('inscripcion', {
  state: () => ({
    actividades: [],
    actividadSeleccionada: null,
    horarioSeleccionado: null,
    visitantes: [],
    loading: false,
    error: null
  }),

  getters: {
    actividadesDisponibles: (state) => {
      return state.actividades.filter(actividad => 
        actividad.horarios?.some(h => h.cupo > 0)
      );
    }
  },

  actions: {
    async cargarActividades() {
      this.loading = true;
      try {
        const response = await api.getActividades();
        this.actividades = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    }
  }
});
```

### **3. Testing Frontend**

#### **Tests de Componentes**
```javascript
// ✅ Correcto - Tests de componentes
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SeleccionActividad from './SeleccionActividad.vue';

describe('SeleccionActividad', () => {
  const actividadesMock = [
    {
      id: 1,
      nombre: 'Tirolesa',
      horarios: [{ hora: '10:00', cupo: 2 }]
    }
  ];

  it('debe mostrar solo horarios con cupos disponibles', () => {
    const wrapper = mount(SeleccionActividad, {
      props: { actividades: actividadesMock }
    });

    const horarios = wrapper.findAll('.horario-badge');
    expect(horarios).toHaveLength(1);
    expect(horarios[0].text()).toContain('10:00 - 11:00 (2 cupos)');
  });
});
```

### **2. README y Documentación**

#### **Estructura del README**
```markdown
# ✅ Correcto - README estructurado
# EcoHarmony Park - Sistema de Inscripción

## 🎯 User Story Implementada
> **Como** visitante  
> **Quiero** inscribirme a una actividad  
> **Para** reservar mi lugar en la misma.

## 🚀 Tecnologías Utilizadas
### Backend
- Node.js 18+
- Express.js 5.1.0
- Sequelize 6.37.7
- MySQL 8.0

### Frontend
- Vue.js 3.4.0
- Pinia 2.1.0
- Vite 5.0.0

## 📦 Instalación
```bash
# Clonar repositorio
git clone <repo-url>

# Instalar dependencias
npm install

# Levantar base de datos
docker-compose up -d

# Iniciar backend
cd ecoharmony-backend && npm run dev

# Iniciar frontend
cd ecoharmony-frontend && npm run dev
```
```

## 🧪 **Testing**

### **1. Cobertura de Tests**
```javascript
// ✅ Correcto - Tests completos
describe('Inscripción a actividad', () => {
  it('debe inscribir correctamente cuando hay cupo', () => {
    // Arrange
    const actividad = new Actividad('Tirolesa', { cuposPorHorario: { '10:00': 2 } });
    const visitante = new Visitante({ nombre: 'Juan', dni: '12345678', edad: 25 });
    
    // Act
    const resultado = actividad.inscribir(visitante, '10:00', { aceptaTerminos: true, talle: 'M' });
    
    // Assert
    expect(resultado.ok).toBe(true);
    expect(actividad.cupoDisponible('10:00')).toBe(1);
  });
});
```

### **2. Tests de Integración**
```javascript
// ✅ Correcto - Tests de integración
describe('POST /actividades/:id/inscripciones', () => {
  it('debe inscribir correctamente y decrementar cupo en DB', async () => {
    const response = await request(app)
      .post('/actividades/1/inscripciones')
      .send({
        horario: '10:00',
        visitante: { nombre: 'Juan', dni: '12345678', edad: 25 },
        aceptaTerminos: true,
        talle: 'M'
      })
      .expect(201);

    expect(response.body).toEqual({ ok: true });
  });
});
```

## 📚 **Recursos Adicionales**

### **Documentación Oficial**
- [Node.js](https://nodejs.org/docs/)
- [Express.js](https://expressjs.com/)
- [Vue.js](https://vuejs.org/guide/)
- [Sequelize](https://sequelize.org/docs/)
- [Docker](https://docs.docker.com/)

### **Herramientas Recomendadas**
- **VS Code** con extensiones: Vue, ESLint, Prettier
- **Postman** para testing de APIs
- **MySQL Workbench** para gestión de BD
- **Docker Desktop** para contenedores

