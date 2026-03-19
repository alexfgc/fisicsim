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
    asignatura: "Mecánica Clásica",
    descripcion: "Oscilación de un péndulo bajo gravedad. Explora cómo cambia el periodo con la longitud y el ángulo inicial.",
    tags: ["oscilación", "energía", "periodo"]
  },

  // Aquí irán las próximas simulaciones.
  // Ejemplo de cómo se añadiría una nueva:
  //
  // {
  //   id: "proyectil",
  //   nombre: "Tiro Parabólico",
  //   asignatura: "Mecánica Clásica",
  //   descripcion: "Movimiento de un proyectil con velocidad y ángulo variables.",
  //   tags: ["cinemática", "gravedad"]
  // },
];