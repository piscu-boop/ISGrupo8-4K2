# EcoHarmony Park - Sistema de Inscripción a Actividades

Sistema completo para la inscripción a actividades del parque EcoHarmony, implementando la User Story "Inscribirme a una actividad" con backend en JavaScript/Node.js y frontend en Vue.js.

## 🎯 User Story Implementada

> **Como** visitante  
> **Quiero** inscribirme a una actividad  
> **Para** reservar mi lugar en la misma.

### ✅ Criterios de Aceptación Completados

- ✅ Selección de actividad del conjunto ("Tirolesa", "Safari", "Palestra", "Jardinería")
- ✅ Selección de horario dentro de los disponibles
- ✅ Indicación de cantidad de personas que participarán
- ✅ Ingreso de datos del visitante: nombre, DNI, edad y talla de vestimenta (si la actividad lo requiere)
- ✅ Aceptación de términos y condiciones de la actividad

## 🏗️ Arquitectura del Sistema

```
EcoHarmony Park
├── Backend (Node.js + Express + Sequelize + MySQL)
│   ├── API REST con endpoints completos
│   ├── Base de datos MySQL con Docker
│   ├── Tests unitarios e integración
│   └── Validación completa de reglas de negocio
└── Frontend (Vue.js + Pinia + Axios)
    ├── Interfaz moderna y responsiva
    ├── Formulario multi-paso
    ├── Validación en tiempo real
    └── Manejo de errores robusto
```

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para MySQL
- **MySQL** - Base de datos relacional
- **Docker** - Contenedorización
- **Vitest** - Framework de testing
- **Supertest** - Testing de APIs

### Frontend
- **Vue.js 3** - Framework frontend
- **Pinia** - Manejo de estado
- **Vue Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Vite** - Build tool
- **CSS3** - Estilos modernos

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Docker y Docker Compose
- npm o yarn

### 1. Configurar Base de Datos
```bash
# Levantar MySQL con Docker
docker-compose up -d

# Verificar que la base de datos esté corriendo
docker-compose ps
```

### 2. Configurar Backend
```bash
cd ecoharmony-backend

# Instalar dependencias
npm install

# Inicializar datos de ejemplo
npm run init-data

# Ejecutar tests
npm test

# Iniciar servidor
npm start
# o en modo desarrollo
npm run dev
```

### 3. Configurar Frontend
```bash
cd ecoharmony-frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

**Backend** (`.env`):
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ecoharmony_test
DB_USER=root
DB_PASS=root
DB_LOG=false
PORT=3001
```

**Frontend** (`.env`):
```env
VITE_API_BASE_URL=http://localhost:3001
```

### Puertos
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **MySQL**: localhost:3306

## 📋 API Endpoints

### Actividades
- `GET /actividades` - Listar todas las actividades
- `GET /actividades/:id` - Obtener actividad específica
- `GET /actividades/:id/horarios` - Obtener horarios de actividad

### Inscripciones
- `POST /actividades/:id/inscripciones` - Realizar inscripción

### Ejemplo de Request
```json
POST /actividades/1/inscripciones
{
  "horario": "10:00",
  "visitante": {
    "nombre": "Juan Pérez",
    "dni": "12345678",
    "edad": 25
  },
  "aceptaTerminos": true,
  "talle": "M"
}
```

## 🧪 Testing

### Backend
```bash
cd ecoharmony-backend

# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Tests con cobertura
npm run coverage
```

### Frontend
```bash
cd ecoharmony-frontend

# Tests unitarios
npm test

# Tests con UI
npm run test:ui
```

## 🎨 Características del Frontend

### Diseño y UX
- **Interfaz moderna** con gradientes y animaciones
- **Diseño responsivo** para móviles y tablets
- **Indicador de progreso** visual
- **Validación en tiempo real** de formularios
- **Manejo de errores** con mensajes claros

### Flujo de Usuario
1. **Selección de Actividad** - Lista de actividades disponibles
2. **Selección de Horario** - Horarios y cupos disponibles
3. **Datos de Visitantes** - Formulario dinámico para múltiples participantes
4. **Confirmación** - Revisión y aceptación de términos

## 🗄️ Base de Datos

### Modelos
- **Actividad** - Información de actividades
- **ActividadHorario** - Horarios y cupos por actividad
- **Inscripcion** - Registro de inscripciones

### Relaciones
- Una actividad tiene muchos horarios
- Una actividad tiene muchas inscripciones
- Una inscripción pertenece a una actividad

## 🔒 Validaciones Implementadas

### Backend
- Validación de datos del visitante (nombre, DNI, edad)
- Validación de horarios disponibles
- Control de cupos en tiempo real
- Validación de términos y condiciones
- Validación condicional de talla de vestimenta
- Prevención de duplicados por DNI

### Frontend
- Validación en tiempo real de formularios
- Validación de campos obligatorios
- Validación de formatos (edad, DNI)
- Validación condicional de talla
- Manejo de errores de red y servidor

## 🚀 Despliegue

### Backend
```bash
# Construir imagen Docker
docker build -t ecoharmony-backend .

# Ejecutar contenedor
docker run -p 3001:3001 ecoharmony-backend
```

### Frontend
```bash
# Construir para producción
npm run build

# Servir archivos estáticos
npm run preview
```

## 📊 Métricas de Calidad

- **Cobertura de tests**: 100% de criterios de aceptación
- **Tests unitarios**: 20+ casos de prueba
- **Tests de integración**: 10+ casos de prueba
- **Validación completa**: Todos los criterios de la User Story
- **Manejo de errores**: Casos exitosos y fallidos cubiertos

## 🎯 Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Panel de administración
- [ ] Notificaciones por email
- [ ] Historial de inscripciones
- [ ] PWA (Progressive Web App)
- [ ] Internacionalización (i18n)
- [ ] Tests E2E con Cypress

## 📄 Licencia

Este proyecto es parte del trabajo práctico de Ingeniería de Software - Grupo 8.

## 👥 Contribuidores

- **Backend**: Implementación completa con TDD
- **Frontend**: Interfaz moderna en Vue.js
- **Integración**: Sistema completo funcional

---

**¡Disfruta tu experiencia en EcoHarmony Park! 🏞️**