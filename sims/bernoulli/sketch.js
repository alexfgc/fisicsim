// ─────────────────────────────────────────
// PRINCIPIO DE BERNOULLI — sketch.js
// Flujo ideal en un tubo de Venturi horizontal
// ─────────────────────────────────────────

new p5(function (p) {
  let sliderV1, sliderRatio, sliderRho, sliderP1;
  let valV1, valRatio, valRho, valP1;
  let btnReiniciar, btnPausa;

  let pausado = false;
  let particulas = [];
  let tSim = 0;

  const N_PARTICULAS = 90;
  const L_TUBO_M = 2.0; // longitud representada para x (m)
  const A1 = 1.0; // área de referencia (u.a.)
  const G = 9.81;

  p.setup = function () {
    const contenedor = document.getElementById("canvas-container");
    const canvas = p.createCanvas(
      contenedor.offsetWidth,
      contenedor.offsetHeight
    );
    canvas.parent("canvas-container");

    const placeholder = contenedor.querySelector(".canvas-placeholder");
    if (placeholder) placeholder.remove();

    sliderV1 = document.getElementById("slider-v1");
    sliderRatio = document.getElementById("slider-ratio");
    sliderRho = document.getElementById("slider-rho");
    sliderP1 = document.getElementById("slider-p1");

    valV1 = document.getElementById("val-v1");
    valRatio = document.getElementById("val-ratio");
    valRho = document.getElementById("val-rho");
    valP1 = document.getElementById("val-p1");

    btnReiniciar = document.getElementById("btn-reiniciar");
    btnPausa = document.getElementById("btn-pausa");

    sliderV1.addEventListener("input", actualizarEtiquetas);
    sliderRatio.addEventListener("input", actualizarEtiquetas);
    sliderRho.addEventListener("input", actualizarEtiquetas);
    sliderP1.addEventListener("input", actualizarEtiquetas);

    btnReiniciar.addEventListener("click", reiniciar);
    btnPausa.addEventListener("click", function () {
      pausado = !pausado;
      btnPausa.textContent = pausado ? "Reanudar" : "Pausar";
    });

    reiniciar();
  };

  p.draw = function () {
    p.background(26, 29, 39);
    dibujarVenturi();
    if (!pausado) avanzarParticulas();
    dibujarParticulas();
    dibujarIndicadores();
    dibujarInfo();
  };

  function estado() {
    const v1 = parseFloat(sliderV1.value);
    const ratio = parseFloat(sliderRatio.value); // A2/A1
    const rho = parseFloat(sliderRho.value);
    const p1 = parseFloat(sliderP1.value) * 1000; // kPa -> Pa

    const A2 = A1 * ratio;
    const v2 = v1 * (A1 / A2);
    const p2 = p1 + 0.5 * rho * (v1 * v1 - v2 * v2);
    const dp = p1 - p2;
    return { v1, v2, p1, p2, dp, rho, ratio };
  }

  function radioNorm(xn, ratio) {
    // Perfil suave: ancho -> garganta -> ancho
    const garganta = 0.35 + 0.65 * ratio; // radio relativo en garganta
    const x0 = 0.50;
    const w = 0.22;
    const d = Math.abs(xn - x0);
    if (d > w) return 1.0;
    const s = d / w;
    const easing = 0.5 - 0.5 * Math.cos(Math.PI * s);
    return garganta + (1.0 - garganta) * easing;
  }

  function velocidadLocal(xn, s) {
    // v proporcional a 1/área y área ~ radio^2
    const r = radioNorm(xn, s.ratio);
    const areaRel = r * r;
    return s.v1 / areaRel;
  }

  function dibujarVenturi() {
    const yC = p.height * 0.42;
    const xL = p.width * 0.08;
    const xR = p.width * 0.92;
    const rMax = p.min(58, p.height * 0.14);
    const pasos = 120;
    const s = estado();

    p.noFill();
    p.stroke(170, 176, 196);
    p.strokeWeight(2);

    p.beginShape();
    for (let i = 0; i <= pasos; i++) {
      const xn = i / pasos;
      const x = p.lerp(xL, xR, xn);
      const r = rMax * radioNorm(xn, s.ratio);
      p.vertex(x, yC - r);
    }
    p.endShape();

    p.beginShape();
    for (let i = 0; i <= pasos; i++) {
      const xn = i / pasos;
      const x = p.lerp(xL, xR, xn);
      const r = rMax * radioNorm(xn, s.ratio);
      p.vertex(x, yC + r);
    }
    p.endShape();

    // Secciones 1 y 2
    const x1 = p.lerp(xL, xR, 0.2);
    const x2 = p.lerp(xL, xR, 0.5);
    p.stroke(139, 143, 168);
    p.strokeWeight(1);
    p.drawingContext.setLineDash([5, 5]);
    p.line(x1, yC - rMax - 18, x1, yC + rMax + 18);
    p.line(x2, yC - rMax - 18, x2, yC + rMax + 18);
    p.drawingContext.setLineDash([]);

    p.noStroke();
    p.fill(139, 143, 168);
    p.textFont("Inter, sans-serif");
    p.textSize(11);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text("Sección 1", x1, yC - rMax - 20);
    p.text("Sección 2", x2, yC - rMax - 20);
  }

  function crearParticulas() {
    particulas = [];
    for (let i = 0; i < N_PARTICULAS; i++) {
      particulas.push({
        x: Math.random() * 1.0,
        yNorm: (Math.random() * 2 - 1) * 0.8
      });
    }
  }

  function avanzarParticulas() {
    const s = estado();
    const dt = 1 / 60;
    tSim += dt;
    for (let i = 0; i < particulas.length; i++) {
      const par = particulas[i];
      const vLoc = velocidadLocal(par.x, s);
      par.x += (vLoc / L_TUBO_M) * dt;
      if (par.x > 1.0) par.x -= 1.0;
    }
  }

  function dibujarParticulas() {
    const yC = p.height * 0.42;
    const xL = p.width * 0.08;
    const xR = p.width * 0.92;
    const rMax = p.min(58, p.height * 0.14);
    const s = estado();

    p.noStroke();
    p.fill(91, 141, 238, 210);
    for (let i = 0; i < particulas.length; i++) {
      const par = particulas[i];
      const xPx = p.lerp(xL, xR, par.x);
      const rLoc = rMax * radioNorm(par.x, s.ratio);
      const yPx = yC + par.yNorm * rLoc;
      p.circle(xPx, yPx, 5);
    }
  }

  function dibujarIndicadores() {
    const s = estado();
    const p1 = s.p1;
    const p2 = s.p2;

    const yBase = p.height - 24;
    const x1 = p.width * 0.19;
    const x2 = p.width * 0.33;
    const barW = 36;
    const hMax = 90;

    // "Altura piezométrica" simplificada h = p/(rho g)
    const h1 = p1 / (s.rho * G);
    const h2 = p.max(0, p2 / (s.rho * G));
    const esc = hMax / Math.max(h1, h2, 1e-6);
    const bh1 = h1 * esc;
    const bh2 = h2 * esc;

    p.noStroke();
    p.fill(45, 48, 58);
    p.rect(x1, yBase - hMax, barW, hMax, 4);
    p.rect(x2, yBase - hMax, barW, hMax, 4);

    p.fill(91, 141, 238);
    p.rect(x1, yBase - bh1, barW, bh1, 4);
    p.rect(x2, yBase - bh2, barW, bh2, 4);

    p.fill(139, 143, 168);
    p.textFont("Inter, sans-serif");
    p.textSize(10);
    p.textAlign(p.CENTER, p.TOP);
    p.text("p1", x1 + barW / 2, yBase + 4);
    p.text("p2", x2 + barW / 2, yBase + 4);
  }

  function dibujarInfo() {
    const s = estado();
    const p2kPa = s.p2 / 1000;

    p.fill(139, 143, 168);
    p.noStroke();
    p.textFont("Inter, sans-serif");
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`v1 = ${s.v1.toFixed(2)} m/s   v2 = ${s.v2.toFixed(2)} m/s`, 14, 14);
    p.text(`p1 = ${(s.p1 / 1000).toFixed(1)} kPa   p2 = ${p2kPa.toFixed(1)} kPa`, 14, 32);
    p.text(`Δp = ${(s.dp / 1000).toFixed(2)} kPa`, 14, 50);

    if (s.p2 < 0) {
      p.fill(238, 140, 91);
      p.textSize(11);
      p.text("Advertencia: p2 < 0 (parámetros fuera del régimen físico ideal).", 14, 70);
    }

    if (pausado) {
      p.fill(91, 141, 238);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(13);
      p.text("— PAUSADO —", p.width / 2, p.height - 20);
    }
  }

  function reiniciar() {
    crearParticulas();
    tSim = 0;
    pausado = false;
    btnPausa.textContent = "Pausar";
    actualizarEtiquetas();
  }

  function actualizarEtiquetas() {
    valV1.textContent = parseFloat(sliderV1.value).toFixed(1);
    valRatio.textContent = parseFloat(sliderRatio.value).toFixed(2);
    valRho.textContent = sliderRho.value;
    valP1.textContent = sliderP1.value;
  }

  p.windowResized = function () {
    const contenedor = document.getElementById("canvas-container");
    p.resizeCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
  };
}, "canvas-container");
