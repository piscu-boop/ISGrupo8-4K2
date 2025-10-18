# EcoHarmony Park - Frontend

Frontend en Vue.js para el sistema de inscripción a actividades de EcoHarmony Park.

## 🚀 Características

- **Vue 3** con Composition API
- **Pinia** para manejo de estado
- **Vue Router** para navegación
- **Axios** para comunicación con el backend
- **Diseño responsivo** y moderno
- **Validación de formularios** en tiempo real
- **Manejo de errores** robusto

## 📋 Funcionalidades Implementadas

### ✅ Criterios de Aceptación de la User Story

1. **Selección de Actividad**
   - Lista de actividades disponibles (Tirolesa, Safari, Palestra, Jardinería)
   - Información detallada de cada actividad
   - Indicación de si requiere talla de vestimenta

2. **Selección de Horario**
   - Horarios disponibles por actividad
   - Cupos disponibles en tiempo real
   - Validación de disponibilidad

3. **Datos de Visitantes**
   - Formulario dinámico para múltiples participantes
   - Validación de datos obligatorios (nombre, DNI, edad)
   - Validación condicional de talla de vestimenta
   - Agregar/remover visitantes

4. **Términos y Condiciones**
   - Resumen completo de la inscripción
   - Términos y condiciones específicos por actividad
   - Aceptación obligatoria antes de confirmar

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Backend de EcoHarmony ejecutándose en puerto 3001

### Instalación
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar tests
npm test
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/           # Componentes Vue reutilizables
│   ├── SeleccionActividad.vue
│   ├── SeleccionHorario.vue
│   ├── DatosVisitantes.vue
│   └── TerminosCondiciones.vue
├── views/               # Vistas principales
│   └── InscripcionView.vue
├── stores/              # Stores de Pinia
│   └── inscripcion.js
├── services/            # Servicios de API
│   └── api.js
├── assets/              # Recursos estáticos
│   └── main.css
├── App.vue              # Componente raíz
└── main.js              # Punto de entrada
```

## 🎨 Diseño y UX

- **Diseño moderno** con gradientes y sombras
- **Colores temáticos** verdes para el parque
- **Indicador de progreso** visual
- **Animaciones suaves** entre pasos
- **Responsive design** para móviles y tablets
- **Feedback visual** para validaciones y estados

## 🔧 Configuración

### Proxy de Desarrollo
El frontend está configurado para hacer proxy de las peticiones `/api/*` al backend en `localhost:3001`.

### Variables de Entorno
```env
VITE_API_BASE_URL=http://localhost:3001
```

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar tests con UI
npm run test:ui

# Ejecutar tests en modo watch
npm run test:watch
```

## 📱 Responsive Design

- **Desktop**: Layout completo con sidebar
- **Tablet**: Layout adaptado con navegación simplificada  
- **Mobile**: Layout vertical optimizado para touch

## 🔄 Flujo de Usuario

1. **Paso 1**: Selección de actividad
2. **Paso 2**: Selección de horario
3. **Paso 3**: Ingreso de datos de visitantes
4. **Paso 4**: Revisión y confirmación

## 🚨 Manejo de Errores

- **Validación en tiempo real** de formularios
- **Mensajes de error** específicos y claros
- **Manejo de errores de red** y del servidor
- **Estados de carga** para mejor UX

## 🎯 Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Historial de inscripciones
- [ ] Notificaciones por email
- [ ] PWA (Progressive Web App)
- [ ] Internacionalización (i18n)
- [ ] Tests E2E con Cypress

## 📄 Licencia

Este proyecto es parte del trabajo práctico de Ingeniería de Software.
