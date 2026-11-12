"use strict";

/* ==========================================================================
   Pesca Lendária — sprites.js
   Motor de pixel art: desenha todos os sprites em <canvas>.
   Carregado depois de data.js.
   ========================================================================== */
/* ==========================================================================
   15) MOTOR DE SPRITES PIXEL
   Grelhas de pixels (arrays de strings/cores) convertidas em <canvas>.
   ========================================================================== */

/** Cria uma grelha vazia (h linhas x w colunas). */
function novoGrid(w, h) {
  const g = new Array(h);
  for (let y = 0; y < h; y++) { g[y] = new Array(w).fill(null); }
  return g;
}

/** Pinta um pixel se estiver dentro da grelha. */
function px(g, x, y, cor) {
  x = Math.round(x); y = Math.round(y);
  if (cor && y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = cor;
}

/** Retângulo de pixels. */
function rectPx(g, x, y, w, h, cor) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(g, x + i, y + j, cor);
}

/** Elipse preenchida (em coordenadas de pixel). */
function elipsePx(g, cx, cy, rx, ry, cor) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1.08) px(g, x, y, cor);
    }
  }
}

/** Linha de pixels (Bresenham). */
function linhaPx(g, x0, y0, x1, y1, cor) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let erro = dx + dy, x = x0, y = y0, guarda = 0;
  while (guarda++ < 200) {
    px(g, x, y, cor);
    if (x === x1 && y === y1) break;
    const e2 = 2 * erro;
    if (e2 >= dy) { erro += dy; x += sx; }
    if (e2 <= dx) { erro += dx; y += sy; }
  }
}

/** Triângulo preenchido (scanline simples). */
function triPx(g, x0, y0, x1, y1, x2, y2, cor) {
  const minY = Math.floor(Math.min(y0, y1, y2)), maxY = Math.ceil(Math.max(y0, y1, y2));
  const lados = [[x0, y0, x1, y1], [x1, y1, x2, y2], [x2, y2, x0, y0]];
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (let k = 0; k < lados.length; k++) {
      const ax = lados[k][0], ay = lados[k][1], bx = lados[k][2], by = lados[k][3];
      if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + (y - ay) * (bx - ax) / (by - ay));
    }
    if (xs.length >= 2) {
      const a = Math.min.apply(null, xs), b = Math.max.apply(null, xs);
      for (let x = Math.round(a); x <= Math.round(b); x++) px(g, x, y, cor);
    }
  }
}

/** Desenha o contorno escuro em volta de todas as formas da grelha. */
function contorno(g, cor) {
  const h = g.length, w = g[0].length;
  const copia = g.map(function (linha) { return linha.slice(); });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (copia[y][x]) continue;
      const vizinho =
        (x > 0 && copia[y][x - 1]) || (x < w - 1 && copia[y][x + 1]) ||
        (y > 0 && copia[y - 1][x]) || (y < h - 1 && copia[y + 1][x]);
      if (vizinho) g[y][x] = cor;
    }
  }
}

/** Converte a grelha num <canvas> nítido (CSS pixelated), com escala. */
function gridParaCanvas(g, escala) {
  const h = g.length, w = g[0].length;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  cv.className = 'spr';
  const ctx = cv.getContext ? cv.getContext('2d') : null;
  if (ctx) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!g[y][x]) continue;
        ctx.fillStyle = g[y][x];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  cv.style.width = (w * escala) + 'px';
  cv.style.height = (h * escala) + 'px';
  return cv;
}

/** Paleta de cada peixe: cor derivada do id, ajustada pela raridade. */
function paletaPeixe(f) {
  let h = (hashStr(f.id) * 37) % 360;
  if (f.r === 4) h = 42;        // Lendário: dourado
  if (f.r === 5) h = 282;       // Mítico: roxo
  const sat = 52 + f.r * 5;
  const lum = 52;
  return {
    corpo:   'hsl(' + h + ',' + sat + '%,' + lum + '%)',
    luz:     'hsl(' + h + ',' + (sat + 12) + '%,' + (lum + 18) + '%)',
    sombra:  'hsl(' + h + ',' + sat + '%,' + (lum - 16) + '%)',
    barriga: 'hsl(' + ((h + 14) % 360) + ',' + Math.max(20, sat - 20) + '%,' + (lum + 32) + '%)',
    detalhe: 'hsl(' + ((h + 180) % 360) + ',70%,55%)',
    contorno: '#241608'
  };
}

