// ─────────────────────────────────────────
// FUERZAS FICTICIAS (CORIOLIS) — sketch.js
// Motor: p5.js (modo instancia)
//
// Pantalla dividida:
//   Izquierda  — marco inercial: disco que gira con Ω (rad/frame); partícula
//               en línea recta a velocidad constante (sin fuerzas reales).
//   Derecha    — marco rotante: disco fijo; integración con
//               a_rot = -2 Ω×v - Ω×(Ω×r) (Euler–Cromer, 10 subpasos/frame).
//
// Geometría: radio del disco R = min(w/4, h/2) * 0.85 (encaja en cada mitad).
// Unidades: longitudes en píxeles; Ω en rad/frame; v en px/frame.
// ─────────────────────────────────────────

new p5(function (p) {
  let sliderOmega, sliderV0;
  let valOmega, valV0;
  let btnReiniciar, btnPausa;

  let pausado = false;
  /** Simulación detenida al salir del disco (límite de radio dinámico R). */
  let detenidaPorLimite = false;

  let rInX, rInY;
  let rx, ry, vx, vy;
  let anguloDisco;

  let trailIn = [];
  let trailRot = [];
  const TRAIL_MAX = 280;
  const SUBPASOS = 10;

  const COL_ACENTO = [91, 141, 238];
  const COL_TRAIL_IN = [110, 200, 150];
  const COL_TRAIL_ROT = [91, 141, 238];

  p.setup = function () {
    const contenedor = document.getElementById("canvas-container");
    const canvas = p.createCanvas(
      contenedor.offsetWidth,
      contenedor.offsetHeight
    );
    canvas.parent("canvas-container");

    const placeholder = contenedor.querySelector(".canvas-placeholder");
    if (placeholder) placeholder.remove();

    sliderOmega = document.getElementById("slider-omega");
    sliderV0 = document.getElementById("slider-v0");
    valOmega = document.getElementById("val-omega");
    valV0 = document.getElementById("val-v0");
    btnReiniciar = document.getElementById("btn-reiniciar");
    btnPausa = document.getElementById("btn-pausa");

    sliderOmega.addEventListener("input", actualizarEtiquetas);
    sliderV0.addEventListener("input", actualizarEtiquetas);

    btnReiniciar.addEventListener("click", reiniciar);
    btnPausa.addEventListener("click", function () {
      pausado = !pausado;
      btnPausa.textContent = pausado ? "Reanudar" : "Pausar";
    });

    reiniciar();
  };

  p.draw = function () {
    p.background(26, 29, 39);

    const Omega = parseFloat(sliderOmega.value);
    const v0 = parseFloat(sliderV0.value);

    const w = p.width;
    const h = p.height;

    /** Radio máximo del disco: cabe en la mitad izquierda/derecha con ~15% de margen. */
    const R = p.min(w / 4, h / 2) * 0.85;

    const cx1 = w / 4;
    const cx2 = (3 * w) / 4;
    const cy = h / 2;

    // Tras windowResized, R puede ser menor: estado ya fuera del nuevo disco.
    if (!detenidaPorLimite && (Math.hypot(rx, ry) > R || Math.abs(rInX) > R)) {
      detenidaPorLimite = true;
    }

    p.stroke(45, 48, 58);
    p.strokeWeight(1);
    p.line(w / 2, 12, w / 2, h - 12);

    if (!pausado && !detenidaPorLimite) {
      const bk = {
        rInX: rInX,
        rInY: rInY,
        rx: rx,
        ry: ry,
        vx: vx,
        vy: vy,
        anguloDisco: anguloDisco
      };

      rInX += v0;
      rInY = 0;
      anguloDisco += Omega;

      const dt = 1 / SUBPASOS;
      let fuera = false;
      for (let s = 0; s < SUBPASOS; s++) {
        const a = aceleracionRotante(rx, ry, vx, vy, Omega);
        vx += a.ax * dt;
        vy += a.ay * dt;
        rx += vx * dt;
        ry += vy * dt;

        // LÍMITE DE RADIO (marco rotante): |r| no puede superar R (mismo R que el dibujo).
        if (Math.hypot(rx, ry) > R) {
          fuera = true;
          break;
        }
      }

      // LÍMITE DE RADIO (marco inercial): recta desde el centro, |x| ≤ R.
      if (Math.abs(rInX) > R) fuera = true;

      if (fuera) {
        rInX = bk.rInX;
        rInY = bk.rInY;
        rx = bk.rx;
        ry = bk.ry;
        vx = bk.vx;
        vy = bk.vy;
        anguloDisco = bk.anguloDisco;
        detenidaPorLimite = true;
      } else {
        trailIn.push({ x: rInX, y: rInY });
        trailRot.push({ x: rx, y: ry });
        if (trailIn.length > TRAIL_MAX) trailIn.shift();
        if (trailRot.length > TRAIL_MAX) trailRot.shift();
      }
    }

    dibujarPanelInercial(cx1, cy, R, Omega);
    dibujarPanelRotante(cx2, cy, R);

    if (pausado) {
      p.fill(COL_ACENTO[0], COL_ACENTO[1], COL_ACENTO[2]);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textFont("Inter, sans-serif");
      p.textSize(13);
      p.text("— PAUSADO —", w / 2, h - 36);
    }
    if (detenidaPorLimite) {
      p.fill(238, 140, 91);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textFont("Inter, sans-serif");
      p.textSize(12);
      p.text(
        "Límite del disco (R ≈ " + R.toFixed(0) + " px) — Reiniciar",
        w / 2,
        h - 18
      );
    }
  };

  function aceleracionRotante(rx_, ry_, vx_, vy_, Omega) {
    const ocrx = -Omega * vy_;
    const ocry = Omega * vx_;
    const axCor = -2 * ocrx;
    const ayCor = -2 * ocry;
    const axCent = Omega * Omega * rx_;
    const ayCent = Omega * Omega * ry_;
    return { ax: axCor + axCent, ay: ayCor + ayCent };
  }

  function dibujarPanelInercial(cx, cy, R, Omega) {
    dibujarDisco(cx, cy, anguloDisco, R);

    p.fill(139, 143, 168);
    p.noStroke();
    p.textFont("Inter, sans-serif");
    p.textSize(11);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text("Marco inercial (Ω = " + Omega.toFixed(4) + " rad/frame)", cx, cy - R - 14);

    dibujarTrail(cx, cy, trailIn, COL_TRAIL_IN);
    p.noStroke();
    p.fill(COL_ACENTO[0], COL_ACENTO[1], COL_ACENTO[2]);
    p.circle(cx + rInX, cy - rInY, 12);
  }

  function dibujarPanelRotante(cx, cy, R) {
    dibujarDisco(cx, cy, 0, R);

    p.fill(139, 143, 168);
    p.noStroke();
    p.textFont("Inter, sans-serif");
    p.textSize(11);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text("Marco rotante (Coriolis + centrífuga)", cx, cy - R - 14);

    dibujarTrail(cx, cy, trailRot, COL_TRAIL_ROT);
    p.noStroke();
    p.fill(COL_ACENTO[0], COL_ACENTO[1], COL_ACENTO[2]);
    p.circle(cx + rx, cy - ry, 12);
  }

  function dibujarDisco(cx, cy, thetaGiro, R) {
    p.noFill();
    p.stroke(60, 64, 78);
    p.strokeWeight(2);
    p.circle(cx, cy, 2 * R);

    p.stroke(50, 54, 66);
    p.strokeWeight(1);
    for (let k = 0; k < 8; k++) {
      const ang = thetaGiro + (k / 8) * p.TWO_PI;
      const x2 = cx + Math.cos(ang) * R;
      const y2 = cy + Math.sin(ang) * R;
      p.line(cx, cy, x2, y2);
    }

    p.fill(26, 29, 39, 130);
    p.noStroke();
    p.circle(cx, cy, 2 * R - 4);
  }

  function dibujarTrail(cx, cy, trail, col) {
    p.noFill();
    for (let i = 1; i < trail.length; i++) {
      const al = p.map(i, 0, trail.length, 40, 200);
      p.stroke(col[0], col[1], col[2], al);
      p.strokeWeight(1.5);
      p.line(
        cx + trail[i - 1].x,
        cy - trail[i - 1].y,
        cx + trail[i].x,
        cy - trail[i].y
      );
    }
  }

  function reiniciar() {
    const v0 = parseFloat(sliderV0.value);
    rInX = 0;
    rInY = 0;
    rx = 0;
    ry = 0;
    vx = v0;
    vy = 0;
    anguloDisco = 0;
    detenidaPorLimite = false;
    trailIn = [];
    trailRot = [];
    pausado = false;
    btnPausa.textContent = "Pausar";
    actualizarEtiquetas();
  }

  function actualizarEtiquetas() {
    valOmega.textContent = parseFloat(sliderOmega.value).toFixed(4);
    valV0.textContent = parseFloat(sliderV0.value).toFixed(2);
  }

  p.windowResized = function () {
    const contenedor = document.getElementById("canvas-container");
    p.resizeCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
    // Redimensionar cambia R y las coordenadas en pantalla: vaciar rastros para no unir
    // puntos de escalas distintas.
    trailIn = [];
    trailRot = [];
  };
}, "canvas-container");