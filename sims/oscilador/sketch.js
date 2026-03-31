// ─────────────────────────────────────────
// OSCILADOR ARMÓNICO SIMPLE — sketch.js
// Motor: p5.js (modo instancia)
// Ecuación: x'' = -(k/m) x
// ─────────────────────────────────────────

new p5(function (p) {

  let x;          // desplazamiento respecto al equilibrio (m)
  let v;          // velocidad (m/s)
  let m;          // masa (kg)
  let k;          // constante del muelle (N/m)
  let pausado = false;

  let escala;     // px por metro (eje horizontal)
  let simTime;    // tiempo de simulación (s)
  let historial;  // { t, x } para la gráfica x(t)

  let sliderMasa, sliderK, sliderAmp;
  let valMasa, valK, valAmp;
  let btnReiniciar, btnPausa;

  const GRAF_DURACION = 3.0;   // ventana temporal de la gráfica (s)
  const GRAF_MAX_PUNTOS = 500;
  const SUBPASOS = 10;

  p.setup = function () {
    const contenedor = document.getElementById("canvas-container");
    const canvas = p.createCanvas(
      contenedor.offsetWidth,
      contenedor.offsetHeight
    );
    canvas.parent("canvas-container");

    const placeholder = contenedor.querySelector(".canvas-placeholder");
    if (placeholder) placeholder.remove();

    sliderMasa = document.getElementById("slider-masa");
    sliderK = document.getElementById("slider-k");
    sliderAmp = document.getElementById("slider-amplitud");
    valMasa = document.getElementById("val-masa");
    valK = document.getElementById("val-k");
    valAmp = document.getElementById("val-amplitud");
    btnReiniciar = document.getElementById("btn-reiniciar");
    btnPausa = document.getElementById("btn-pausa");

    sliderMasa.addEventListener("input", actualizarEtiquetas);
    sliderK.addEventListener("input", actualizarEtiquetas);
    sliderAmp.addEventListener("input", actualizarEtiquetas);

    btnReiniciar.addEventListener("click", reiniciar);
    btnPausa.addEventListener("click", function () {
      pausado = !pausado;
      btnPausa.textContent = pausado ? "Reanudar" : "Pausar";
    });

    actualizarEscala();
    reiniciar();
  };

  function actualizarEscala() {
    const ampMax = 0.45;
    escala = (p.width * 0.36) / ampMax;
  }

  p.draw = function () {
    p.background(26, 29, 39);

    if (!pausado) {
      integrar();
    }

    dibujarMuelleYMasa();
    dibujarGraficaXT();
    dibujarEnergias();
    dibujarInfo();
  };

  function integrar() {
    m = parseFloat(sliderMasa.value);
    k = parseFloat(sliderK.value);

    const dt = (1 / 60) / SUBPASOS;

    for (let i = 0; i < SUBPASOS; i++) {
      const a = -(k / m) * x;
      v += a * dt;
      x += v * dt;
    }

    simTime += 1 / 60;

    historial.push({ t: simTime, x: x });
    if (historial.length > GRAF_MAX_PUNTOS) {
      historial.shift();
    }
  }

  function energiaCinetica() {
    return 0.5 * m * v * v;
  }

  function energiaPotencial() {
    return 0.5 * k * x * x;
  }

  function dibujarMuelleYMasa() {
    const y = p.height * 0.42;
    const xEq = p.width * 0.48;
    const xMasa = xEq + x * escala;
    const xPared = p.width * 0.06;

    const trail = historial.length > 100
      ? historial.slice(-100)
      : historial;
    if (!pausado && trail.length > 1) {
      p.noFill();
      for (let i = 1; i < trail.length; i++) {
        const px0 = xEq + trail[i - 1].x * escala;
        const px1 = xEq + trail[i].x * escala;
        const alpha = p.map(i, 0, trail.length, 0, 160);
        p.stroke(91, 141, 238, alpha);
        p.strokeWeight(1.5);
        p.line(px0, y, px1, y);
      }
    }

    dibujarResorte(xPared, y, xMasa, y, 12);

    p.stroke(60, 64, 78);
    p.strokeWeight(3);
    p.line(xPared, y - 28, xPared, y + 28);

    p.stroke(139, 143, 168);
    p.strokeWeight(1);
    p.drawingContext.setLineDash([5, 5]);
    p.line(xEq, y - 50, xEq, y + 50);
    p.drawingContext.setLineDash([]);

    p.fill(139, 143, 168);
    p.noStroke();
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textFont("Inter, sans-serif");
    p.textSize(11);
    p.text("equilibrio", xEq, y - 56);

    const r = 22;
    p.fill(91, 141, 238);
    p.noStroke();
    p.circle(xMasa, y, r * 2);

    p.fill(139, 143, 168);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(10);
    p.text("m", xMasa, y + r + 4);
  }

  function dibujarResorte(x1, y1, x2, y2, vueltas) {
    const dx = x2 - x1;
    const L = Math.abs(dx);
    if (L < 8) return;

    const paso = L / (vueltas * 2);
    const amp = 14;
    const dir = dx >= 0 ? 1 : -1;

    p.noFill();
    p.stroke(180, 186, 200);
    p.strokeWeight(1.5);

    p.beginShape();
    p.vertex(x1, y1);
    let cx = x1;
    for (let i = 0; i < vueltas * 2; i++) {
      cx += paso * dir;
      const off = (i % 2 === 0) ? -amp : amp;
      p.vertex(cx, y1 + off);
    }
    p.vertex(x2, y2);
    p.endShape();
  }

  function dibujarGraficaXT() {
    const gw = p.min(320, p.width * 0.42);
    const gh = 110;
    const gx2 = p.width - 16;
    const gy2 = p.height - 16;
    const gx1 = gx2 - gw;
    const gy1 = gy2 - gh;

    p.fill(20, 22, 30, 220);
    p.stroke(60, 64, 78);
    p.strokeWeight(1);
    p.rect(gx1, gy1, gw, gh, 6);

    p.fill(139, 143, 168);
    p.noStroke();
    p.textFont("Inter, sans-serif");
    p.textSize(11);
    p.textAlign(p.LEFT, p.TOP);
    p.text("x(t)", gx1 + 8, gy1 + 6);

    const t1 = simTime;
    const t0 = Math.max(0, t1 - GRAF_DURACION);
    const ventana = historial.filter(function (pt) {
      return pt.t >= t0;
    });

    if (ventana.length < 2) return;

    let xMin = ventana[0].x;
    let xMax = ventana[0].x;
    for (let i = 1; i < ventana.length; i++) {
      if (ventana[i].x < xMin) xMin = ventana[i].x;
      if (ventana[i].x > xMax) xMax = ventana[i].x;
    }
    const margen = 0.02;
    const span = Math.max(xMax - xMin, 0.08);
    const yLo = xMin - margen * span;
    const yHi = xMax + margen * span;

    p.stroke(50, 54, 66);
    p.strokeWeight(1);
    const y0 = p.map(0, yLo, yHi, gy2 - 4, gy1 + 4);
    p.line(gx1 + 4, y0, gx2 - 4, y0);

    p.noFill();
    p.stroke(91, 141, 238);
    p.strokeWeight(1.5);
    p.beginShape();
    for (let i = 0; i < ventana.length; i++) {
      const px = p.map(ventana[i].t, t0, t1, gx1 + 4, gx2 - 4);
      const py = p.map(ventana[i].x, yLo, yHi, gy2 - 4, gy1 + 4);
      p.vertex(px, py);
    }
    p.endShape();
  }

  function dibujarEnergias() {
    m = parseFloat(sliderMasa.value);
    k = parseFloat(sliderK.value);

    const Ec = energiaCinetica();
    const Ep = energiaPotencial();
    const Etot = Ec + Ep;

    const bx = 14;
    const by = p.height - 78;
    const bw = p.min(240, p.width * 0.38);
    const bh = 10;

    p.fill(139, 143, 168);
    p.noStroke();
    p.textFont("Inter, sans-serif");
    p.textSize(11);
    p.textAlign(p.LEFT, p.TOP);
    p.text(
      `Ec = ${Ec.toFixed(3)} J   Ep = ${Ep.toFixed(3)} J   E = ${Etot.toFixed(3)} J`,
      bx,
      by - 20
    );

    if (Etot < 1e-9) return;

    const fC = Ec / Etot;
    const fP = Ep / Etot;

    p.noStroke();
    p.fill(45, 48, 58);
    p.rect(bx, by, bw, bh, 4);

    const wC = bw * fC;
    const wP = bw * fP;
    p.fill(110, 200, 150);
    p.rect(bx, by, wC, bh, 4);
    p.fill(91, 141, 238);
    p.rect(bx + wC, by, wP, bh, 4);

    p.fill(200, 200, 210);
    p.textSize(9);
    p.text("Ec", bx + 4, by + 1);
    p.text("Ep", bx + wC + 4, by + 1);
  }

  function dibujarInfo() {
    m = parseFloat(sliderMasa.value);
    k = parseFloat(sliderK.value);

    const w0 = Math.sqrt(k / m);
    const T = (2 * Math.PI) / w0;

    p.fill(139, 143, 168);
    p.noStroke();
    p.textFont("Inter, sans-serif");
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`T = ${T.toFixed(3)} s    ω₀ = ${w0.toFixed(3)} rad/s`, 14, 14);
    p.text(`x = ${x.toFixed(3)} m    v = ${v.toFixed(3)} m/s`, 14, 32);

    if (pausado) {
      p.fill(91, 141, 238);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(13);
      p.text("— PAUSADO —", p.width / 2, p.height - 20);
    }
  }

  function reiniciar() {
    m = parseFloat(sliderMasa.value);
    k = parseFloat(sliderK.value);
    const A = parseFloat(sliderAmp.value);
    x = A;
    v = 0;
    simTime = 0;
    historial = [{ t: 0, x: x }];
    pausado = false;
    btnPausa.textContent = "Pausar";
  }

  function actualizarEtiquetas() {
    valMasa.textContent = parseFloat(sliderMasa.value).toFixed(1);
    valK.textContent = sliderK.value;
    valAmp.textContent = parseFloat(sliderAmp.value).toFixed(2);
  }

  p.windowResized = function () {
    const contenedor = document.getElementById("canvas-container");
    p.resizeCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
    actualizarEscala();
  };

}, "canvas-container");