/** Escolhe o formato do peixe a partir do emoji (muda o tema sem tocar na lógica). */
function formaDe(f) {
  if (f.id === 'espadarte_contabilista') return 'espadarte';
  const e = f.emoji || '';
  if (e.indexOf('🦈') !== -1) return 'tubarao';
  if (e.indexOf('🐡') !== -1) return 'baiacu';
  if (e.indexOf('🐙') !== -1) return 'polvo';
  if (e.indexOf('🦑') !== -1) return 'lula';
  if (e.indexOf('🦀') !== -1) return 'caranguejo';
  if (e.indexOf('🐋') !== -1 || e.indexOf('🐳') !== -1) return 'baleia';
  if (e.indexOf('🐉') !== -1) return 'dragao';
  return 'peixe';
}

/* --- Formas (grelha 24x18, viradas para a direita) --- */
function formaPeixe(g, p, s) {
  triPx(g, 6, 9, 0, 4, 0, 14, p.sombra);          // cauda
  triPx(g, 6, 9, 2, 6, 2, 12, p.corpo);
  elipsePx(g, 12, 9, 7, 4.4, p.corpo);            // corpo
  elipsePx(g, 12, 11.2, 5.8, 1.9, p.barriga);     // barriga
  elipsePx(g, 11, 6.6, 4.2, 1.3, p.luz);          // brilho
  triPx(g, 10, 5, 14, 0.5, 17, 5, p.sombra);      // barbatana dorsal
  triPx(g, 9, 12.5, 7, 16, 12, 13.5, p.sombra);   // barbatana ventral
  rectPx(g, 15, 7, 2, 2, '#ffffff');              // olho
  px(g, 16, 8, '#191919');
  if (s % 2 === 0) { px(g, 9, 7, p.detalhe); px(g, 9, 8, p.detalhe); px(g, 10, 9, p.detalhe); }
  else { px(g, 8, 8, p.detalhe); px(g, 10, 8, p.detalhe); }
}

function formaEspadarte(g, p) {
  triPx(g, 6, 9, 0, 5, 0, 13, p.sombra);
  elipsePx(g, 11, 9, 6.5, 3, p.corpo);
  elipsePx(g, 11, 10.6, 5.4, 1.4, p.barriga);
  triPx(g, 9, 6, 12, 2, 14, 6, p.sombra);
  linhaPx(g, 17, 9, 23, 8, p.sombra);             // bico comprido
  linhaPx(g, 17, 10, 23, 9, p.corpo);
  rectPx(g, 15, 7, 2, 2, '#ffffff');
  px(g, 16, 8, '#191919');
}

function formaTubarao(g, p) {
  triPx(g, 5, 9, 0, 4, 0, 14, p.sombra);
  elipsePx(g, 12, 9, 8, 4.2, p.corpo);
  elipsePx(g, 12, 11.4, 6.6, 1.9, p.barriga);
  triPx(g, 10, 5.5, 13, 0.5, 16, 5.5, p.sombra);
  elipsePx(g, 11, 6.4, 5.6, 1.2, p.luz);
  rectPx(g, 16, 7, 2, 2, '#ffffff');
  px(g, 17, 8, '#101010');
  px(g, 13, 8, p.sombra); px(g, 13, 9, p.sombra); px(g, 13, 10, p.sombra); // guelras
  linhaPx(g, 17, 11, 20, 11, '#6b4a3a');          // boca
}

function formaBaleia(g, p) {
  triPx(g, 7, 9, 1, 5, 1, 9, p.sombra);
  triPx(g, 7, 9, 1, 13, 1, 9, p.sombra);
  elipsePx(g, 13, 9, 8, 4.6, p.corpo);
  elipsePx(g, 13, 11.5, 6.8, 1.9, p.barriga);
  elipsePx(g, 12, 6.4, 5.6, 1.2, p.luz);
  rectPx(g, 18, 8, 2, 2, '#ffffff');
  px(g, 19, 9, '#101010');
  px(g, 9, 12, p.sombra); px(g, 12, 12, p.sombra); px(g, 15, 12, p.sombra);
  px(g, 14, 2, '#dff3ff'); px(g, 14, 1, '#dff3ff'); px(g, 13, 3, '#dff3ff'); px(g, 15, 3, '#dff3ff');
}

