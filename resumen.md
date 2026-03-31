# FISICSIM — Estado del proyecto

## Descripción
Web estática de simulaciones interactivas de física para estudiantes del Grado en Física (UCLM).
URL: https://alexfgc.github.io/fisicsim

## Estado actual
- [ ] En desarrollo inicial

## Páginas construidas
| Archivo | Estado | Descripción |
|---|---|---|
| `index.html` | ✅ Hecho | Portada con hero y grid de categorías |
| `catalogo.html` | ✅ Hecho | Catálogo dinámico generado desde simulaciones.js |
| `style.css` | ✅ Hecho | Estilos globales completos |
| `simulaciones.js` | ✅ Hecho | Array central de simulaciones |

## Simulaciones implementadas
| ID | Nombre | Asignatura | Estado |
|---|---|---|---|
| `pendulo` | Péndulo Simple | Mecánica Clásica | ✅ Completa |

## Decisiones técnicas tomadas
- **p5.js en modo instancia**: evita conflictos si hay varios sketches en la misma página
- **Euler simpléctico** como integrador numérico: mejor conservación de energía que Euler básico
- **Sin frameworks**: el proyecto debe ser mantenible sin conocimientos de npm/bundlers
- **KaTeX** para fórmulas: renderizado local sin depender de MathJax

## Detalles de la simulación de péndulo
- Ecuación: θ'' = -(g/L)·sin(θ)
- Integrador: Euler simpléctico, 10 subpasos por frame
- Controles: longitud (0.5–3.0 m), ángulo inicial (5–80°), gravedad (1.0–20.0 m/s²)
- Extras: rastro de trayectoria, periodo teórico mostrado en canvas, pausa/reinicio

## Estructura de carpetas
```
fisicsim/
├── index.html
├── catalogo.html
├── style.css
├── simulaciones.js
└── sims/
    └── pendulo/
        ├── index.html
        └── sketch.js
```

## Historial de cambios relevantes
<!-- Añadir aquí cuando se hagan cambios importantes -->
- Proyecto iniciado con simulación de péndulo simple
