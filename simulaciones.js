// ─────────────────────────────────────────
// ARRAY CENTRAL DE SIMULACIONES
//
// Cada objeto representa una simulación.
// El catálogo se genera automáticamente
// leyendo este array.
//
// Para añadir una nueva simulación:
//   1. Añade un objeto más a este array
//   2. Crea la carpeta sims/nombre-sim/
//   3. Crea index.html y sketch.js dentro
// ─────────────────────────────────────────

const SIMULACIONES = [
  {
    id: "pendulo",               // nombre de la carpeta dentro de sims/
    nombre: "Péndulo Simple",
    asignatura: "Mecánica y Ondas 1",
    descripcion: "Oscilación de un péndulo bajo gravedad. Explora cómo cambia el periodo con la longitud y el ángulo inicial.",
    tags: ["oscilación", "energía", "periodo"]
  },

  {
    id: "potencial-efectivo",
    nombre: "Fuerza central: potencial efectivo",
    asignatura: "Mecánica y Ondas 1",
    descripcion:
      "Potencial efectivo U_eff(r) para el caso newtoniano: visualiza barrera centrífuga, puntos de retorno y el papel de L.",
    tags: ["fuerza central", "potencial efectivo", "gradiente radial"]
  },

  {
    id: "conicas-orbita",
    nombre: "Órbitas newtonianas y cónicas",
    asignatura: "Mecánica y Ondas 1",
    descripcion:
      "Ecuación polar r(θ)=p/(1+e cosθ): explora elipse, parábola e hipérbola y su forma en cartesianas.",
    tags: ["kepler", "cónicas", "órbitas"]
  },

  {
    id: "kepler-runge-lenz",
    nombre: "Leyes de Kepler y Runge–Lenz",
    asignatura: "Mecánica y Ondas 1",
    descripcion:
      "Órbita elíptica: 2ª y 3ª ley de Kepler y dirección del vector de Runge–Lenz hacia el periapsis.",
    tags: ["kepler", "áreas", "runge–lenz"]
  },

  {
    id: "oscilador",
    nombre: "Oscilador armónico simple",
    asignatura: "Mecánica y Ondas 2",
    descripcion:
      "Masa en un muelle ideal: ajusta masa, constante elástica y amplitud; observa energías y la gráfica x(t).",
    tags: ["oscilación", "muelle", "energía"]
  },

  {
    id: "bernoulli",
    nombre: "Principio de Bernoulli",
    asignatura: "Física de Fluidos",
    descripcion:
      "Flujo ideal en un tubo de Venturi: explora cómo el estrechamiento incrementa la velocidad y reduce la presión.",
    tags: ["bernoulli", "venturi", "presión"]
  },
];

// Orden y nombres fijos de asignaturas para el catálogo.
const ASIGNATURAS = [
  "Electromagnetismo",
  "Termodinamica",
  "Mecánica y Ondas 1",
  "Mecánica y Ondas 2",
  "Física Cuántica",
  "Física de Fluidos"
];