function formaPolvo(g, p) {
  elipsePx(g, 12, 7, 5.6, 4.6, p.corpo);
  elipsePx(g, 11, 5.4, 3.6, 1.4, p.luz);
  rectPx(g, 9, 6, 2, 2, '#ffffff'); px(g, 10, 7, '#101010');
  rectPx(g, 13, 6, 2, 2, '#ffffff'); px(g, 14, 7, '#101010');
  for (let i = 0; i < 5; i++) {                    // tentáculos ondulados
    const bx = 7.5 + i * 2.3;
    for (let y = 11; y <= 16; y++) {
      const off = Math.round(Math.sin((y + i * 2) * 1.1));
      px(g, bx + off, y, (i % 2 === 0) ? p.corpo : p.sombra);
    }
  }
}

function formaLula(g, p) {
  triPx(g, 12, 0, 8, 9, 16, 9, p.corpo);           // cabeça pontiaguda
  rectPx(g, 8, 9, 8, 3, p.corpo);
  triPx(g, 8, 6, 3.5, 9, 8, 9, p.luz);             // barbatanas
  triPx(g, 16, 6, 20.5, 9, 16, 9, p.luz);
  rectPx(g, 10, 8, 2, 2, '#ffffff'); px(g, 11, 9, '#101010');
  rectPx(g, 14, 8, 2, 2, '#ffffff'); px(g, 15, 9, '#101010');
  for (let i = 0; i < 3; i++) linhaPx(g, 9 + i * 3, 12, 8 + i * 3, 16, p.sombra);
}

function formaCaranguejo(g, p) {
  elipsePx(g, 12, 10, 7, 3.4, p.corpo);
  elipsePx(g, 12, 9, 5.4, 1.4, p.luz);
  elipsePx(g, 3.5, 7, 2.4, 2.2, p.sombra);          // pinças
  elipsePx(g, 20.5, 7, 2.4, 2.2, p.sombra);
  px(g, 3, 6, p.corpo); px(g, 21, 6, p.corpo);
  linhaPx(g, 7, 12, 3, 16, p.sombra);               // patas
  linhaPx(g, 9, 13, 7, 17, p.sombra);
  linhaPx(g, 17, 12, 21, 16, p.sombra);
  linhaPx(g, 15, 13, 17, 17, p.sombra);
  px(g, 10, 6, '#ffffff'); px(g, 10, 5, '#101010'); // olhos em pedúnculos
  px(g, 14, 6, '#ffffff'); px(g, 14, 5, '#101010');
}

function formaBaiacu(g, p) {
  elipsePx(g, 12, 9, 4.8, 4.6, p.corpo);
  elipsePx(g, 11, 7, 2.6, 1.2, p.luz);
  elipsePx(g, 12, 10.6, 3.4, 1.4, p.barriga);
  for (let a = 0; a < 8; a++) {                     // espinhos
    const ang = a * Math.PI / 4;
    linhaPx(g, 12 + Math.cos(ang) * 4.4, 9 + Math.sin(ang) * 4.2,
               12 + Math.cos(ang) * 6.2, 9 + Math.sin(ang) * 6.0, p.sombra);
  }
  triPx(g, 8, 9, 3, 6.5, 3, 11.5, p.sombra);
  rectPx(g, 9, 7, 2, 2, '#ffffff'); px(g, 10, 8, '#101010');
  rectPx(g, 14, 7, 2, 2, '#ffffff'); px(g, 15, 8, '#101010');
  px(g, 12, 11, '#7a4030'); px(g, 13, 11, '#7a4030');
}

function formaDragao(g, p) {
  triPx(g, 6, 9, 1, 6, 1, 12, p.sombra);
  elipsePx(g, 13, 9.5, 8, 4.4, p.corpo);
  elipsePx(g, 13, 11.6, 6.8, 1.8, p.barriga);
  for (let i = 0; i < 5; i++) {                     // espinhos das costas
    triPx(g, 7 + i * 2.8, 6.4, 8.2 + i * 2.8, 2.6, 9.4 + i * 2.8, 6.4, p.sombra);
  }
  triPx(g, 16.5, 5.4, 17.5, 1, 19, 5.4, p.sombra);  // chifres
  triPx(g, 19, 5.4, 20, 1.5, 21.2, 5.4, p.sombra);
  linhaPx(g, 20, 10, 23, 13, '#e8c060');            // bigodes
  linhaPx(g, 20, 11, 23, 15, '#e8c060');
  rectPx(g, 18, 7, 2, 2, '#ffffff');
  px(g, 19, 8, '#c02020');
}

