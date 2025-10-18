# Práctico 6 – TDD (Desarrollo Conducido por Pruebas)

## Unidad 4: Aseguramiento de Calidad de Proceso y Producto

Este repositorio implementa la **User Story: “Inscribirme a una actividad”** del proyecto *EcoHarmony Park*, aplicando el enfoque **TDD (Test Driven Development)** con el ciclo **Red–Green–Refactor** en el lenguaje **Python** utilizando **pytest**.

---

## 🎯 Objetivo

Aplicar buenas prácticas de diseño y testing automatizado mediante el enfoque **Desarrollo Conducido por Pruebas (TDD)**, construyendo la funcionalidad *Inscribirme a actividad* de forma incremental, con una cobertura completa de casos exitosos y fallidos.

---

## 📜 User Story

> **Como** visitante  
> **Quiero** inscribirme a una actividad  
> **Para** reservar mi lugar en la misma.

### Criterios de aceptación

- Debe requerir seleccionar una actividad del conjunto (“Tirolesa”, “Safari”, “Palestra”, “Jardinería”) con cupos disponibles.  
- Debe permitir seleccionar el horario dentro de los disponibles.  
- Debe indicar la cantidad de personas que participarán.  
- Por cada persona se deben ingresar los datos del visitante: nombre, DNI, edad y talla de vestimenta (si la actividad lo requiere).  
- Se deben aceptar los términos y condiciones de la actividad antes de confirmar la inscripción.

---

## 🧪 Enfoque TDD: Red – Green – Refactor

| Fase | Acción | Resultado |
|------|---------|------------|
| **Red** | Se escriben pruebas que fallan al no existir aún la implementación. | Pruebas rojas |
| **Green** | Se implementa el mínimo código necesario para pasar las pruebas. | Pruebas verdes |
| **Refactor** | Se mejora la estructura y legibilidad del código manteniendo las pruebas en verde. | Código limpio y probado |

---

## 🧰 Stack Tecnológico

- **Lenguaje:** Javascript 
- **Testing:** vitest  
- **Estructura del proyecto:**
