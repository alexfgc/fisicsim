// ─────────────────────────────────────────
// FUERZA CENTRAL — Potencial efectivo
// U_eff(r) = U(r) + L^2/(2 m r^2), con U(r) = -mu m / r (newtoniano)
// ─────────────────────────────────────────

new p5(function (p) {
  let sliderMu, sliderL, sliderE;
  let valMu, valL, valE;
  let btnReiniciar, btnPausa;
  let pausado = false;

  // Para animación ligera (marcar el punto r(t) sobre la curva)
  let rMarker = 1.2;
  let vR = 0;

  const m = 1.0;
  const SUBPASOS = 8;

  p.setup = function () {
    const contenedor = document.getElementById("canvas-container");
    const canvas = p.createCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
    canvas.parent("canvas-container");

    const placeholder = contenedor.querySelector(".canvas-placeholder");
    if (placeholder) placeholder.remove();

    sliderMu = document.getElementById("slider-mu");
    sliderL = document.getElementById("slider-L");
    sliderE = document.getElementById("slider-E");
    valMu = document.getElementById("val-mu");
    valL = document.getElementById("val-L");
    valE = document.getElementById("val-E");
    btnReiniciar = document.getElementById("btn-reiniciar");
    btnPausa = document.getElementById("btn-pausa");

    sliderMu.addEventListener("input", actualizarEtiquetas);
    sliderL.addEventListener("input", actualizarEtiquetas);
    sliderE.addEventListener("input", actualizarEtiquetas);

    btnReiniciar.addEventListener("click", reiniciar);
    btnPausa.addEventListener("click", function () {
      pausado = !pausado;
      btnPausa.textContent = pausado ? "Reanudar" : "Pausar";
    });

    reiniciar();
  };

  p.draw = function () {
    p.background(26, 29, 39);

    const mu = parseFloat(sliderMu.value);
    const L = parseFloat(sliderL.value);
    const E = parseFloat(sliderE.value);

    dibujarGrafica(mu, L, E);

    if (!pausado) integrarMarker(mu, L, E);
    dibujarMarker(mu, L, E);

    if (pausado) dibujarPausado();
  };

  function U(r, mu) {
    return -(mu * m) / r;
  }

  function Ueff(r, mu, L) {
    return U(r, mu) + (L * L) / (2 * m * r * r);
  }

  function dUeff_dr(r, mu, L) {
    // d/dr (-mu/r) = +mu/r^2
    // d/dr (L^2/(2 r^2)) = -L^2/r^3
    return (mu * m) / (r * r) - (L * L) / (m * r * r * r);
  }

  function integrarMarker(mu, L, E) {
    const dt = (1 / 60) / SUBPASOS;
    for (let i = 0; i < SUBPASOS; i++) {
      // Movimiento radial efectivo: m r¨ = - dUeff/dr
      const aR = -(1 / m) * dUeff_dr(rMarker, mu, L);
      vR += aR * dt;
      rMarker += vR * dt;

      // Rebote suave si se sale del dominio
      if (rMarker < 0.25) {
        rMarker = 0.25;
        vR *= -0.6;
      }
      if (rMarker > 4.0) {
        rMarker = 4.0;
        vR *= -0.6;
      }

      // Ajuste para que no se aleje demasiado del nivel de energía
      const diff = (E - Ueff(rMarker, mu, L));
      vR += 0.02 * diff;
    }
  }

  function dibujarGrafica(mu, L, E) {
    const pad = 16;
    const gx1 = pad;
    const gy1 = pad + 8;
    const gx2 = p.width - pad;
    const gy2 = p.height - pad;
    const w = gx2 - gx1;
    const h = gy2 - gy1;

    // dominio r
    const rMin = 0.25;
    const rMax = 4.0;

    // muestreo para rango y
    let yMin = Infinity;
    let yMax = -Infinity;
    for (let i = 0; i <= 240; i++) {
      const r = p.lerp(rMin, rMax, i / 240);
      const y = Ueff(r, mu, L);
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
    yMin = Math.min(yMin, E) - 0.2;
    yMax = Math.max(yMax, E) + 0.2;

    // caja
    p.noFill();
    p.stroke(60, 64, 78);
    p.strokeWeight(1);
    p.rect(gx1, gy1, w, h, 8);

    // eje y=0
    const y0 = p.map(0, yMin, yMax, gy2 - 6, gy1 + 6);
    p.stroke(50, 54, 66);
    p.drawingContext.setLineDash([5, 5]);
    p.line(gx1 + 6, y0, gx2 - 6, y0);
    p.drawingContext.setLineDash([]);

    // nivel de energía
    const yE = p.map(E, yMin, yMax, gy2 - 6, gy1 + 6);
    p.stroke(91, 141, 238);
    p.strokeWeight(1.25);
    p.line(gx1 + 6, yE, gx2 - 6, yE);

    // curva Ueff
    p.noFill();
    p.stroke(200, 200, 210);
    p.strokeWeight(1.6);
    p.beginShape();
    for (let i = 0; i <= 300; i++) {
      const r = p.lerp(rMin, rMax, i / 300);
      const y = Ueff(r, mu, L);
      const px = p.map(r, rMin, rMax, gx1 + 6, gx2 - 6);
      const py = p.map(y, yMin, yMax, gy2 - 6, gy1 + 6);
      p.vertex(px, py);
    }
    p.endShape();

    // etiquetas
    p.noStroke();
    p.fill(139, 143, 168);
    p.textFont("Inter, sans-serif");
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text("U_eff(r)", gx1 + 10, gy1 + 10);
    p.textSize(11);
    p.text(`μ=${mu.toFixed(2)}   L=${L.toFixed(2)}   E=${E.toFixed(2)}`, gx1 + 10, gy1 + 30);
  }

  function dibujarMarker(mu, L, E) {
    const pad = 16;
    const gx1 = pad;
    const gy1 = pad + 8;
    const gx2 = p.width - pad;
    const gy2 = p.height - pad;

    const rMin = 0.25;
    const rMax = 4.0;

    let yMin = Infinity;
    let yMax = -Infinity;
    for (let i = 0; i <= 240; i++) {
      const r = p.lerp(rMin, rMax, i / 240);
      const y = Ueff(r, mu, L);
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
    yMin = Math.min(yMin, E) - 0.2;
    yMax = Math.max(yMax, E) + 0.2;

    const y = Ueff(rMarker, mu, L);
    const px = p.map(rMarker, rMin, rMax, gx1 + 6, gx2 - 6);
    const py = p.map(y, yMin, yMax, gy2 - 6, gy1 + 6);

    p.noStroke();
    p.fill(91, 141, 238);
    p.circle(px, py, 10);

    p.fill(139, 143, 168);
    p.textFont("Inter, sans-serif");
    p.textSize(11);
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text(`r=${rMarker.toFixed(2)}`, px - 8, py - 6);
  }

  function dibujarPausado() {
    p.fill(91, 141, 238);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont("Inter, sans-serif");
    p.textSize(13);
    p.text("— PAUSADO —", p.width / 2, p.height - 20);
  }

  function reiniciar() {
    rMarker = 1.2;
    vR = 0;
    pausado = false;
    btnPausa.textContent = "Pausar";
    actualizarEtiquetas();
  }

  function actualizarEtiquetas() {
    valMu.textContent = parseFloat(sliderMu.value).toFixed(2);
    valL.textContent = parseFloat(sliderL.value).toFixed(2);
    valE.textContent = parseFloat(sliderE.value).toFixed(2);
  }

  p.windowResized = function () {
    const contenedor = document.getElementById("canvas-container");
    p.resizeCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
  };
}, "canvas-container");
