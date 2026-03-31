// ─────────────────────────────────────────
// CÓNICAS EN POLARES Y CARTESIANAS (Kepler)
// r(θ) = p / (1 + e cos θ)
// ─────────────────────────────────────────

new p5(function (p) {
  let sliderE, sliderP, sliderPhi0;
  let valE, valP, valPhi0;
  let btnReiniciar, btnPausa;
  let pausado = false;

  let thetaAnim = 0;

  p.setup = function () {
    const contenedor = document.getElementById("canvas-container");
    const canvas = p.createCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
    canvas.parent("canvas-container");

    const placeholder = contenedor.querySelector(".canvas-placeholder");
    if (placeholder) placeholder.remove();

    sliderE = document.getElementById("slider-e");
    sliderP = document.getElementById("slider-p");
    sliderPhi0 = document.getElementById("slider-phi0");
    valE = document.getElementById("val-e");
    valP = document.getElementById("val-p");
    valPhi0 = document.getElementById("val-phi0");
    btnReiniciar = document.getElementById("btn-reiniciar");
    btnPausa = document.getElementById("btn-pausa");

    sliderE.addEventListener("input", actualizarEtiquetas);
    sliderP.addEventListener("input", actualizarEtiquetas);
    sliderPhi0.addEventListener("input", actualizarEtiquetas);

    btnReiniciar.addEventListener("click", reiniciar);
    btnPausa.addEventListener("click", function () {
      pausado = !pausado;
      btnPausa.textContent = pausado ? "Reanudar" : "Pausar";
    });

    reiniciar();
  };

  p.draw = function () {
    p.background(26, 29, 39);
    const e = parseFloat(sliderE.value);
    const pParam = parseFloat(sliderP.value);
    const phi0 = p.radians(parseFloat(sliderPhi0.value));

    const cx = p.width / 2;
    const cy = p.height * 0.46;

    // Escala automática para que quepa (estimación r_max)
    const rMax = estimarRmax(e, pParam);
    const escala = (p.min(p.width, p.height) * 0.35) / rMax;

    dibujarEjes(cx, cy);
    dibujarConica(cx, cy, escala, e, pParam, phi0);

    if (!pausado) thetaAnim += 0.02;
    dibujarPunto(cx, cy, escala, e, pParam, phi0, thetaAnim);

    dibujarTexto(cx, cy, e);
    if (pausado) dibujarPausado();
  };

  function rDeTheta(theta, e, pParam) {
    const denom = 1 + e * Math.cos(theta);
    if (Math.abs(denom) < 1e-6) return Infinity;
    const r = pParam / denom;
    return r > 0 ? r : Infinity;
  }

  function estimarRmax(e, pParam) {
    if (e < 1) {
      // elipse: r_max = p/(1-e)
      return pParam / Math.max(1e-6, (1 - e));
    }
    // para e>=1, limitamos por estética
    return pParam / 0.15;
  }

  function dibujarEjes(cx, cy) {
    p.stroke(50, 54, 66);
    p.strokeWeight(1);
    p.line(12, cy, p.width - 12, cy);
    p.line(cx, 12, cx, p.height - 12);
  }

  function dibujarConica(cx, cy, escala, e, pParam, phi0) {
    const pasos = 900;
    p.noFill();
    p.stroke(200, 200, 210);
    p.strokeWeight(1.6);

    p.beginShape();
    let dibujando = false;
    for (let i = 0; i <= pasos; i++) {
      const theta = p.map(i, 0, pasos, -Math.PI, Math.PI) + phi0;
      const r = rDeTheta(theta - phi0, e, pParam);
      if (!isFinite(r)) {
        if (dibujando) {
          p.endShape();
          p.beginShape();
        }
        dibujando = false;
        continue;
      }

      const x = cx + r * Math.cos(theta) * escala;
      const y = cy + r * Math.sin(theta) * escala;
      p.vertex(x, y);
      dibujando = true;
    }
    p.endShape();

    // foco en el origen
    p.noStroke();
    p.fill(91, 141, 238);
    p.circle(cx, cy, 10);

    // directriz aproximada para e<1 (opcional visual simple)
    if (e > 0.02 && e < 0.98) {
      // para r = p/(1+e cosθ) con foco en origen, directriz x = p/e
      const xDir = cx + (pParam / e) * escala * Math.cos(phi0);
      const yDir = cy + (pParam / e) * escala * Math.sin(phi0);
      const nx = -Math.sin(phi0);
      const ny = Math.cos(phi0);

      p.stroke(91, 141, 238, 90);
      p.strokeWeight(1);
      p.drawingContext.setLineDash([6, 6]);
      p.line(
        xDir - nx * 1000, yDir - ny * 1000,
        xDir + nx * 1000, yDir + ny * 1000
      );
      p.drawingContext.setLineDash([]);
    }
  }

  function dibujarPunto(cx, cy, escala, e, pParam, phi0, thetaAnim) {
    const theta = (thetaAnim % (2 * Math.PI)) - Math.PI;
    const r = rDeTheta(theta, e, pParam);
    if (!isFinite(r)) return;

    const th = theta + phi0;
    const x = cx + r * Math.cos(th) * escala;
    const y = cy + r * Math.sin(th) * escala;

    p.noStroke();
    p.fill(110, 200, 150);
    p.circle(x, y, 9);

    // radio vector
    p.stroke(110, 200, 150, 120);
    p.strokeWeight(1.2);
    p.line(cx, cy, x, y);
  }

  function dibujarTexto(cx, cy, e) {
    const tipo =
      e < 1 ? "Elipse" :
      (Math.abs(e - 1) < 0.01 ? "Parábola" : "Hipérbola");

    p.noStroke();
    p.fill(139, 143, 168);
    p.textFont("Inter, sans-serif");
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`${tipo}  (e = ${e.toFixed(2)})`, 14, 14);
    p.text("Ecuación: r(θ) = p / (1 + e cos θ)", 14, 32);
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
    thetaAnim = 0;
    pausado = false;
    btnPausa.textContent = "Pausar";
    actualizarEtiquetas();
  }

  function actualizarEtiquetas() {
    valE.textContent = parseFloat(sliderE.value).toFixed(2);
    valP.textContent = parseFloat(sliderP.value).toFixed(2);
    valPhi0.textContent = sliderPhi0.value;
  }

  p.windowResized = function () {
    const contenedor = document.getElementById("canvas-container");
    p.resizeCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
  };
}, "canvas-container");
