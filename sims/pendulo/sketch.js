// ─────────────────────────────────────────
// PÉNDULO SIMPLE — sketch.js
// Motor: p5.js (modo instancia)
//
// Usamos "modo instancia" en lugar del modo
// global de p5 para evitar que sus funciones
// (setup, draw, etc.) contaminen el espacio
// global de nombres de la página.
// ─────────────────────────────────────────

new p5(function (p) {

  // ── PARÁMETROS FÍSICOS ──────────────────
  // Leemos los valores iniciales directamente
  // desde los sliders del HTML.
  let L;          // longitud del péndulo (m)
  let g;          // gravedad (m/s²)
  let theta;      // ángulo actual (radianes)
  let omega;      // velocidad angular (rad/s)
  let pausado = false;

  // ── ESCALA VISUAL ───────────────────────
  // Cuántos píxeles representa 1 metro.
  // Lo calculamos en setup() según el tamaño
  // del canvas.
  let escala;

  // ── REFERENCIAS A LOS CONTROLES HTML ───
  let sliderLongitud, sliderAngulo, sliderGravedad;
  let valLongitud, valAngulo, valGravedad;
  let btnReiniciar, btnPausa;

  // ────────────────────────────────────────
  // SETUP: se ejecuta una sola vez al inicio
  // ────────────────────────────────────────
  p.setup = function () {

    // Creamos el canvas y lo metemos dentro
    // del div #canvas-container del HTML.
    const contenedor = document.getElementById("canvas-container");
    const canvas = p.createCanvas(
      contenedor.offsetWidth,
      contenedor.offsetHeight
    );
    canvas.parent("canvas-container");

    // Eliminamos el placeholder "Cargando…"
    const placeholder = contenedor.querySelector(".canvas-placeholder");
    if (placeholder) placeholder.remove();

    // Calculamos la escala: el péndulo máximo
    // (3 m) debe caber con margen en el canvas.
    escala = (p.height * 0.38) / 3.0;

    // Recogemos referencias a todos los
    // elementos HTML con los que interactuamos.
    sliderLongitud = document.getElementById("slider-longitud");
    sliderAngulo   = document.getElementById("slider-angulo");
    sliderGravedad = document.getElementById("slider-gravedad");
    valLongitud    = document.getElementById("val-longitud");
    valAngulo      = document.getElementById("val-angulo");
    valGravedad    = document.getElementById("val-gravedad");
    btnReiniciar   = document.getElementById("btn-reiniciar");
    btnPausa       = document.getElementById("btn-pausa");

    // Conectamos los sliders: al moverlos,
    // actualizan el número visible en tiempo real.
    sliderLongitud.addEventListener("input", actualizarEtiquetas);
    sliderAngulo.addEventListener("input",   actualizarEtiquetas);
    sliderGravedad.addEventListener("input", actualizarEtiquetas);

    // Botón reiniciar: lee los sliders y
    // recalcula el estado inicial.
    btnReiniciar.addEventListener("click", reiniciar);

    // Botón pausa/reanudar: alterna el estado.
    btnPausa.addEventListener("click", function () {
      pausado = !pausado;
      btnPausa.textContent = pausado ? "Reanudar" : "Pausar";
    });

    // Iniciamos con los valores actuales
    // de los sliders.
    reiniciar();
  };

  // ────────────────────────────────────────
  // DRAW: se ejecuta ~60 veces por segundo
  // ────────────────────────────────────────
  p.draw = function () {

    // Fondo: usamos el color de la variable
    // CSS --bg definida en style.css.
    p.background(26, 29, 39); // equivale a #1a1d27

    // Solo integramos si no está pausado.
    if (!pausado) {
      integrar();
    }

    dibujarPendulo();
    dibujarInfo();
  };

  // ────────────────────────────────────────
  // INTEGRACIÓN NUMÉRICA (Euler simpléctico)
  // Avanzamos la física un paso de tiempo.
  // ────────────────────────────────────────
  function integrar() {
    // Leemos g y L en cada frame para que
    // el péndulo responda a los sliders
    // sin necesidad de reiniciar.
    g = parseFloat(sliderGravedad.value);
    L = parseFloat(sliderLongitud.value);

    // Paso de tiempo: 1/60 s por frame,
    // subdividido en 10 pasos pequeños para
    // mayor precisión numérica.
    const dt = (1 / 60) / 10;

    for (let i = 0; i < 10; i++) {
      const alpha = -(g / L) * Math.sin(theta); // aceleración angular
      omega += alpha * dt;                        // actualiza velocidad
      theta += omega * dt;                        // actualiza posición
    }
  }

  // ────────────────────────────────────────
  // DIBUJO DEL PÉNDULO
  // ────────────────────────────────────────
  function dibujarPendulo() {
    // El punto de pivote está en el centro
    // horizontal, a 1/4 de la altura del canvas.
    const px = p.width / 2;
    const py = p.height * 0.22;

    // Posición de la masa en píxeles.
    const mx = px + Math.sin(theta) * L * escala;
    const my = py + Math.cos(theta) * L * escala;

    // ── Rastro de la trayectoria ──────────
    // (lo dibujaremos con un punto cada frame
    // guardando posiciones anteriores)
    if (!p._rastro) p._rastro = [];
    if (!pausado) {
      p._rastro.push({ x: mx, y: my });
      if (p._rastro.length > 120) p._rastro.shift(); // máximo 120 puntos
    }

    p.noFill();
    for (let i = 1; i < p._rastro.length; i++) {
      const alpha = p.map(i, 0, p._rastro.length, 0, 180);
      p.stroke(91, 141, 238, alpha); // color acento con opacidad creciente
      p.strokeWeight(1.5);
      p.line(
        p._rastro[i - 1].x, p._rastro[i - 1].y,
        p._rastro[i].x,     p._rastro[i].y
      );
    }

    // ── Hilo ─────────────────────────────
    p.stroke(139, 143, 168); // --text-muted
    p.strokeWeight(1.5);
    p.line(px, py, mx, my);

    // ── Pivote ────────────────────────────
    p.fill(139, 143, 168);
    p.noStroke();
    p.circle(px, py, 8);

    // ── Masa ──────────────────────────────
    const radio = p.map(L, 0.5, 3.0, 14, 22); // masa más grande si L es mayor
    p.fill(91, 141, 238); // --accent
    p.noStroke();
    p.circle(mx, my, radio * 2);
  }

  // ────────────────────────────────────────
  // TEXTO INFORMATIVO EN EL CANVAS
  // ────────────────────────────────────────
  function dibujarInfo() {
    g = parseFloat(sliderGravedad.value);
    L = parseFloat(sliderLongitud.value);

    // Periodo teórico (aproximación ángulo pequeño)
    const T = 2 * Math.PI * Math.sqrt(L / g);

    p.fill(139, 143, 168); // --text-muted
    p.noStroke();
    p.textFont("Inter, sans-serif");
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`T ≈ ${T.toFixed(2)} s  (aprox. ángulo pequeño)`, 14, 14);
    p.text(`θ = ${p.degrees(theta).toFixed(1)}°`, 14, 32);

    if (pausado) {
      p.fill(91, 141, 238);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(13);
      p.text("— PAUSADO —", p.width / 2, p.height - 20);
    }
  }

  // ────────────────────────────────────────
  // REINICIAR: lee sliders y resetea estado
  // ────────────────────────────────────────
  function reiniciar() {
    L     = parseFloat(sliderLongitud.value);
    g     = parseFloat(sliderGravedad.value);
    theta = parseFloat(sliderAngulo.value) * (Math.PI / 180); // grados → rad
    omega = 0;        // empieza en reposo
    pausado = false;
    btnPausa.textContent = "Pausar";
    if (p._rastro) p._rastro = []; // borra el rastro
  }

  // ────────────────────────────────────────
  // ACTUALIZAR ETIQUETAS DE LOS SLIDERS
  // ────────────────────────────────────────
  function actualizarEtiquetas() {
    valLongitud.textContent = parseFloat(sliderLongitud.value).toFixed(1);
    valAngulo.textContent   = sliderAngulo.value;
    valGravedad.textContent = parseFloat(sliderGravedad.value).toFixed(1);
  }

  // ────────────────────────────────────────
  // REDIMENSIONAR: si cambia el tamaño de
  // la ventana, el canvas se reajusta.
  // ────────────────────────────────────────
  p.windowResized = function () {
    const contenedor = document.getElementById("canvas-container");
    p.resizeCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
    escala = (p.height * 0.38) / 3.0;
  };

}, "canvas-container");