function desenharForma(forma, g, p, s) {
  switch (forma) {
    case 'espadarte':  formaEspadarte(g, p); break;
    case 'tubarao':    formaTubarao(g, p); break;
    case 'baleia':     formaBaleia(g, p); break;
    case 'polvo':      formaPolvo(g, p); break;
    case 'lula':       formaLula(g, p); break;
    case 'caranguejo': formaCaranguejo(g, p); break;
    case 'baiacu':     formaBaiacu(g, p); break;
    case 'dragao':     formaDragao(g, p); break;
    default:           formaPeixe(g, p, s);
  }
}

/** Sprite de um peixe (escala em px por pixel de arte). */
function spritePeixe(f, escala) {
  const g = novoGrid(24, 18);
  const p = paletaPeixe(f);
  desenharForma(formaDe(f), g, p, hashStr(f.id));
  contorno(g, p.contorno);
  const cv = gridParaCanvas(g, escala);
  if (f.r >= 6) cv.style.filter = 'drop-shadow(0 0 7px rgba(46,230,214,.95))';
  else if (f.r >= 4) cv.style.filter = 'drop-shadow(0 0 6px rgba(255,210,90,.85))';
  return cv;
}

/** Ícones pixel (16x16) para HUD, upgrades e cena. */
function spriteIcone(nome, escala) {
  const g = novoGrid(16, 16);
  const O = '#241608';
  switch (nome) {
    case 'moeda':
      elipsePx(g, 8, 8, 5.2, 5.2, '#f2b632');
      elipsePx(g, 8, 8, 3.7, 3.7, '#ffe08a');
      elipsePx(g, 8, 8, 1.5, 1.5, '#c08a12');
      px(g, 5, 5, '#fff6c0'); px(g, 6, 4, '#fff6c0');
      break;
    case 'sol':
      for (let a = 0; a < 8; a++) {
        const ang = a * Math.PI / 4;
        linhaPx(g, 8 + Math.cos(ang) * 4.4, 8 + Math.sin(ang) * 4.4,
                   8 + Math.cos(ang) * 6.6, 8 + Math.sin(ang) * 6.6, '#ffe08a');
      }
      elipsePx(g, 8, 8, 4.2, 4.2, '#ffd24a');
      elipsePx(g, 8, 8, 3.1, 3.1, '#ffe08a');
      break;
    case 'barco':
      rectPx(g, 2, 10, 12, 3, '#8b5a2b');
      rectPx(g, 3, 13, 10, 1, '#5c3a1c');
      rectPx(g, 4, 9, 8, 1, '#b07a45');
      rectPx(g, 8, 3, 1, 7, '#5c3a1c');
      triPx(g, 9, 3, 13, 9, 9, 9, '#f7ead0');
      break;
    case 'cana':
      linhaPx(g, 3, 13, 12, 2, '#8b5a2b');
      linhaPx(g, 4, 13, 12, 3, '#b07a45');
      rectPx(g, 6, 9, 3, 3, '#c9a06a');
      px(g, 7, 10, '#5c3a1c');
      linhaPx(g, 13, 4, 13, 8, '#e8e2d0');
      rectPx(g, 12, 9, 2, 2, '#c8453a');
      break;
    case 'isco':
      linhaPx(g, 3, 12, 6, 9, '#e88fa8');
      linhaPx(g, 6, 9, 8, 12, '#e88fa8');
      linhaPx(g, 8, 12, 11, 9, '#e88fa8');
      linhaPx(g, 11, 9, 12, 6, '#e88fa8');
      rectPx(g, 11, 5, 3, 2, '#e88fa8');
      px(g, 13, 5, '#a04a68');
      break;
    case 'pescador':
      rectPx(g, 4, 4, 8, 2, '#c9a06a');
      rectPx(g, 3, 6, 10, 1, '#8b5a2b');
      rectPx(g, 6, 7, 4, 3, '#f0c9a0');
      px(g, 7, 8, '#241608'); px(g, 9, 8, '#241608');
      rectPx(g, 5, 10, 6, 4, '#3f7ab0');
      rectPx(g, 5, 10, 6, 1, '#2f5f8f');
      rectPx(g, 3, 11, 2, 1, '#f0c9a0');
      rectPx(g, 11, 11, 2, 1, '#f0c9a0');
      break;
    case 'geleira':
      rectPx(g, 3, 5, 10, 8, '#bfe6f2');
      rectPx(g, 3, 5, 10, 1, '#e8f8ff');
      rectPx(g, 3, 7, 10, 1, '#8fc6d6');
      rectPx(g, 7, 8, 1, 4, '#ffffff');
      rectPx(g, 5, 9, 5, 1, '#ffffff');
      px(g, 4, 12, '#e8f8ff'); px(g, 11, 12, '#e8f8ff');
      break;
    case 'som':
      rectPx(g, 2, 6, 3, 4, '#f7ead0');
      triPx(g, 5, 8, 9, 3, 9, 13, '#f7ead0');
      px(g, 11, 5, '#f7ead0'); px(g, 12, 6, '#f7ead0'); px(g, 13, 7, '#f7ead0');
      px(g, 13, 8, '#f7ead0'); px(g, 12, 9, '#f7ead0'); px(g, 11, 10, '#f7ead0');
      px(g, 14, 3, '#ffe08a'); px(g, 15, 5, '#ffe08a'); px(g, 15, 9, '#ffe08a'); px(g, 14, 11, '#ffe08a');
      break;
    case 'som_off':
      rectPx(g, 2, 6, 3, 4, '#b9a9d8');
      triPx(g, 5, 8, 9, 3, 9, 13, '#b9a9d8');
      linhaPx(g, 11, 5, 14, 11, '#c8453a');
      linhaPx(g, 14, 5, 11, 11, '#c8453a');
      break;
    case 'alvo':
      elipsePx(g, 8, 8, 6.6, 6.6, '#c8453a');
      elipsePx(g, 8, 8, 4.7, 4.7, '#f7ead0');
      elipsePx(g, 8, 8, 2.7, 2.7, '#c8453a');
      elipsePx(g, 8, 8, 1.0, 1.0, '#f7ead0');
      break;
    case 'raio':
      triPx(g, 9, 1, 4, 8, 9, 8, '#ffe08a');
      rectPx(g, 6, 8, 4, 2, '#ffe08a');
      triPx(g, 7, 15, 12, 7, 7, 7, '#ffe08a');
      break;
    case 'fogo':
      triPx(g, 8, 1, 4, 9, 12, 9, '#ff9e3d');
      elipsePx(g, 8, 11, 4.4, 3.6, '#ff9e3d');
      elipsePx(g, 8, 12, 2.6, 2.2, '#ffe08a');
      px(g, 8, 8, '#fff6c0');
      break;
    case 'medalha':
      triPx(g, 5, 1, 3, 6, 6, 6, '#c8453a');
      triPx(g, 11, 1, 13, 6, 10, 6, '#2f7fb5');
      elipsePx(g, 8, 10, 4.6, 4.6, '#f2b632');
      elipsePx(g, 8, 10, 2.8, 2.8, '#ffe08a');
      px(g, 8, 9, '#c08a12'); px(g, 7, 10, '#c08a12'); px(g, 8, 10, '#c08a12'); px(g, 9, 10, '#c08a12');
      break;
    case 'cadeado':
      rectPx(g, 3, 7, 10, 6, '#c9a06a');
      rectPx(g, 3, 7, 10, 1, '#e0c08a');
      rectPx(g, 5, 3, 1, 4, '#9a9a9a');
      rectPx(g, 10, 3, 1, 4, '#9a9a9a');
      rectPx(g, 5, 2, 6, 1, '#9a9a9a');
      rectPx(g, 7, 9, 2, 3, '#3b2416');
      break;
    case 'partilhar':
      rectPx(g, 3, 8, 10, 6, '#f7ead0');
      rectPx(g, 3, 8, 10, 1, '#fffdf5');
      rectPx(g, 7, 3, 2, 6, '#2f7fb0');
      triPx(g, 8, 0, 4, 4, 12, 4, '#2f7fb0');
      break;
    case 'tv':
      rectPx(g, 2, 3, 12, 8, '#3b2416');
      rectPx(g, 3, 4, 10, 6, '#8fd3f4');
      rectPx(g, 7, 11, 2, 2, '#3b2416');
      rectPx(g, 4, 13, 8, 1, '#3b2416');
      break;
    case 'estrela':
      triPx(g, 8, 1, 5, 8, 11, 8, '#ffe08a');
      triPx(g, 8, 15, 5, 8, 11, 8, '#ffe08a');
      triPx(g, 1, 8, 8, 5, 8, 11, '#ffe08a');
      triPx(g, 15, 8, 8, 5, 8, 11, '#ffe08a');
      rectPx(g, 7, 7, 2, 2, '#fff6c0');
      break;
    case 'abismo':
      elipsePx(g, 8, 8, 6.4, 6.4, '#0e7f8c');
      elipsePx(g, 8, 8, 4.8, 4.8, '#0b3a55');
      elipsePx(g, 8, 8, 3.2, 3.2, '#0e7f8c');
      elipsePx(g, 8, 8, 1.6, 1.6, '#0b3a55');
      px(g, 3, 3, '#7ff2e6'); px(g, 12, 2, '#7ff2e6'); px(g, 2, 12, '#7ff2e6');
      break;
    case 'perola':
      elipsePx(g, 8, 8, 5.6, 5.2, '#dffcff');
      elipsePx(g, 8, 8, 4.2, 3.8, '#b9f3f7');
      elipsePx(g, 8.5, 8.5, 2.4, 2.1, '#8fd3da');
      px(g, 5, 5, '#ffffff'); px(g, 6, 4, '#ffffff'); px(g, 4, 7, '#f2ffff');
      break;
    case 'reliquia':
      rectPx(g, 7, 3, 2, 9, '#d8c07a');
      rectPx(g, 4, 3, 2, 4, '#d8c07a');
      rectPx(g, 10, 3, 2, 4, '#d8c07a');
      rectPx(g, 4, 6, 8, 2, '#d8c07a');
      rectPx(g, 5, 4, 1, 2, '#fff0b0');
      triPx(g, 8, 14, 5, 11, 11, 11, '#b08a4a');
      break;
    case 'trofeu':
      rectPx(g, 4, 2, 8, 6, '#f2b632');
      elipsePx(g, 8, 8, 4.2, 3.2, '#f2b632');
      rectPx(g, 2, 3, 2, 3, '#c08a12');
      rectPx(g, 12, 3, 2, 3, '#c08a12');
      rectPx(g, 7, 10, 2, 3, '#c08a12');
      rectPx(g, 5, 13, 6, 2, '#8b5a2b');
      break;
    case 'presente':
      rectPx(g, 3, 6, 10, 8, '#c8453a');
      rectPx(g, 2, 4, 12, 3, '#e05a4a');
      rectPx(g, 7, 4, 2, 10, '#ffe08a');
      rectPx(g, 3, 8, 10, 1, '#ffb0a0');
      break;
    case 'ampulheta':
      rectPx(g, 3, 1, 10, 2, '#c9a06a');
      rectPx(g, 3, 13, 10, 2, '#c9a06a');
      triPx(g, 4, 3, 12, 3, 8, 8, '#cfeaf5');
      triPx(g, 4, 13, 12, 13, 8, 8, '#cfeaf5');
      triPx(g, 6, 5, 10, 5, 8, 8, '#f2b632');
      triPx(g, 6, 12, 10, 12, 8, 9, '#f2b632');
      px(g, 8, 8, '#f2b632');
      break;
    case 'reiniciar':
      for (let yy = 0; yy < 16; yy++) {
        for (let xx = 0; xx < 16; xx++) {
          const d = Math.sqrt((xx - 8) * (xx - 8) + (yy - 8) * (yy - 8));
          if (d >= 3.6 && d <= 5.6 && !(xx > 9 && yy < 8)) px(g, xx, yy, '#c9a06a');
        }
      }
      triPx(g, 10, 2, 14, 7, 8, 7, '#c9a06a');
      break;
    case 'peixe':
    default:
      elipsePx(g, 9, 8, 4.4, 3, '#6fb7d8');
      elipsePx(g, 9, 9.4, 3.2, 1.1, '#cfeaf5');
      triPx(g, 5, 8, 1, 5, 1, 11, '#4a90b8');
      px(g, 11, 7, '#ffffff'); px(g, 11, 8, '#ffffff'); px(g, 12, 7, '#111111');
      break;
  }
  contorno(g, O);
  return gridParaCanvas(g, escala);
}


