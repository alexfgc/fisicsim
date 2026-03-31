// ─────────────────────────────────────────
// KEPLER: órbita elíptica + áreas (2ª ley) + Runge–Lenz (dirección)
// Modelo geométrico con ecuación polar de la elipse (foco en el origen).
// ─────────────────────────────────────────

new p5(function (p) {
  let sliderA, sliderE, sliderMu, sliderArea;
  let valA, valE, valMu, valArea;
  let btnReiniciar, btnPausa;
  let pausado = false;

  let t = 0; // tiempo sim (u.a.)

  p.setup = function () {
    const contenedor = document.getElementById("canvas-container");
    const canvas = p.createCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
    canvas.parent("canvas-container");

    const placeholder = contenedor.querySelector(".canvas-placeholder");
    if (placeholder) placeholder.remove();

    sliderA = document.getElementById("slider-a");
    sliderE = document.getElementById("slider-e2");
    sliderMu = document.getElementById("slider-mu2");
    sliderArea = document.getElementById("slider-area");

    valA = document.getElementById("val-a");
    valE = document.getElementById("val-e2");
    valMu = document.getElementById("val-mu2");
    valArea = document.getElementById("val-area");

    btnReiniciar = document.getElementById("btn-reiniciar");
    btnPausa = document.getElementById("btn-pausa");

    sliderA.addEventListener("input", actualizarEtiquetas);
    sliderE.addEventListener("input", actualizarEtiquetas);
    sliderMu.addEventListener("input", actualizarEtiquetas);
    sliderArea.addEventListener("input", actualizarEtiquetas);

    btnReiniciar.addEventListener("click", reiniciar);
    btnPausa.addEventListener("click", function () {
      pausado = !pausado;
      btnPausa.textContent = pausado ? "Reanudar" : "Pausar";
    });

    reiniciar();
  };

  p.draw = function () {
    p.background(26, 29, 39);

    const a = parseFloat(sliderA.value);
    const e = parseFloat(sliderE.value);
    const mu = parseFloat(sliderMu.value);
    const dtArea = parseFloat(sliderArea.value);

    // Kepler 3ª ley (unidades normalizadas)
    const T = 2 * Math.PI * Math.sqrt((a * a * a) / mu);
    const n = (2 * Math.PI) / T; // frecuencia media

    if (!pausado) t += 1 / 60;
    const M = (n * t) % (2 * Math.PI); // anomalía media
    const Ean = resolverKepler(M, e);  // anomalía excéntrica
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(Ean / 2), Math.sqrt(1 - e) * Math.cos(Ean / 2));

    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

    const cx = p.width / 2;
    const cy = p.height * 0.46;

    // Escala para que quepa
    const rMax = a * (1 + e);
    const escala = (p.min(p.width, p.height) * 0.34) / rMax;

    dibujarEjes(cx, cy);
    dibujarOrbita(cx, cy, escala, a, e);

    // foco (centro de fuerzas) en el origen
    p.noStroke();
    p.fill(91, 141, 238);
    p.circle(cx, cy, 11);

    // posición del planeta
    const px = cx + r * Math.cos(nu) * escala;
    const py = cy + r * Math.sin(nu) * escala;
    p.fill(110, 200, 150);
    p.circle(px, py, 10);

    // radio vector
    p.stroke(110, 200, 150, 140);
    p.strokeWeight(1.3);
    p.line(cx, cy, px, py);

    // Runge–Lenz: dirección hacia periapsis (eje x positivo en este modelo)
    p.stroke(238, 140, 91, 190);
    p.strokeWeight(2);
    p.line(cx, cy, cx + (rMax * 0.9) * escala, cy);
    p.noStroke();
    p.fill(238, 140, 91);
    p.textFont("Inter, sans-serif");
    p.textSize(11);
    p.textAlign(p.LEFT, p.CENTER);
    p.text("Runge–Lenz → periapsis", cx + 8, cy - 14);

    // Área barrida en Δt (aprox con dos puntos separados)
    dibujarAreaBarrida(cx, cy, escala, a, e, mu, t, dtArea);

    dibujarInfo(a, e, mu, T);
    if (pausado) dibujarPausado();
  };

  function resolverKepler(M, e) {
    // Newton-Raphson para E - e sin E = M
    let E = e < 0.8 ? M : Math.PI;
    for (let i = 0; i < 10; i++) {
      const f = E - e * Math.sin(E) - M;
      const fp = 1 - e * Math.cos(E);
      E = E - f / fp;
    }
    return E;
  }

  function dibujarEjes(cx, cy) {
    p.stroke(50, 54, 66);
    p.strokeWeight(1);
    p.line(12, cy, p.width - 12, cy);
    p.line(cx, 12, cx, p.height - 12);
  }

  function dibujarOrbita(cx, cy, escala, a, e) {
    // elipse con foco en el origen: r(ν) = a(1-e^2)/(1+e cosν)
    p.noFill();
    p.stroke(200, 200, 210);
    p.strokeWeight(1.6);
    p.beginShape();
    for (let i = 0; i <= 900; i++) {
      const nu = p.map(i, 0, 900, -Math.PI, Math.PI);
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
      const x = cx + r * Math.cos(nu) * escala;
      const y = cy + r * Math.sin(nu) * escala;
      p.vertex(x, y);
    }
    p.endShape();
  }

  function dibujarAreaBarrida(cx, cy, escala, a, e, mu, tNow, dtArea) {
    const T = 2 * Math.PI * Math.sqrt((a * a * a) / mu);
    const n = (2 * Math.PI) / T;

    function estadoEnTiempo(tt) {
      const M = (n * tt) % (2 * Math.PI);
      const Ean = resolverKepler(M, e);
      const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(Ean / 2),
        Math.sqrt(1 - e) * Math.cos(Ean / 2)
      );
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
      return { nu, r };
    }

    const s1 = estadoEnTiempo(tNow);
    const s0 = estadoEnTiempo(Math.max(0, tNow - dtArea));

    const x1 = cx + s1.r * Math.cos(s1.nu) * escala;
    const y1 = cy + s1.r * Math.sin(s1.nu) * escala;
    const x0 = cx + s0.r * Math.cos(s0.nu) * escala;
    const y0 = cy + s0.r * Math.sin(s0.nu) * escala;

    p.noStroke();
    p.fill(91, 141, 238, 70);
    p.beginShape();
    p.vertex(cx, cy);
    p.vertex(x0, y0);
    p.vertex(x1, y1);
    p.endShape(p.CLOSE);
  }

  function dibujarInfo(a, e, mu, T) {
    p.noStroke();
    p.fill(139, 143, 168);
    p.textFont("Inter, sans-serif");
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`a=${a.toFixed(2)}   e=${e.toFixed(2)}   μ=${mu.toFixed(2)}`, 14, 14);
    p.text(`T = 2π√(a³/μ) = ${T.toFixed(2)}`, 14, 32);
    p.text("Área barrida (triángulo sombreado) en un Δt fijo", 14, 50);
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
    t = 0;
    pausado = false;
    btnPausa.textContent = "Pausar";
    actualizarEtiquetas();
  }

  function actualizarEtiquetas() {
    valA.textContent = parseFloat(sliderA.value).toFixed(2);
    valE.textContent = parseFloat(sliderE.value).toFixed(2);
    valMu.textContent = parseFloat(sliderMu.value).toFixed(2);
    valArea.textContent = parseFloat(sliderArea.value).toFixed(2);
  }

  p.windowResized = function () {
    const contenedor = document.getElementById("canvas-container");
    p.resizeCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
  };
}, "canvas-container");