/** Ícones 16x16 dos eventos do dia. */
function spriteEvento(id, escala) {
  const g = novoGrid(16, 16);
  switch (id) {
    case 'chuva':
      rectPx(g, 3, 4, 10, 4, '#e8f0ff');
      rectPx(g, 5, 2, 6, 2, '#e8f0ff');
      for (let x = 4; x <= 12; x += 4) linhaPx(g, x, 10, x - 1, 14, '#4db8ff');
      break;
    case 'nevoeiro':
      rectPx(g, 3, 3, 10, 4, '#e8f0ff');
      rectPx(g, 5, 1, 6, 2, '#e8f0ff');
      rectPx(g, 1, 9, 14, 2, '#cfe0ee');
      rectPx(g, 3, 13, 10, 2, '#cfe0ee');
      break;
    case 'lua':
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const fora = Math.pow((x - 8) / 5.6, 2) + Math.pow((y - 8) / 5.6, 2) <= 1;
          const dentro = Math.pow((x - 10.6) / 4.9, 2) + Math.pow((y - 6.6) / 4.9, 2) <= 1;
          if (fora && !dentro) px(g, x, y, '#ffe08a');
        }
      }
      break;
    case 'tubaroes':
      rectPx(g, 0, 12, 16, 2, '#2f7fb5');
      rectPx(g, 0, 15, 16, 1, '#1b5a86');
      triPx(g, 8, 4, 5, 11, 11, 11, '#5b7f9e');
      px(g, 4, 10, '#ffffff'); px(g, 12, 10, '#ffffff');
      break;
    case 'calmo':
      linhaPx(g, 3, 3, 8, 3, '#cfe6ff'); linhaPx(g, 8, 3, 3, 8, '#cfe6ff'); linhaPx(g, 3, 8, 8, 8, '#cfe6ff');
      linhaPx(g, 9, 9, 13, 9, '#9ec4e8'); linhaPx(g, 13, 9, 9, 13, '#9ec4e8'); linhaPx(g, 9, 13, 13, 13, '#9ec4e8');
      break;
    case 'mare':
      for (let i = 0; i < 3; i++) {
        for (let x = 1; x < 15; x++) {
          px(g, x, 4 + i * 4 + Math.round(Math.sin(x * 0.9 + i) * 1.2), '#cfe6ff');
        }
      }
      break;
    case 'dourado':
      elipsePx(g, 8, 8, 5.4, 5.4, '#f2b632');
      elipsePx(g, 8, 8, 3.7, 3.7, '#ffe08a');
      elipsePx(g, 8, 8, 1.4, 1.4, '#c08a12');
      break;
    case 'polvos':
    default:
      elipsePx(g, 8, 6, 4.6, 3.8, '#b06bff');
      rectPx(g, 5, 5, 2, 2, '#ffffff'); px(g, 6, 6, '#111111');
      rectPx(g, 9, 5, 2, 2, '#ffffff'); px(g, 10, 6, '#111111');
      for (let i = 0; i < 4; i++) {
        const bx = 4 + i * 3;
        for (let y = 9; y <= 14; y++) px(g, bx + Math.round(Math.sin((y + i) * 1.1)), y, '#8a4fd0');
      }
      break;
  }
  contorno(g, '#241608');
  return gridParaCanvas(g, escala);
}

/** Sprites maiores do cenário (morros, farol e pescador). */
function spriteCenario(nome, escala) {
  if (nome === 'morros') {
    const g = novoGrid(40, 12);
    for (let x = 0; x < 40; x++) {
      const h = 4 + Math.round(2.2 * Math.sin(x * 0.28));
      for (let y = 12 - h; y < 12; y++) px(g, x, y, '#2f6b7a');
    }
    for (let x = 0; x < 40; x++) {
      const h = 3 + Math.round(1.8 * Math.sin(x * 0.42 + 1.2));
      for (let y = 12 - h; y < 12; y++) px(g, x, y, '#1f4f5c');
    }
    return gridParaCanvas(g, escala);
  }
  if (nome === 'farol') {
    const g = novoGrid(12, 22);
    rectPx(g, 4, 4, 4, 16, '#f4f0e6');
    rectPx(g, 4, 7, 4, 2, '#c8453a');
    rectPx(g, 4, 12, 4, 2, '#c8453a');
    rectPx(g, 4, 17, 4, 2, '#c8453a');
    rectPx(g, 3, 3, 6, 2, '#3b2416');
    rectPx(g, 4, 1, 4, 2, '#ffd24a');
    rectPx(g, 2, 20, 8, 2, '#5c3a1c');
    contorno(g, '#241608');
    return gridParaCanvas(g, escala);
  }
  if (nome === 'personagem') {
    const g = novoGrid(14, 21);
    rectPx(g, 3, 2, 8, 2, '#c9a06a');   // chapéu
    rectPx(g, 2, 4, 10, 1, '#8b5a2b');
    rectPx(g, 4, 5, 6, 4, '#f0c9a0');   // cara
    px(g, 5, 6, '#241608'); px(g, 8, 6, '#241608');
    rectPx(g, 3, 9, 8, 6, '#3f7ab0');   // corpo
    rectPx(g, 3, 9, 8, 1, '#2f5f8f');
    rectPx(g, 1, 10, 2, 4, '#3f7ab0');  // braços
    rectPx(g, 11, 10, 2, 4, '#3f7ab0');
    rectPx(g, 4, 15, 3, 4, '#3b2416');  // pernas
    rectPx(g, 8, 15, 3, 4, '#3b2416');
    rectPx(g, 4, 19, 3, 2, '#241608');  // botas
    rectPx(g, 8, 19, 3, 2, '#241608');
    contorno(g, '#241608');
    return gridParaCanvas(g, escala);
  }
  if (nome === 'lua-noite') {
    const g = novoGrid(16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const fora = Math.pow((x - 8) / 5.6, 2) + Math.pow((y - 8) / 5.6, 2) <= 1;
        const dentro = Math.pow((x - 10.6) / 4.9, 2) + Math.pow((y - 6.6) / 4.9, 2) <= 1;
        if (fora && !dentro) px(g, x, y, '#e8f0ff');
      }
    }
    px(g, 8, 7, '#c8d8ea'); px(g, 7, 11, '#c8d8ea'); px(g, 9, 12, '#c8d8ea');
    contorno(g, '#2b3a55');
    return gridParaCanvas(g, escala);
  }
  if (nome === 'passaro') {
    const g = novoGrid(9, 5);
    linhaPx(g, 0, 1, 2, 0, '#2b3b4a');
    linhaPx(g, 2, 0, 4, 2, '#2b3b4a');
    linhaPx(g, 4, 2, 6, 0, '#2b3b4a');
    linhaPx(g, 6, 0, 8, 1, '#2b3b4a');
    return gridParaCanvas(g, escala);
  }
  if (nome === 'peixinho') {
    const g = novoGrid(12, 7);
    elipsePx(g, 6, 3.5, 4, 2.1, '#9ec4e8');
    triPx(g, 2, 3.5, 0, 1.5, 0, 5.5, '#6fa8cc');
    px(g, 9, 3, '#0b2242');
    contorno(g, '#123a55');
    return gridParaCanvas(g, escala);
  }
  return spriteIcone(nome, escala);
}

/**
 * Preenche todos os espaços [data-sprite] (uma única vez por elemento).
 */
function hidratarSprites(raiz) {
  const alvo = raiz || document;
  if (!alvo.querySelectorAll) return;
  const nos = alvo.querySelectorAll('[data-sprite]');
  for (let i = 0; i < nos.length; i++) {
    const el = nos[i];
    if (el.getAttribute('data-pronto') === '1') continue;
    const nome = el.getAttribute('data-sprite');
    let escala = 2;
    if (nome === 'sol' || nome === 'barco' || nome === 'cana') escala = 3;
    if (nome === 'morros') escala = 4;
    if (nome === 'farol' || nome === 'personagem') escala = 3;
    if (nome === 'lua-noite') escala = 3;
    if (nome === 'passaro' || nome === 'peixinho') escala = 2;
    const cv = spriteCenario(nome, escala);
    el.appendChild(cv);
    el.setAttribute('data-pronto', '1');
  }
}
