"use strict";

/* ==========================================================================
   Pesca Lendária — game.js
   Estado, persistência, regras, render e ciclo de pesca.
   Carregado depois de sprites.js.
   ========================================================================== */
/* ==========================================================================
   3) UTILITÁRIOS
   ========================================================================== */
const $ = (id) => document.getElementById(id);

/** Formata moedas com K, M, B, T — função única para todo o jogo. */
function fmt(n) {
  n = Math.floor(Number(n) || 0);
  const neg = n < 0;
  if (neg) n = -n;
  const UN = [['', 1], ['K', 1e3], ['M', 1e6], ['B', 1e9], ['T', 1e12], ['Qa', 1e15]];
  let i = 0;
  while (i < UN.length - 1 && n >= UN[i + 1][1]) i++;
  if (i === 0) return (neg ? '-' : '') + n;
  let v = n / UN[i][1];
  let s = v.toFixed(1);
  // Arredondamento pode "esticar" a unidade (ex.: 999999 → 1000,0) → sobe de unidade
  if (parseFloat(s) >= 1000 && i < UN.length - 1) {
    i++;
    v = n / UN[i][1];
    s = v.toFixed(1);
  }
  const sep = idiomaAtual() === 'en' ? '.' : ',';
  s = s.replace('.', sep);
  if (s.endsWith(sep + '0')) s = s.slice(0, -2);
  return (neg ? '-' : '') + s + UN[i][0];
}

function pad2(n) { return String(n).padStart(2, '0'); }
function rnd(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function pct(v) { return num(v * 100, 1) + '%'; }
function seg(ms) { return num(ms / 1000, 2) + 's'; }

/** Hash determinístico (FNV-1a) para o evento do dia ser igual para todos. */
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Chave local AAAA-MM-DD (hora local). */
function hojeKey() {
  const d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

/** Diferença em dias entre duas chaves AAAA-MM-DD. */
function diasEntre(a, b) {
  const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
  const ta = Date.UTC(pa[0], pa[1] - 1, pa[2]);
  const tb = Date.UTC(pb[0], pb[1] - 1, pb[2]);
  return Math.round((tb - ta) / 86400000);
}

/** Evento determinístico a partir da data. */
function eventoDaData(key) {
  return EVENTOS[hashStr('pesca:' + key) % EVENTOS.length];
}

function reduzMovimento() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ==========================================================================
   4) ESTADO + PERSISTÊNCIA (tudo em try/catch com valores por defeito)
   ========================================================================== */

/** Estado por defeito — usado se o localStorage falhar ou estiver corrompido. */
function estadoPorDefeito() {
  const k = hojeKey();
  return {
    moedas: 0,
    up: { rod:0, bait:0, boat:0, fisher:0, freezer:0 },
    descobertos: [],
    dataDia: k,             // data do dia de jogo atual
    tempo: CONFIG.DIA_SEGUNDOS,
    tempoTotal: CONFIG.DIA_SEGUNDOS,
    proximoRefill: Date.now() + CONFIG.INTERVALO_SESSAO_HORAS * 3600000,
    sessao: { moedas:0, peixes:0, melhor:null },
    evento: eventoDaData(k).id,
    eventoVisto: false,
    streak: 1,
    melhorStreak: 1,
    numeroDia: 1,           // nº do dia (para partilha)
    anuncios: 0,            // anúncios vistos hoje
    hoje: { moedas:0, peixes:0, melhor:null, missao:null, chefe:null },
    combo: 0,
    isca: 'comum',          // isco escolhido
    idioma: (function () {
      // ?lang=en ou ?lang=pt força o idioma (útil para partilhar no Reddit)
      try {
        const forcar = paramURL('lang');
        if (forcar === 'en' || forcar === 'pt') return forcar;
      } catch (e) {}
      try { return (navigator.language || 'pt').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'en'; }
      catch (e) { return 'pt'; }
    })(),
    estrelas: 0,            // estrelas de prestígio
    epoca: 1,
    abissoVisto: false,     // já viu o aviso de desbloqueio do Mar Profundo
    modo: 'superficie',     // 'superficie' | 'abisso' (pesca no Mar Profundo)
    som: true,
    ultimoVisto: Date.now(),
    novato: true            // primeiro dia: boost de raridades + upgrade grátis
  };
}

function carregar() {
  let s = null;
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (raw) s = JSON.parse(raw);
  } catch (e) { s = null; } // localStorage indisponível (modo privado, quota, JSON inválido)

  const d = estadoPorDefeito();
  if (!s || typeof s !== 'object') return d;

  // Merge defensivo: tudo que estiver em falta ou com tipo errado volta ao defeito
  const out = Object.assign({}, d, s);
  out.up = Object.assign({}, d.up, (s.up && typeof s.up === 'object') ? s.up : {});
  out.hoje = Object.assign({}, d.hoje, (s.hoje && typeof s.hoje === 'object') ? s.hoje : {});
  out.descobertos = Array.isArray(s.descobertos) ? s.descobertos.slice() : [];
  if (typeof out.moedas !== 'number' || !isFinite(out.moedas)) out.moedas = 0;
  if (typeof out.tempo !== 'number' || !isFinite(out.tempo)) out.tempo = CONFIG.DIA_SEGUNDOS;
  if (typeof out.tempoTotal !== 'number' || out.tempoTotal <= 0) out.tempoTotal = CONFIG.DIA_SEGUNDOS;
  if (typeof out.ultimoVisto !== 'number') out.ultimoVisto = Date.now();
  ['rod','bait','boat','fisher','freezer'].forEach(k => {
    out.up[k] = clamp(Math.floor(Number(out.up[k]) || 0), 0, CONFIG.UPGRADE_MAX);
  });
  if (!CONFIG.ISCAS[out.isca]) out.isca = 'comum';
  if (!out.abissoVisto) out.abissoVisto = false;
  if (out.idioma !== 'en' && out.idioma !== 'pt') out.idioma = d.idioma;
  out.estrelas = Math.max(0, Math.floor(Number(out.estrelas) || 0));
  out.epoca = Math.max(1, Math.floor(Number(out.epoca) || 1));
  if ((out.isca === 'abissal' || out.isca === 'reliquia') &&
      out.epoca < CONFIG.ABISMO_EPOCA) out.isca = 'comum';
  if (out.modo !== 'abisso' && out.modo !== 'superficie') out.modo = 'superficie';
  if (out.epoca < CONFIG.ABISMO_EPOCA) out.modo = 'superficie';
  if (!out.hoje.chefe || typeof out.hoje.chefe !== 'object') out.hoje.chefe = null;
  out.sessao = Object.assign({ moedas:0, peixes:0, melhor:null },
    (s.sessao && typeof s.sessao === 'object') ? s.sessao : {});
  if (!s.proximoRefill || typeof out.proximoRefill !== 'number' || !isFinite(out.proximoRefill)) {
    out.proximoRefill = Date.now() + CONFIG.INTERVALO_SESSAO_HORAS * 3600000;
    if (out.tempo <= 0) {
      out.tempo = CONFIG.DIA_SEGUNDOS;
      out.tempoTotal = CONFIG.DIA_SEGUNDOS;
    }
  }
  return out;
}

/** Grava o estado — nunca lança erro. */
function guardar() {
  try {
    state.ultimoVisto = Date.now();
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* silencioso: o jogo continua em memória */ }
}

let state = carregar();

/* --- Acesso ao idioma --- */
function idiomaAtual() {
  try { return state.idioma === 'en' ? 'en' : 'pt'; } catch (e) { return 'pt'; }
}
function t(chave) {
  const dic = TEXTOS[idiomaAtual()] || TEXTOS.pt;
  if (dic[chave] !== undefined) return dic[chave];
  return TEXTOS.pt[chave] !== undefined ? TEXTOS.pt[chave] : chave;
}
function tf(chave, dados) {
  let txt = t(chave);
  if (dados) {
    Object.keys(dados).forEach(function (k) {
      txt = txt.split('{' + k + '}').join(dados[k]);
    });
  }
  return txt;
}
function nomePeixe(p) { return (idiomaAtual() === 'en' && p.en) ? p.en : p.nome; }
function nomeEvento(ev) { return (idiomaAtual() === 'en' && ev.nomeEn) ? ev.nomeEn : ev.nome; }
function descEvento(ev) { return (idiomaAtual() === 'en' && ev.descEn) ? ev.descEn : ev.desc; }
function nomeUpgrade(u) { return (idiomaAtual() === 'en' && u.nomeEn) ? u.nomeEn : u.nome; }
function descUpgrade(u) { return (idiomaAtual() === 'en' && u.descEn) ? u.descEn : u.desc; }
function nomeRaridade(i) {
  const r = RARIDADES[i];
  return (idiomaAtual() === 'en' && r.en) ? r.en : r.nome;
}
function nomeMissao(tipo) {
  const m = CONFIG.MISSAO[tipo];
  if (!m) return tipo;
  return (idiomaAtual() === 'en' && m.nomeEn) ? m.nomeEn : m.nome;
}
function nomeIsca(id) {
  const mapa = {
    comum: 'iscaComum', rapida: 'iscaRapida', funda: 'iscaFunda',
    abissal: 'iscaAbissal', reliquia: 'iscaReliquia'
  };
  return t(mapa[id] || 'iscaComum');
}
function num(v, casas) {
  const txt = Number(v).toFixed(casas === undefined ? 1 : casas);
  return idiomaAtual() === 'en' ? txt : txt.replace('.', ',');
}

/* ==========================================================================
   5) LÓGICA DE DIA E EVENTO
   ========================================================================== */

function eventoAtual() {
  return EVENTOS.find(e => e.id === state.evento) || EVENTOS[0];
}

/** Trata a viragem de dia: streak, tempo, evento e estatísticas. */
function verificarNovoDia() {
  const k = hojeKey();
  if (k === state.dataDia) return false;

  const dif = state.dataDia ? diasEntre(state.dataDia, k) : 1;
  state.streak = (dif === 1) ? state.streak + 1 : 1; // falhou um dia → volta a 1
  state.melhorStreak = Math.max(state.melhorStreak, state.streak);

  state.dataDia = k;
  state.numeroDia += 1;
  state.evento = eventoDaData(k).id;
  state.eventoVisto = false;
  state.anuncios = 0;
  state.combo = 0;
  state.hoje = { moedas:0, peixes:0, melhor:null, missao: gerarMissao(k), chefe: gerarChefe(k) };
  state.novato = false; // boost do primeiro dia só no 1º dia
  bossAtual = false;

  cancelarPesca();
  fecharFimDia();
  esconderEvento();
  mostrarSeloEvento();
  atualizarChefeUI();
  // Mostra o novo evento do dia (cartão de 2s) passados instantes
  setTimeout(mostrarEvento, 300);
  return true;
}

/** Modificadores ativos (evento do dia + primeiro dia). */
/** Modificadores ativos (evento do dia + Isco + primeiro dia). */
/* Renova a sessão a cada INTERVALO_SESSAO_HORAS (12h por defeito). */
function verificarRefill() {
  const agora = Date.now();
  if (typeof state.proximoRefill !== 'number' || !isFinite(state.proximoRefill)) {
    state.proximoRefill = agora + CONFIG.INTERVALO_SESSAO_HORAS * 3600000;
    return false;
  }
  if (agora < state.proximoRefill) return false;

  state.tempo = CONFIG.DIA_SEGUNDOS;
  state.tempoTotal = CONFIG.DIA_SEGUNDOS;
  state.sessao = { moedas:0, peixes:0, melhor:null };
  state.combo = 0;
  while (state.proximoRefill <= agora) {
    state.proximoRefill += CONFIG.INTERVALO_SESSAO_HORAS * 3600000;
  }
  if (fase === 'ended') { fecharFimDia(); fase = 'idle'; }
  cancelarPesca();
  toast(t('novaSessao'));
  guardar();
  return true;
}

function mods() {
  const ev = eventoAtual();
  const fx = ev.fx || {};
  const isco = state.up.bait + (fx.iscoGratis || 0);

  // Multiplicador POR escalão de raridade (não cumulativo)
  const tier = [
    1,
    1 + isco * CONFIG.ISCO_UNC,
    1 + isco * CONFIG.ISCO_RARO,
    1 + isco * CONFIG.ISCO_EPICO,
    1 + isco * CONFIG.ISCO_LEND,
    1 + isco * CONFIG.ISCO_MIT,
    1 + isco * CONFIG.ISCO_ABISSO
  ];
  // Isca escolhida antes de lançar (congelada no início do lance)
  const isc = (iscaLance && CONFIG.ISCAS[iscaLance]) || iscaAtual();
  if (isc && isc.raro !== 1) for (let i = 1; i < tier.length; i++) tier[i] *= isc.raro;
  // Iscas abissais empurram a raridade do fundo (só depois de desbloqueado)
  if (isc && isc.abisso && modoAbismo()) tier[6] *= isc.abisso;

  // Primeiro dia: ajuda extra nas raridades altas
  if (state.novato) for (let i = 1; i < tier.length; i++) tier[i] *= CONFIG.PRIMEIRO_DIA_RARIDADE;
  // Eventos do dia
  if (fx.naoComum) for (let i = 1; i < tier.length; i++) tier[i] *= fx.naoComum;
  if (fx.raro) for (let i = 2; i < tier.length; i++) tier[i] *= fx.raro;
  if (fx.mitico) tier[5] *= fx.mitico;
  if (fx.abisso) tier[6] *= fx.abisso;
  // A raridade abissal só existe enquanto estás no Mar Profundo
  if (!modoAbismo()) tier[6] = 0;

  return {
    espera: fx.espera || 1,
    valor:  fx.valor || 1,
    grande: fx.grande || 1,
    tier:   tier,
    isco:   isco
  };
}

/** Sorteia o índice da raridade respeitando pesos + efeitos. */
function sortearRaridade(m) {
  const pesos = RARIDADES.map(function (r, i) {
    if (i === 6 && !modoAbismo()) return 0;
    const base = i === 6 ? CONFIG.ABISMO_PESO : r.peso;
    return base * m.tier[i];
  });
  const total = pesos.reduce(function (a, b) { return a + b; }, 0);
  let x = Math.random() * total;
  for (let i = 0; i < pesos.length; i++) {
    x -= pesos[i];
    if (x <= 0) return i;
  }
  return 0;
}

/** Moedas por minuto geradas pelos Pescadores Contratados. */
function taxaPescador() {
  const n = state.up.fisher || 0;
  return n * (1 + n * CONFIG.PESCADOR_ESCALA) * CONFIG.PESCADOR_MOEDAS_MIN;
}

/** Multiplicador do combo atual (1x a 2,2x). */
function multCombo() {
  return 1 + Math.min(state.combo || 0, CONFIG.COMBO_MAX) * CONFIG.COMBO_PASSO;
}

/** Duração da barra de timing: encurta à medida que o combo sobe. */
function duracaoBarra() {
  const f = 1 - (state.combo || 0) * CONFIG.BARRA_ACELERA_COMBO;
  return Math.max(CONFIG.BARRA_MIN_MS, CONFIG.BARRA_MS * f);
}

/** Prémio da missão: metade do custo médio do próximo nível. */
function premioMissao() {
  let soma = 0, n = 0;
  UPGRADES_DADOS.forEach(function (u) {
    const lvl = state.up[u.id] || 0;
    if (lvl < CONFIG.UPGRADE_MAX) { soma += custoUpgrade(u, lvl); n++; }
  });
  const media = n ? soma / n : 1000;
  return Math.max(150, Math.round(media * 0.5));
}

/** Missão do dia determinística a partir da data. */
function gerarMissao(key) {
  const tipos = Object.keys(CONFIG.MISSAO);
  const tipo = tipos[hashStr('missao:' + key) % tipos.length];
  return { tipo: tipo, alvo: CONFIG.MISSAO[tipo].alvo, prog: 0, ok: false, premio: premioMissao() };
}

/** Avança o progresso da missão e paga o prémio quando completa. */
function avancarMissao(tipo, qtd) {
  const m = state.hoje && state.hoje.missao;
  if (!m || m.ok || m.tipo !== tipo) return;
  m.prog += qtd;
  if (m.prog >= m.alvo) {
    m.ok = true;
    state.moedas += m.premio;
    state.hoje.moedas += m.premio;
    toast(tf('missaoConcluida', { v: fmt(m.premio) }));
    bip(880, .1);
    setTimeout(function () { bip(1180, .12); }, 110);
    atualizarHUD();
  }
}
/* ==========================================================================
   6) ÁUDIO (Web Audio API, bips simples) + FEEDBACK
   ========================================================================== */
let audioCtx = null;

function bip(freq, dur, tipo) {
  if (!state.som) return;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = tipo || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.1));
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + (dur || 0.1) + 0.02);
  } catch (e) { /* áudio bloqueado — ignorar */ }
}

function sonsDoResultado(tipo) {
  if (tipo === 'perfeito') { bip(880, .09); setTimeout(() => bip(1320, .12), 90); }
  else if (tipo === 'bom') bip(1046, .12, 'triangle');
  else if (tipo === 'falhou') bip(180, .25, 'sawtooth');
}

let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('on');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
}

function vibrar(padrao) {
  try { if (navigator.vibrate) navigator.vibrate(padrao); } catch (e) {}
}

/** Flash + partículas para Lendário e Mítico. */
function efeitoEspecial(rIdx) {
  if (rIdx < 4) return;
  vibrar([40, 60, 40, 60, 80]);
  const f = $('flashLayer');
  f.style.background = rIdx === 6
    ? 'radial-gradient(circle, rgba(46,230,214,.95), rgba(11,34,66,.6))'
    : (rIdx === 5
      ? 'radial-gradient(circle, rgba(255,77,109,.9), rgba(169,123,255,.5))'
      : 'radial-gradient(circle, rgba(255,201,60,.9), rgba(46,230,214,.4))');
  f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
  setTimeout(() => f.classList.remove('on'), 600);
  particulas(rIdx >= 6 ? 24 : 16);
}

function particulas(n) {
  if (reduzMovimento()) return;
  const box = $('catchBox');
  const cores = ['#f2b632', '#ffe08a', '#7cc23f', '#2ee6d6', '#f7ead0'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'part';
    s.style.background = cores[i % cores.length];
    s.style.left = (8 + Math.random() * 84) + '%';
    s.style.top = (25 + Math.random() * 55) + '%';
    s.style.setProperty('--dx', (Math.random() * 70 - 35) + 'px');
    s.style.animationDelay = (Math.random() * 0.35) + 's';
    box.appendChild(s);
    setTimeout(function () { try { s.remove(); } catch (e) {} }, 1400);
  }
}

/** Moeda a voar até ao contador. */
function vooMoeda(fromEl) {
  if (reduzMovimento()) return;
  try {
    const a = fromEl.getBoundingClientRect();
    const b = $('coinVal').getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'coin-fly';
    el.appendChild(spriteIcone('moeda', 2));
    el.style.left = (a.left + a.width / 2) + 'px';
    el.style.top = a.top + 'px';
    document.body.appendChild(el);
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    const dy = (b.top + b.height / 2) - a.top;
    requestAnimationFrame(function () {
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.3)';
      el.style.opacity = '0';
    });
    setTimeout(function () { try { el.remove(); } catch (e) {} }, 800);
  } catch (e) {}
}

/* ==========================================================================
   7) RENDER DO HUD, SEPARADORES E EVENTO
   ========================================================================== */
function atualizarHUD() {
  $('coinVal').textContent = fmt(state.moedas);
  const restante = Math.max(0, state.tempo);
  const timer = $('timer');
  timer.textContent = pad2(Math.floor(restante / 60)) + ':' + pad2(Math.floor(restante % 60));
  timer.classList.toggle('low', restante <= 30);
  const total = state.tempoTotal > 0 ? state.tempoTotal : CONFIG.DIA_SEGUNDOS;
  $('timeFill').style.width = clamp(restante / total * 100, 0, 100) + '%';

  const cb = $('comboBadge');
  $('comboTxt').textContent = '×' + num(multCombo(), 1);
  cb.classList.toggle('hot', (state.combo || 0) >= 3);

  const mb = $('missaoBadge');
  const mt = $('missaoTxt');
  const m = state.hoje && state.hoje.missao;
  if (!m) {
    mt.textContent = '—';
    mb.classList.remove('ok');
  } else if (m.ok) {
    mt.textContent = tf('missaoFeita', { v: fmt(m.premio) });
    mb.classList.add('ok');
  } else {
    mt.textContent = Math.min(m.prog, m.alvo) + '/' + m.alvo + ' ' + nomeMissao(m.tipo);
    mb.classList.remove('ok');
  }
}

function mostrarSeloEvento() {
  const ev = eventoAtual();
  const el = $('eventSeal');
  el.innerHTML = '';
  const ic = document.createElement('span');
  ic.className = 'spr-slot';
  ic.appendChild(spriteEvento(ev.id, 1));
  el.appendChild(ic);
  const txt = document.createElement('span');
  txt.textContent = nomeEvento(ev);
  el.appendChild(txt);
  const sea = $('sea');
  if (sea) sea.dataset.clima = ev.id;
}

let eventoTimer = null;
function mostrarEvento() {
  const ev = eventoAtual();
  const ic = $('evEmoji');
  ic.innerHTML = '';
  ic.appendChild(spriteEvento(ev.id, 2));
  $('evTitle').textContent = nomeEvento(ev);
  $('evDesc').textContent = descEvento(ev);
  $('eventCard').classList.remove('hidden');
  if (eventoTimer) clearTimeout(eventoTimer);
  eventoTimer = setTimeout(fecharEvento, 2000);
}
function fecharEvento() {
  if (eventoTimer) { clearTimeout(eventoTimer); eventoTimer = null; }
  esconderEvento();
  state.eventoVisto = true;
  guardar();
}
function esconderEvento() {
  if (eventoTimer) { clearTimeout(eventoTimer); eventoTimer = null; }
  $('eventCard').classList.add('hidden');
}

function mudarSeparador(nome) {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === nome));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + nome));
  if (nome === 'upgrades') renderUpgrades();
  if (nome === 'livro') renderLivro();
}

/* ==========================================================================
   8) UPGRADES
   ========================================================================== */
function custoUpgrade(u, nivel) {
  return Math.round(CONFIG.CUSTO_BASE[u.id] * Math.pow(CONFIG.CRESCIMENTO[u.id], nivel));
}

/** Efeito legível de um nível (para mostrar custo/efeito com clareza). */
function efeitoTexto(u, nivel) {
  switch (u.id) {
    case 'rod': {
      const ms = CONFIG.ESPERA_MAX_MS * (1 - CONFIG.ESPERA_REDUCAO_NIVEL * nivel);
      return tf('efeitoEspera', {
        v: seg(ms),
        z: pct(CONFIG.ZONA_BASE + CONFIG.ZONA_GANHO_NIVEL * nivel)
      });
    }
    case 'bait': {
      const txt = tf('efeitoRaros', {
        v: num(1 + nivel * CONFIG.ISCO_RARO, 2),
        m: num(1 + nivel * CONFIG.ISCO_MIT, 2)
      });
      return abissoAtivo()
        ? txt + ' · ' + tf('efeitoAbissal', { a: num(1 + nivel * CONFIG.ISCO_ABISSO, 2) })
        : txt;
    }
    case 'boat': return tf('efeitoValor', { v: num(1 + nivel * CONFIG.BARCO_VALOR_NIVEL, 2) });
    case 'fisher': return tf('efeitoMoedas', {
      v: Math.round(nivel * (1 + nivel * CONFIG.PESCADOR_ESCALA) * CONFIG.PESCADOR_MOEDAS_MIN)
    });
    case 'freezer': return tf('efeitoGeleira', { v: Math.round(nivel * CONFIG.GELEIRA_VALOR_NIVEL * 100) });
  }
  return '';
}

const SPRITE_UP = { rod:'cana', bait:'isco', boat:'barco', fisher:'pescador', freezer:'geleira' };

function renderUpgrades() {
  const wrap = $('upgradesList');
  wrap.innerHTML = '';
  UPGRADES_DADOS.forEach(function (u) {
    const lvl = state.up[u.id] || 0;
    const maxed = lvl >= CONFIG.UPGRADE_MAX;
    const custo = maxed ? 0 : custoUpgrade(u, lvl);
    const pode = !maxed && state.moedas >= custo;

    let pips = '';
    for (let i = 0; i < CONFIG.UPGRADE_MAX; i++) pips += '<span class="pip' + (i < lvl ? ' on' : '') + '"></span>';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<div class="up-head">' +
        '<span class="up-ico" data-sprite="' + SPRITE_UP[u.id] + '"></span>' +
        '<div><div class="up-name">' + nomeUpgrade(u) + '</div>' +
        '<div class="lvl">' + t('nivel') + ' ' + lvl + '/' + CONFIG.UPGRADE_MAX + '</div></div>' +
      '</div>' +
      '<div class="pips">' + pips + '</div>' +
      '<div class="up-desc">' + descUpgrade(u) + '</div>' +
      '<div class="up-eff">' + t('agoraLabel') + ' <b>' + efeitoTexto(u, lvl) + '</b></div>' +
      (maxed
        ? '<div class="up-eff muted">' + t('nivelMax') + '</div>'
        : '<div class="up-eff muted">' + t('proximoLabel') + ' <b>' + efeitoTexto(u, lvl + 1) + '</b></div>') +
      '<button class="btn buy' + (pode ? '' : ' off') + '" data-id="' + u.id + '"' + (pode ? '' : ' disabled') + '>' +
        (maxed ? t('maximo') : tf('comprarPor', { v: fmt(custo) })) +
      '</button>';
    wrap.appendChild(card);
  });
  hidratarSprites(wrap);
  renderEpoca();
  wrap.querySelectorAll('.buy').forEach(function (b) {
    b.addEventListener('click', function () { comprarUpgrade(b.dataset.id); });
  });
}

function comprarUpgrade(id) {
  const u = UPGRADES_DADOS.find(x => x.id === id);
  if (!u) return;
  const lvl = state.up[id] || 0;
  if (lvl >= CONFIG.UPGRADE_MAX) return;
  const custo = custoUpgrade(u, lvl);
  if (state.moedas < custo) { toast(t('moedasInsuficientes')); bip(200, .15, 'sawtooth'); return; }
  state.moedas -= custo;
  state.up[id] = lvl + 1;
  bip(760, .08); setTimeout(() => bip(1140, .1), 80);
  toast(tf('upgradeNivel', { n: nomeUpgrade(u), l: lvl + 1 }));
  guardar();
  renderUpgrades();
  atualizarHUD();
}
/* ==========================================================================
   9) LIVRO DE PESCA (coleção)
   ========================================================================== */
let livroVista = 'superficie';   // 'superficie' | 'abisso'

function peixesDaVista(vista) {
  return vista === 'abisso'
    ? PEIXES.filter(function (p) { return p.r === 6; })
    : PEIXES.filter(function (p) { return p.r < 6; });
}

function renderLivro() {
  const ab = abissoAtivo();
  if (livroVista === 'abisso' && !ab) livroVista = 'superficie';
  const vista = livroVista;
  const lista = peixesDaVista(vista);
  const achados = lista.filter(function (p) { return state.descobertos.indexOf(p.id) !== -1; }).length;

  $('bookCount').textContent = tf('livroContagem', { n: achados, t: lista.length });
  $('bookBonus').textContent = tf('livroBonus', { p: Math.round(bonusColecao() * 100) });
  $('bookHint').textContent = vista === 'abisso' ? t('livroDicaAbismo') : t('livroDica');

  const ts = $('bookTabSuperficie');
  const ta = $('bookTabAbismo');
  if (ts) {
    ts.textContent = t('livroSuperficie');
    ts.classList.toggle('active', vista === 'superficie');
    ts.classList.remove('locked');
  }
  if (ta) {
    ta.textContent = ab ? t('livroAbismo') : tf('livroAbismoBloqueado', { e: CONFIG.ABISMO_EPOCA });
    ta.classList.toggle('active', vista === 'abisso');
    ta.classList.toggle('locked', !ab);
  }

  const seals = $('bookSeals');
  seals.innerHTML = '';
  const indices = vista === 'abisso' ? [6] : [0, 1, 2, 3, 4, 5];
  indices.forEach(function (i) {
    const todos = PEIXES.filter(function (p) { return p.r === i; });
    if (!todos.length) return;
    const feitos = todos.filter(function (p) { return state.descobertos.indexOf(p.id) !== -1; }).length;
    const ok = feitos === todos.length;
    const b = document.createElement('span');
    b.className = 'seal-badge' + (ok ? '' : ' miss');
    b.appendChild(spriteIcone(ok ? 'medalha' : 'cadeado', 1));
    const bt = document.createElement('span');
    bt.textContent = ' ' + nomeRaridade(i) + ' ' + feitos + '/' + todos.length;
    b.appendChild(bt);
    seals.appendChild(b);
  });

  const grid = $('bookGrid');
  grid.innerHTML = '';
  lista.forEach(function (p) {
    const desc = state.descobertos.indexOf(p.id) !== -1;
    const r = RARIDADES[p.r];
    const cell = document.createElement('div');
    cell.className = 'fish-cell' + (desc ? '' : ' unknown') + (p.r === 6 ? ' abissal' : '');

    const ico = document.createElement('div');
    ico.className = 'fc-emoji';
    if (desc) ico.appendChild(spritePeixe(p, 2));
    else { ico.textContent = '?'; ico.style.fontSize = '26px'; ico.style.fontWeight = '900'; }

    const nome = document.createElement('div');
    nome.className = 'fc-name';
    nome.textContent = desc ? nomePeixe(p) : '???';

    const rar = document.createElement('div');
    rar.className = 'fc-rar';
    rar.style.color = desc ? r.cor : '#5a4a33';
    rar.textContent = desc ? nomeRaridade(p.r) : '—';

    cell.appendChild(ico);
    cell.appendChild(nome);
    cell.appendChild(rar);

    if (desc) {
      const val = document.createElement('div');
      val.className = 'fc-val';
      val.appendChild(spriteIcone('moeda', 1));
      val.appendChild(document.createTextNode(' ' + fmt(p.base * r.mult)));
      cell.appendChild(val);
    }
    grid.appendChild(cell);
  });
}

/* ==========================================================================
   10) CICLO DE PESCA
   fases: idle → waiting → bar → result → idle
   Tudo feito com tempo acumulado (dt), para pausar com o separador oculto.
   ========================================================================== */
let fase = 'idle';          // 'idle' | 'waiting' | 'bar' | 'result' | 'ended'
let esperaMs = 0, esperaAcc = 0;
let barAcc = 0, zonaPos = 0, zonaLarg = 0, barraAtual = CONFIG.BARRA_MS;
let resultAcc = 0;
let barVisivel = false;
let bossAtual = false;
let iscaLance = null;

function botaoLancar() {
  const b = $('castBtn');
  b.classList.remove('hot');
  if (fase === 'ended' || state.tempo <= 0) {
    b.disabled = true;
    b.innerHTML = '';
    const cv = spriteIcone('ampulheta', 2);
    cv.style.width = '30px';
    cv.style.height = '30px';
    b.appendChild(cv);
    const sp = document.createElement('span');
    sp.textContent = t('terminado');
    b.appendChild(sp);
    return;
  }
  b.disabled = false;
  if (fase === 'idle') b.textContent = t('lancar');
  else if (fase === 'waiting') b.textContent = t('esperar');
  else if (fase === 'bar') { b.textContent = t('agora'); b.classList.add('hot'); }
  else b.textContent = '…';
}

function setStatus(html) { $('status').innerHTML = html; }

function cancelarPesca() {
  fase = 'idle';
  barVisivel = false;
  $('timingBar').classList.add('hidden');
  $('catchBox').classList.add('hidden');
  $('catchBox').innerHTML = '';
  $('sea').classList.remove('pescando', 'mordeu');
  iscaLance = null;
  setStatus(t('statusPronto'));
  botaoLancar();
}

/** 1) Lançar a cana. */
function lancar() {
  if (fase !== 'idle') return;
  if (state.tempo <= 0) { abrirFimDia(); return; }
  iscaLance = state.isca;
  const m = mods();
  const isc = iscaAtual();
  const base = rnd(CONFIG.ESPERA_MIN_MS, CONFIG.ESPERA_MAX_MS);
  const comCana = base * (1 - CONFIG.ESPERA_REDUCAO_NIVEL * state.up.rod);
  esperaMs = clamp(comCana * m.espera * isc.espera, CONFIG.ESPERA_MIN_MS_ABS, 9000);
  esperaAcc = 0;
  bossAtual = chefePronto();
  fase = 'waiting';
  const rod = $('rod');
  rod.classList.remove('casting'); void rod.offsetWidth; rod.classList.add('casting');
  $('sea').classList.add('pescando');
  $('sea').classList.remove('mordeu');
  setStatus((bossAtual ? t('statusAproxima') : t('statusLancar')) +
    '<span class="dots"><span>.</span><span>.</span><span>.</span></span>');
  bip(430, .07, 'triangle');
  botaoLancar();
}

/** 2) O peixe morde: abre a barra de timing. */
function mordida() {
  fase = 'bar';
  barAcc = 0;
  const baseZona = CONFIG.ZONA_BASE + CONFIG.ZONA_GANHO_NIVEL * state.up.rod;
  zonaLarg = bossAtual ? CONFIG.CHEFE_ZONA : clamp(baseZona, 0.1, 0.85);
  zonaPos = rnd(0, 1 - zonaLarg);
  $('greenZone').style.left = (zonaPos * 100) + '%';
  $('greenZone').style.width = (zonaLarg * 100) + '%';
  $('marker').style.left = '0%';
  barraAtual = bossAtual
    ? Math.max(480, duracaoBarra() * CONFIG.CHEFE_BARRA)
    : duracaoBarra();
  $('timingBar').classList.remove('hidden');
  barVisivel = true;
  $('sea').classList.add('mordeu');
  setStatus(bossAtual
    ? '<span class="bite">' + t('statusChefeMordida') + '</span>'
    : '<span class="bite">' + t('statusMordida') + '</span>');
  bip(bossAtual ? 700 : 920, .12, 'square');
  botaoLancar();
}

/** 3) Resolução do toque (pos = posição 0..1 do marcador, null = tempo esgotado). */
function resolverBarra(pos) {
  if (fase !== 'bar') return;
  fase = 'result';
  resultAcc = 0;
  $('timingBar').classList.add('hidden');
  barVisivel = false;
  $('sea').classList.remove('pescando', 'mordeu');

  const eraChefe = bossAtual;
  bossAtual = false;

  let tipo = 'falhou';
  if (pos !== null && pos >= zonaPos && pos <= zonaPos + zonaLarg) {
    const centro = zonaPos + zonaLarg / 2;
    tipo = Math.abs(pos - centro) <= (zonaLarg * CONFIG.JANELA_PERFEITA) / 2 ? 'perfeito' : 'bom';
  }

  /* ---------- Confronto com o chefe do dia ---------- */
  if (eraChefe) {
    if (tipo === 'falhou') {
      state.combo = 0;
      if (state.hoje.chefe) state.hoje.chefe.prox = state.hoje.peixes + CONFIG.CHEFE_RETRY;
      sonsDoResultado('falhou');
      mostrarCaptura({ falhou: true, chefe: true });
      toast(t('chefeEscapou'));
      atualizarChefeUI();
    } else {
      const chefe = peixePorId(state.hoje.chefe.id) || PEIXES[0];
      const m = mods();
      const peso = rnd(CONFIG.PESO_MIN, CONFIG.PESO_MAX);
      const bonusChefe = state.hoje.chefe.abissal ? CONFIG.CHEFE_BONUS_ABISSO : CONFIG.CHEFE_BONUS;
      const valor = Math.round(calcValor(chefe, chefe.r, tipo === 'perfeito', m, peso) * bonusChefe);
      registarCaptura(chefe, chefe.r, tipo === 'perfeito', valor, peso);
      state.hoje.chefe.feito = true;
      if (tipo === 'perfeito') state.combo = (state.combo || 0) + 1;
      sonsDoResultado(tipo);
      mostrarCaptura({ peixe: chefe, rIdx: chefe.r, valor: valor, perfeito: tipo === 'perfeito', novo: false, peso: peso, chefe: true, abissal: !!state.hoje.chefe.abissal });
      efeitoEspecial(Math.max(4, chefe.r));
      toast(t(state.hoje.chefe.abissal ? 'chefeApanhadoAbismo' : 'chefeApanhado'));
      track('chefe', { raridade: chefe.r });
      atualizarChefeUI();
    }
    atualizarHUD();
    botaoLancar();
    guardar();
    return;
  }

  /* ---------- Captura normal ---------- */
  if (tipo === 'falhou') {
    state.combo = 0;
    sonsDoResultado('falhou');
    mostrarCaptura({ falhou: true });
    atualizarHUD();
    botaoLancar();
    return;
  }

  if (tipo === 'perfeito') state.combo = (state.combo || 0) + 1;

  const m = mods();
  const rIdx = sortearRaridade(m);
  const candidatos = PEIXES.filter(function (p) { return p.r === rIdx; });
  const peixe = candidatos[Math.floor(Math.random() * candidatos.length)];
  const perfeito = (tipo === 'perfeito');
  const peso = rnd(CONFIG.PESO_MIN, CONFIG.PESO_MAX);
  const valor = calcValor(peixe, rIdx, perfeito, m, peso);

  const novo = registarCaptura(peixe, rIdx, perfeito, valor, peso);
  track('captura', { raridade: rIdx, perfeito: perfeito });

  sonsDoResultado(tipo);
  mostrarCaptura({ peixe: peixe, rIdx: rIdx, valor: valor, perfeito: perfeito, novo: novo, peso: peso });
  if (rIdx >= 4) efeitoEspecial(rIdx);
  atualizarHUD();
  atualizarChefeUI();
  botaoLancar();
  guardar();
  if (novo) renderLivro();
}

/** Valor final do peixe (raridade + barco + geleira + eventos + perfeito). */
function calcValor(peixe, rIdx, perfeito, m, peso) {
  let v = peixe.base * RARIDADES[rIdx].mult;
  v *= (1 + state.up.boat * CONFIG.BARCO_VALOR_NIVEL);
  if (rIdx >= 2) v *= (1 + state.up.freezer * CONFIG.GELEIRA_VALOR_NIVEL);
  v *= m.valor;
  if (rIdx >= 2) v *= m.grande;        // "peixes grandes" = Raro ou superior
  v *= (peso || 1);                    // peso aleatório do exemplar
  v *= multCombo();                    // bónus de combo
  v *= ((iscaLance && CONFIG.ISCAS[iscaLance]) || iscaAtual()).valor; // isco do lance
  v *= (1 + bonusColecao());           // bónus do Livro de Pesca
  v *= bonusEstrelas();                // bónus das estrelas de prestígio
  if (perfeito) v *= CONFIG.BONUS_PERFEITO;
  return Math.max(1, Math.round(v));
}

/** Ecrã rápido do resultado (captura ou fuga). */
function mostrarCaptura(res) {
  const box = $('catchBox');
  box.innerHTML = '';

  if (res.falhou) {
    const ico = document.createElement('div');
    ico.className = 'catch-fail';
    ico.appendChild(spriteIcone('cana', 3));
    box.appendChild(ico);
    const titulo = document.createElement('div');
    titulo.className = 'catch-name';
    titulo.textContent = res.chefe ? t('chefeTituloCatch') : t('escapou');
    box.appendChild(titulo);
    const sub = document.createElement('div');
    sub.className = 'catch-rar';
    sub.style.color = '#7a6248';
    sub.textContent = res.chefe ? t('tentaOutraBreve') : t('tentaOutra');
    box.appendChild(sub);
    box.classList.remove('hidden');
    return;
  }

  const r = RARIDADES[res.rIdx];
  const p = res.peixe;

  const sprite = document.createElement('div');
  sprite.className = 'catch-fish';
  sprite.appendChild(spritePeixe(p, 4));
  box.appendChild(sprite);

  if (res.chefe) {
    const f = document.createElement('div');
    f.className = 'catch-flag';
    f.style.background = res.abissal ? 'var(--r6)' : 'var(--purple)';
    f.textContent = t(res.abissal ? 'chefeFlagAbismo' : 'chefeFlag');
    box.appendChild(f);
  } else if (p.r === 6) {
    const f = document.createElement('div');
    f.className = 'catch-flag';
    f.style.background = 'var(--r6)';
    f.textContent = t('abissoFlag') + (res.novo ? ' · ' + t('novo') : '');
    box.appendChild(f);
  } else if (res.novo) {
    const f = document.createElement('div');
    f.className = 'catch-flag';
    f.textContent = t('novo');
    box.appendChild(f);
  }

  const nome = document.createElement('div');
  nome.className = 'catch-name';
  nome.textContent = nomePeixe(p);
  box.appendChild(nome);

  const rar = document.createElement('div');
  rar.className = 'catch-rar';
  rar.style.color = r.cor;
  rar.textContent = nomeRaridade(res.rIdx);
  box.appendChild(rar);

  const info = document.createElement('div');
  info.className = 'catch-rar';
  info.style.color = '#7a6248';
  info.textContent = num(res.peso || 1, 2) + ' kg' +
    (res.perfeito ? ' · ' + t('perfeito') : '') +
    (res.chefe ? ' · ' + t(res.abissal ? 'bonusChefeAbismo' : 'bonusChefe') : '');
  box.appendChild(info);

  const val = document.createElement('div');
  val.className = 'catch-val';
  val.textContent = '+' + fmt(res.valor);
  box.appendChild(val);

  box.classList.remove('hidden');
  vooMoeda(sprite);
}

function esconderCaptura() {
  $('catchBox').classList.add('hidden');
  $('catchBox').innerHTML = '';
  if (fase === 'result') fase = 'idle';
  setStatus('Gira a cana e lança!');
  botaoLancar();
}

/* ==========================================================================
   10.b) NOVOS SISTEMAS: coleção, iscas, chefe do dia e prestígio
   ========================================================================== */

function peixePorId(id) {
  return PEIXES.find(function (p) { return p.id === id; }) || null;
}

/* --- Livro de Pesca: bónus por raridade completa --- */
function raridadesCompletas() {
  let n = 0;
  for (let i = 0; i < RARIDADES.length; i++) {
    const todos = PEIXES.filter(function (p) { return p.r === i; });
    if (todos.length && todos.every(function (p) { return state.descobertos.indexOf(p.id) !== -1; })) n++;
  }
  return n;
}
function bonusColecao() {
  return raridadesCompletas() * CONFIG.COLECAO_BONUS;
}

/* --- Prestígio --- */
function bonusEstrelas() {
  return 1 + (state.estrelas || 0) * CONFIG.EPOCA_ESTRELA;
}
/** O Mar Profundo abre a partir da época configurada (por defeito, 3). */
function abissoAtivo() {
  return (state.epoca || 1) >= CONFIG.ABISMO_EPOCA;
}
/** O jogador está efetivamente a pescar no Mar Profundo. */
function modoAbismo() {
  return abissoAtivo() && state.modo === 'abisso';
}
/** Aviso único quando o Mar Profundo fica disponível. */
function verificarAbismo() {
  if (!abissoAtivo() || state.abissoVisto) return false;
  state.abissoVisto = true;
  toast(t('abissoDesbloqueado'));
  livroVista = 'abisso';
  bip(660, .1);
  setTimeout(function () { bip(990, .12); }, 100);
  setTimeout(function () { bip(1320, .16); }, 210);
  track('abisso', {});
  renderIscas();
  renderModo();
  renderLivro();
  guardar();
  return true;
}
function totalNiveis() {
  let n = 0;
  ['rod','bait','boat','fisher','freezer'].forEach(function (k) { n += state.up[k] || 0; });
  return n;
}
function renderEpoca() {
  const niveis = totalNiveis();
  const est = state.estrelas || 0;
  $('epocaInfo').textContent = t('epocaLabel') + ' ' + state.epoca + ' · ' + est + ' ' +
    (est === 1 ? t('estrela') : t('estrelas')) +
    ' (+' + Math.round(est * CONFIG.EPOCA_ESTRELA * 100) + t('valorSufixo') + ')';
  const falta = Math.max(0, CONFIG.EPOCA_NIVEIS - niveis);
  const ganhas = Math.max(1, Math.floor(niveis / CONFIG.EPOCA_POR_NIVEL));
  $('epocaProg').innerHTML = '<b>' + (falta > 0
    ? tf('epocaProg', { n: niveis, f: falta })
    : tf('epocaPronto', { g: ganhas })) + '</b>';
  const b = $('btnEpoca');
  b.disabled = falta > 0;
  b.textContent = t(falta > 0 ? 'prestigiar' : 'prestigiarAgora');
}
function prestigiar() {
  const niveis = totalNiveis();
  if (niveis < CONFIG.EPOCA_NIVEIS) { toast(t('semNiveis')); return; }
  const ganhas = Math.max(1, Math.floor(niveis / CONFIG.EPOCA_POR_NIVEL));
  const pctBonus = Math.round(ganhas * CONFIG.EPOCA_ESTRELA * 100);
  if (!confirm(tf('confirmarPrestigio', { g: ganhas, p: pctBonus }))) return;

  state.estrelas = (state.estrelas || 0) + ganhas;
  state.epoca = (state.epoca || 1) + 1;
  state.up = { rod: 0, bait: 0, boat: 0, fisher: 0, freezer: 0 };
  state.moedas = 1000 * ganhas;
  state.combo = 0;
  state.isca = 'comum';

  bip(660, .1);
  setTimeout(function () { bip(990, .12); }, 100);
  setTimeout(function () { bip(1320, .16); }, 210);
  toast(tf('novaEpoca', { g: ganhas }));
  track('prestigio', { estrelas: ganhas });
  setTimeout(verificarAbismo, 2400);
  guardar();
  renderUpgrades();
  renderIscas();
  renderModo();
  atualizarHUD();
}

/* --- Iscas --- */
function iscaAtual() {
  return CONFIG.ISCAS[state.isca] || CONFIG.ISCAS.comum;
}
function renderIscas() {
  const nos = document.querySelectorAll('.isca');
  for (let i = 0; i < nos.length; i++) {
    const id = nos[i].dataset.isca;
    const bloqueada = (id === 'abissal' || id === 'reliquia') && !abissoAtivo();
    nos[i].classList.toggle('hidden', bloqueada);
    nos[i].classList.toggle('ativa', id === state.isca);
  }
}
function escolherIsca(id) {
  if (!CONFIG.ISCAS[id] || state.isca === id) return;
  if ((id === 'abissal' || id === 'reliquia') && !abissoAtivo()) {
    toast(tf('abissoBloqueado', { e: CONFIG.ABISMO_EPOCA }));
    return;
  }
  // Escolher uma isca abissal leva-te automaticamente ao fundo.
  if ((id === 'abissal' || id === 'reliquia') && !modoAbismo()) {
    if (fase === 'waiting' || fase === 'bar') { toast(t('modoOcupado')); return; }
    aplicarModo('abisso', false);
  }
  state.isca = id;
  renderIscas();
  guardar();
  toast(tf('iscaSelecionada', { n: nomeIsca(id) }));
  bip(620, .06);
}

/* --- Modo de pesca: Superfície / Mar Profundo --- */
function renderModo() {
  const bar = $('modoSwitch');
  if (!bar) return;
  bar.classList.toggle('hidden', !abissoAtivo());
  const ab = modoAbismo();
  const s = $('modoTabSuperficie');
  const a = $('modoTabAbismo');
  if (s) s.classList.toggle('active', !ab);
  if (a) a.classList.toggle('active', ab);
  if (document.body) document.body.setAttribute('data-modo', ab ? 'abisso' : 'superficie');
  const sea = $('sea');
  if (sea) sea.setAttribute('data-fundo', ab ? 'abisso' : 'superficie');
  aplicarHora();
}

function aplicarModo(m, aviso) {
  if (m !== 'abisso' && m !== 'superficie') return false;
  if (m === 'abisso' && !abissoAtivo()) {
    toast(tf('abissoBloqueado', { e: CONFIG.ABISMO_EPOCA }));
    return false;
  }
  if (fase === 'waiting' || fase === 'bar') { toast(t('modoOcupado')); return false; }
  if (state.modo === m) return true;
  state.modo = m;
  // Ao voltar à superfície, iscas abissais deixam de fazer sentido.
  if (m === 'superficie' && (state.isca === 'abissal' || state.isca === 'reliquia')) {
    state.isca = 'comum';
    renderIscas();
  }
  renderModo();
  const sea = $('sea');
  if (sea) {
    sea.classList.remove('a-descer');
    void sea.offsetWidth;
    sea.classList.add('a-descer');
    setTimeout(function () { sea.classList.remove('a-descer'); }, 800);
  }
  if (aviso) {
    toast(t(m === 'abisso' ? 'modoAbismoOn' : 'modoSuperficieOn'));
    bip(m === 'abisso' ? 420 : 720, .08);
  }
  guardar();
  return true;
}
function escolherModo(m) { aplicarModo(m, true); }

/* --- Analytics: visitas, origem e eventos --- */
let origemVisita = 'direto';

function paramURL(nome) {
  try {
    const busca = (window.location.search || '').replace(/^\?/, '');
    const partes = busca.split('&');
    for (let i = 0; i < partes.length; i++) {
      const par = partes[i].split('=');
      if (decodeURIComponent(par[0]) === nome) return decodeURIComponent(par[1] || '');
    }
  } catch (e) {}
  return null;
}

function lerOrigem() {
  try {
    const ref = paramURL('ref') || paramURL('utm_source') || paramURL('utm_campaign');
    if (ref) origemVisita = String(ref).slice(0, 40);
    else if (document.referrer) {
      origemVisita = document.referrer.replace(/^https?:\/\//, '').split('/')[0] || 'referrer';
    }
  } catch (e) { /* sem location (ex.: testes) */ }
  return origemVisita;
}

function gcContar(obj, tentativa) {
  tentativa = tentativa || 0;
  if (window.goatcounter && window.goatcounter.count) {
    try { window.goatcounter.count(obj); } catch (e) {}
    return;
  }
  if (tentativa < 12) setTimeout(function () { gcContar(obj, tentativa + 1); }, 300);
}

function iniciarAnalytics() {
  lerOrigem();
  if (!ANALYTICS.ativo) return;

  if (ANALYTICS.provedor === 'goatcounter' && ANALYTICS.goatcounter.indexOf('SEUCODIGO') === -1) {
    const sc = document.createElement('script');
    sc.async = true;
    sc.src = ANALYTICS.script || 'https://gc.zgo.at/count.js';
    sc.setAttribute('data-goatcounter', ANALYTICS.goatcounter);
    // fallback: se o proxy falhar, usa o GoatCounter diretamente
    sc.onerror = function () {
      try {
        const fb = document.createElement('script');
        fb.async = true;
        fb.src = 'https://gc.zgo.at/count.js';
        fb.setAttribute('data-goatcounter', 'https://pescalendaria.goatcounter.com/count');
        if (document.head) document.head.appendChild(fb);
      } catch (e) {}
    };
    if (document.head) document.head.appendChild(sc);
    // regista a origem como evento, para saberes de que subreddit veio
    gcContar({ path: 'origem/' + origemVisita, title: 'Origem: ' + origemVisita, event: true });
  } else if (ANALYTICS.provedor === 'ga4' && ANALYTICS.ga4.indexOf('XXXXXXXX') === -1) {
    const sc = document.createElement('script');
    sc.async = true;
    sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + ANALYTICS.ga4;
    if (document.head) document.head.appendChild(sc);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS.ga4);
    window.gtag('event', 'origem_visita', { origem: origemVisita });
  }

  // Vercel Web Analytics (first-party). Ligar no painel antes de ativar a flag.
  if (ANALYTICS.vercelAtivo) {
    try {
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
      const va = document.createElement('script');
      va.defer = true;
      va.src = '/_vercel/insights/script.js';
      if (document.head) document.head.appendChild(va);
    } catch (e) {}
  }

  // botão "Ver estatísticas": só para o dono (abre o site com ?dono)
  const ehDono = paramURL('dono') !== null;
  const b = $('btnStats');
  if (b && ehDono && ANALYTICS.painel && ANALYTICS.painel.indexOf('SEUCODIGO') === -1) {
    b.href = ANALYTICS.painel;
    b.classList.remove('hidden');
  }
}

function track(nome, dados) {
  if (!ANALYTICS.ativo) return;
  if (ANALYTICS.provedor === 'goatcounter') {
    gcContar({ path: 'jogo/' + nome, title: nome, event: true });
  } else if (ANALYTICS.provedor === 'ga4' && typeof window.gtag === 'function') {
    window.gtag('event', nome, dados || {});
  }
}

/* --- Hora do dia: muda o céu conforme a hora real --- */
function aplicarHora() {
  try {
    const h = new Date().getHours();
    const modo = (h >= 20 || h < 6) ? 'noite' : (h >= 18 ? 'tarde' : 'dia');
    if (document.body) document.body.setAttribute('data-hora', modo);
    const meta = document.querySelector ? document.querySelector('meta[name="theme-color"]') : null;
    if (meta) meta.setAttribute('content', modoAbismo() ? '#020a14' : (modo === 'noite' ? '#0a1730' : '#3b2416'));
  } catch (e) {}
}

/* --- Chefe do dia --- */
function gerarChefe(key) {
  // De vez em quando (1 em CHEFE_ABISMO_DIAS) o chefe vem do Mar Profundo.
  const abissal = abissoAtivo() &&
    (hashStr('chefe-abismo:' + key) % Math.max(2, CONFIG.CHEFE_ABISMO_DIAS) === 0);
  const lista = PEIXES.filter(function (p) { return abissal ? p.r === 6 : (p.r >= 3 && p.r < 6); });
  const p = lista[hashStr('chefe:' + key) % lista.length];
  return { id: p.id, feito: false, prox: CONFIG.CHEFE_APOS, abissal: abissal };
}
function chefePronto() {
  const c = state.hoje && state.hoje.chefe;
  if (!c || c.feito) return false;
  return state.hoje.peixes >= (c.prox || CONFIG.CHEFE_APOS);
}
function atualizarChefeUI() {
  const c = state.hoje && state.hoje.chefe;
  const bar = $('chefeBar');
  if (!c) { bar.classList.add('hidden'); return; }
  bar.classList.remove('hidden');
  const peixe = peixePorId(c.id) || PEIXES[0];
  const ico = $('chefeIco');
  if (ico.getAttribute('data-bicho') !== c.id) {
    ico.innerHTML = '';
    ico.appendChild(spritePeixe(peixe, 2));
    ico.setAttribute('data-bicho', c.id);
  }
  $('chefeNome').textContent = nomePeixe(peixe) + (c.abissal ? ' · ' + t('livroAbismo') : '');
  const est = $('chefeEstado');
  if (c.feito) {
    bar.classList.add('done');
    est.textContent = t('chefeApanhadoHoje');
  } else {
    bar.classList.remove('done');
    const falta = Math.max(0, (c.prox || CONFIG.CHEFE_APOS) - state.hoje.peixes);
    est.textContent = falta > 0
      ? (falta === 1
          ? tf(c.abissal ? 'chefeAparece1Abismo' : 'chefeAparece1', {})
          : tf(c.abissal ? 'chefeApareceNAbismo' : 'chefeApareceN', { n: falta }))
      : t(c.abissal ? 'chefeAVistaAbismo' : 'chefeAVista');
  }
}

/* --- Botão de som --- */
function atualizarBotaoSom() {
  const b = $('btnSom');
  b.innerHTML = '';
  b.appendChild(spriteIcone(state.som ? 'som' : 'som_off', 2));
  b.title = t('som');
  b.setAttribute('aria-label', t('som'));
}

/* --- Registo de uma captura (normal ou chefe) --- */
function registarCaptura(peixe, rIdx, perfeito, valor, peso) {
  state.moedas += valor;
  state.hoje.moedas += valor;
  state.hoje.peixes += 1;
  state.sessao.moedas += valor;
  state.sessao.peixes += 1;

  const novo = state.descobertos.indexOf(peixe.id) === -1;
  const antes = raridadesCompletas();
  if (novo) state.descobertos.push(peixe.id);
  const depois = raridadesCompletas();
  if (depois > antes) {
    toast(tf('raridadeCompleta', { p: Math.round(CONFIG.COLECAO_BONUS * 100) }));
    bip(760, .1);
  }

  if (!state.hoje.melhor || valor >= state.hoje.melhor.valor) {
    state.hoje.melhor = {
      nome: peixe.nome, emoji: peixe.emoji, id: peixe.id,
      r: rIdx, valor: valor, perfeito: perfeito, peso: peso
    };
  }
  if (!state.sessao.melhor || valor >= state.sessao.melhor.valor) {
    state.sessao.melhor = {
      nome: peixe.nome, emoji: peixe.emoji, id: peixe.id,
      r: rIdx, valor: valor, perfeito: perfeito, peso: peso
    };
  }

  avancarMissao('peixes', 1);
  if (rIdx >= 2) avancarMissao('raros', 1);
  if (perfeito) avancarMissao('perfeitos', 1);
  return novo;
}

/* ==========================================================================
   11) LOOP PRINCIPAL (relógio só desconta com o separador visível)
   ========================================================================== */
let ultimoAgora = Date.now();
let adPausado = false;
let ultimaHoraChk = 0;
let guardaAcc = 0;

function loop() {
  const agora = Date.now();
  let dt = agora - ultimoAgora;
  ultimoAgora = agora;

  // Page Visibility API: com o separador oculto não se desconta tempo nem se avança
  if (document.hidden || adPausado) return;
  if (dt > 2000) dt = 2000; // após throttling do navegador, limita o salto
  if (dt < 0) dt = 0;

  verificarNovoDia();
  verificarRefill();

  if (agora - ultimaHoraChk > 60000) {
    ultimaHoraChk = agora;
    aplicarHora();
  }

  /* Relógio dos 180s */
  if (state.tempo > 0 && fase !== 'ended') {
    state.tempo -= dt / 1000;
    if (state.tempo <= 0) {
      state.tempo = 0;
      encerrarDia();
    }
  }

  /* Rendimento passivo em tempo real (Pescador Contratado) */
  const taxa = taxaPescador();
  if (taxa > 0) {
    state.moedas += taxa * (dt / 60000);
  }

  /* Máquinas de estados da pesca */
  if (fase === 'waiting') {
    esperaAcc += dt;
    if (esperaAcc >= esperaMs) mordida();
  } else if (fase === 'bar') {
    barAcc += dt;
    if (barAcc >= barraAtual) {
      resolverBarra(null); // não tocou a tempo → escapa
    } else if (barVisivel) {
      $('marker').style.left = (barAcc / barraAtual * 100) + '%';
    }
  } else if (fase === 'result') {
    resultAcc += dt;
    if (resultAcc >= CONFIG.MOSTRA_CAPTURA_MS) esconderCaptura();
  }

  atualizarHUD();

  /* Guardagem automática periódica */
  guardaAcc += dt;
  if (guardaAcc >= CONFIG.SAVE_INTERVAL) {
    guardaAcc = 0;
    guardar();
    renderUpgradesSeVisivel();
  }
}

function renderUpgradesSeVisivel() {
  if ($('panel-upgrades').classList.contains('active')) renderUpgrades();
}

/* ==========================================================================
   12) FIM DO DIA
   ========================================================================== */
let contadorFim = null;

function encerrarDia() {
  cancelarPesca();   // limpa a UI da pesca (fica em 'idle')
  fase = 'ended';    // trava novos lançamentos
  abrirFimDia();
  guardar();
  // Intersticial opcional (só quando publicado no portal)
  if (ADS.modo === 'gamedistribution' && ADS.intersticialFimDia) {
    try { if (window.gdsdk && window.gdsdk.showAd) window.gdsdk.showAd(); } catch (e) {}
  }
}

function abrirFimDia() {
  $('fimMoedas').textContent = fmt(state.sessao.moedas);
  $('fimPeixes').textContent = String(state.sessao.peixes);

  const m = state.sessao.melhor;
  const fb = $('fimMelhor');
  fb.innerHTML = '';
  if (m) {
    const peixe = peixePorId(m.id) || PEIXES[0];
    const big = document.createElement('div');
    big.className = 'big';
    big.appendChild(spritePeixe(peixe, 3));
    fb.appendChild(big);
    const txt = document.createElement('div');
    txt.innerHTML = t('melhorLabel') + ' <b style="color:' + RARIDADES[m.r].cor + '">' + nomePeixe(peixe) + '</b> (' +
      nomeRaridade(m.r) + ')<br>' + fmt(m.valor) + ' ' + t('moedasUnit') +
      (m.peso ? ' · ' + num(m.peso, 2) + ' kg' : '') +
      (m.perfeito ? ' · ' + t('perfeitoMin') : '');
    fb.appendChild(txt);
  } else {
    const big = document.createElement('div');
    big.className = 'big';
    big.appendChild(spriteIcone('cana', 3));
    fb.appendChild(big);
    fb.appendChild(document.createTextNode(t('nenhumaCaptura')));
  }

  const c = state.hoje.chefe;
  const fc = $('fimChefe');
  if (c && c.feito) {
    fc.textContent = t('chefeFimOk');
    fc.style.display = '';
  } else if (c) {
    const p = peixePorId(c.id);
    fc.textContent = tf('chefeFimEscapou', { n: p ? nomePeixe(p) : '?' });
    fc.style.display = '';
  } else {
    fc.style.display = 'none';
  }

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const kAmanha = amanha.getFullYear() + '-' + pad2(amanha.getMonth() + 1) + '-' + pad2(amanha.getDate());
  const evAmanha = eventoDaData(kAmanha);
  const icoA = $('amanhaIco');
  icoA.innerHTML = '';
  icoA.appendChild(spriteEvento(evAmanha.id, 2));
  $('amanhaTxt').textContent = nomeEvento(evAmanha) + ' — ' + descEvento(evAmanha);

  $('fimStreak').textContent = String(state.streak);
  $('fimBestStreak').textContent = String(state.melhorStreak);
  $('btnAnuncio').style.display = state.anuncios < CONFIG.ANUNCIO_MAX_DIA ? '' : 'none';
  $('fimModal').classList.remove('hidden');
  preencherSlotFim();
  atualizarProximoDia();
  if (contadorFim) clearInterval(contadorFim);
  contadorFim = setInterval(atualizarProximoDia, 1000);
  botaoLancar();
}

function fecharFimDia() {
  $('fimModal').classList.add('hidden');
  if (contadorFim) { clearInterval(contadorFim); contadorFim = null; }
}

/** Contador "Próxima sessão em HH:MM:SS" (12h). */
function atualizarProximoDia() {
  const alvo = (typeof state.proximoRefill === 'number') ? state.proximoRefill : Date.now();
  const s = Math.max(0, Math.floor((alvo - Date.now()) / 1000));
  $('nextDay').textContent = pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor(s / 60) % 60) + ':' + pad2(s % 60);
}

/** Texto de partilha SEM spoilers (só o emoji da raridade). */
function textoPartilha() {
  const ev = eventoAtual();
  const m = state.sessao.melhor;
  const rarEmoji = m ? RARIDADES[m.r].emoji : '⚪';
  return tf('partilhaTitulo', { n: state.numeroDia }) + '\n' +
    ev.emoji + ' ' + nomeEvento(ev) + '\n' +
    tf('partilhaPeixes', { p: state.sessao.peixes, m: fmt(state.sessao.moedas) }) + '\n' +
    tf('partilhaMelhor', { r: rarEmoji }) + '\n' +
    tf('partilhaStreak', { s: state.streak });
}

async function partilhar() {
  const txt = textoPartilha();
  track('partilha');
  // 1) API nativa de partilha quando existe (mobile)
  if (navigator.share) {
    try { await navigator.share({ title: 'Pesca Lendária', text: txt }); return; }
    catch (e) { /* cancelado pelo utilizador */ return; }
  }
  // 2) fallback: área de transferência
  try {
    await navigator.clipboard.writeText(txt);
    toast(t('copiado'));
    return;
  } catch (e) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toast(t('copiado'));
  } catch (e) { toast(t('naoCopiado')); }
}

/** Anúncio recompensado — SIMULADO.
 *  LIGAR SDK REAL MAIS TARDE: substituir o corpo desta função por
 *  rewardedAd.show() e chamar concederTempo() apenas se o anúncio
 *  terminou (ex.: if (resultado === 'completed') concederTempo()). */
let gdCarregado = false;
let gdPronto = false;

/** Carrega o SDK da GameDistribution (só no modo correspondente). */
function adsenseConfigurado() {
  const a = ADS.adsense || {};
  // Basta o publisher ID; os slots são necessários só para unidades manuais.
  return !!a.client && a.client.indexOf('XXXX') === -1;
}

function mostrarConsentimento() {
  const c = $('consent');
  if (c) c.classList.remove('hidden');
}

function responderConsentimento(aceitou) {
  try { localStorage.setItem(ADS.consentKey, aceitou ? 'ads' : 'essential'); } catch (e) {}
  const c = $('consent');
  if (c) c.classList.add('hidden');
  if (aceitou) carregarAdSense();
}

/** Injeta o script do AdSense e preenche os dois slots (principal e fim do dia). */
function carregarAdSense() {
  try {
    if (!document.head) return;
    const jaCarregado = window.adsbygoogle ||
      (document.querySelector && document.querySelector('script[src*="adsbygoogle"]'));
    if (!jaCarregado) {
      const sc = document.createElement('script');
      sc.async = true;
      sc.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADS.adsense.client;
      sc.crossOrigin = 'anonymous';
      document.head.appendChild(sc);
    }
    const el = $('ad-main');
    if (el && ADS.adsense.slotMain && ADS.adsense.slotMain !== '0000000000') {
      el.innerHTML = '';
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.style.width = '320px';
      ins.style.height = '100px';
      ins.setAttribute('data-ad-client', ADS.adsense.client);
      ins.setAttribute('data-ad-slot', ADS.adsense.slotMain);
      el.appendChild(ins);
      el.classList.remove('hidden');
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  } catch (e) {}
}

/** Preenche o slot do fim do dia apenas com o modal já visível (política AdSense). */
function preencherSlotFim() {
  try {
    if (ADS.modo !== 'adsense' || !adsenseConfigurado()) return;
    if (!ADS.adsense.slotEnd || ADS.adsense.slotEnd === '0000000000') return;
    const el = $('ad-banner');
    if (!el || el.getAttribute('data-filled') === '1') return;
    let consent = null;
    try { consent = localStorage.getItem(ADS.consentKey); } catch (e) {}
    if (consent !== 'ads') return;
    el.innerHTML = '';
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.style.width = '320px';
    ins.style.height = '100px';
    ins.setAttribute('data-ad-client', ADS.adsense.client);
    ins.setAttribute('data-ad-slot', ADS.adsense.slotEnd);
    el.appendChild(ins);
    el.setAttribute('data-filled', '1');
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {}
}

function iniciarAnuncios() {
  /* --- AdSense no próprio site --- */
  if (ADS.modo === 'adsense') {
    if (!adsenseConfigurado()) return;
    let consent = null;
    try { consent = localStorage.getItem(ADS.consentKey); } catch (e) {}
    if (consent === 'ads') { carregarAdSense(); setTimeout(prepararRewardedH5, 1500); return; }
    if (consent === 'essential') return;
    mostrarConsentimento();
    return;
  }

  /* --- GameDistribution (portal) --- */
  if (ADS.modo !== 'gamedistribution' || gdCarregado) return;
  gdCarregado = true;
  const s = document.createElement('script');
  s.src = ADS.sdkUrl;
  s.async = true;
  s.onload = function () {
    try {
      if (window.gdsdk && window.gdsdk.addEventListener) {
        window.gdsdk.addEventListener('SDK_READY', function () {
          gdPronto = true;
          try { if (window.gdsdk.preloadAd) window.gdsdk.preloadAd('rewarded'); } catch (e) {}
        });
        window.gdsdk.addEventListener('SDK_GAME_PAUSE', function () { adPausado = true; });
        window.gdsdk.addEventListener('SDK_GAME_START', function () {
          adPausado = false;
          ultimoAgora = Date.now();
        });
      }
    } catch (e) {}
  };
  s.onerror = function () {};
  document.head.appendChild(s);
}

/** Pede um anúncio rewarded.
 *  cb(true)  = visto até ao fim (dá recompensa)
 *  cb(false) = não visto / erro
 *  cb(null)  = SDK indisponível (usar simulação)
 */
function pedirRewardedGD(cb) {
  if (!window.gdsdk || typeof window.gdsdk.showAd !== 'function') { cb(null); return; }
  let respondido = false;
  let concluido = false;

  const limpar = function () {
    try { window.gdsdk.removeEventListener('SDK_REWARDED_WATCH_COMPLETE', onComplete); } catch (e) {}
  };
  const responder = function (ok) {
    if (respondido) return;
    respondido = true;
    limpar();
    cb(ok);
  };
  const onComplete = function () { concluido = true; responder(true); };

  try { window.gdsdk.addEventListener('SDK_REWARDED_WATCH_COMPLETE', onComplete); } catch (e) {}

  try {
    const p = window.gdsdk.showAd('rewarded');
    if (p && typeof p.then === 'function') {
      p.then(function () { responder(true); })
       .catch(function () { responder(concluido); });
    }
    // Rede de segurança: se o SDK não responder em 30s, não damos recompensa
    setTimeout(function () { responder(concluido); }, 30000);
  } catch (e) {
    limpar();
    cb(false);
  }
}

/** Anúncio simulado (sem rede) — mantém o jogo testável. */
function simularAnuncio(cb) {
  alert(t('anuncioSimulado'));
  cb(true);
}

/** Botão "Ver anúncio: +60s". */
/** Prepara a Ad Placement API (H5 Games Ads) se estiver disponível. */
function prepararRewardedH5() {
  if (typeof window.adConfig !== 'function') return false;
  try {
    window.adConfig({ preloadAdBreaks: 'on', sound: 'on' });
    return true;
  } catch (e) { return false; }
}

/** Pede um rewarded H5.
 *  cb(true)=visto, cb(false)=não visto, cb(null)=API indisponível. */
function pedirRewardedH5(cb) {
  if (typeof window.adBreak !== 'function') { cb(null); return; }
  let respondido = false;
  const responder = function (ok) { if (!respondido) { respondido = true; cb(ok); } };
  try {
    window.adBreak({
      type: 'reward',
      name: 'mais-tempo-pesca',
      beforeAd: function () { adPausado = true; },
      afterAd: function () { adPausado = false; ultimoAgora = Date.now(); },
      adBreakDone: function (info) {
        adPausado = false;
        ultimoAgora = Date.now();
        responder(!!(info && info.breakStatus === 'viewed'));
      }
    });
  } catch (e) { responder(null); }
}

function verAnuncio() {
  if (state.anuncios >= CONFIG.ANUNCIO_MAX_DIA) {
    toast(t('jaVisteAnuncios'));
    return;
  }
  const aplicar = function (visto) {
    if (visto !== true) {
      toast(t('anuncioIndisponivel'));
      return;
    }
    state.anuncios += 1;
    concederTempo();
    track('anuncio');
  };
  if (ADS.modo === 'gamedistribution') {
    if (!window.gdsdk) {
      toast(t('anuncioIndisponivel'));
      return;
    }
    pedirRewardedGD(aplicar);
    return;
  }

  if (ADS.modo === 'adsense') {
    let consent = null;
    try { consent = localStorage.getItem(ADS.consentKey); } catch (e) {}
    if (consent !== 'ads') {
      mostrarConsentimento();
      return;
    }
    if (ADS.rewarded === 'simulado') { simularAnuncio(aplicar); return; }
    prepararRewardedH5();
    pedirRewardedH5(function (ok) {
      if (ok === true) { aplicar(true); return; }
      toast(t('anuncioIndisponivel'));
    });
    return;
  }

  simularAnuncio(aplicar);
}

function concederTempo() {
  state.tempo += CONFIG.ANUNCIO_SEGUNDOS;
  state.tempoTotal += CONFIG.ANUNCIO_SEGUNDOS;
  if (fase === 'ended') { fecharFimDia(); fase = 'idle'; }
  bip(660, .08); setTimeout(() => bip(990, .12), 90);
  toast(t('segundosExtra'));
  cancelarPesca();
  atualizarHUD();
  guardar();
}

/* ==========================================================================
   13) RENDIMENTO OFFLINE (máx. 24h)
   ========================================================================== */
let offlinePendente = 0;

function calcularOffline() {
  const taxa = taxaPescador();
  if (taxa <= 0) { state.ultimoVisto = Date.now(); return; }
  const cap = CONFIG.OFFLINE_CAP_HORAS * 3600000;
  const decorrido = clamp(Date.now() - state.ultimoVisto, 0, cap);
  offlinePendente = Math.floor(taxa * (decorrido / 60000));
  state.ultimoVisto = Date.now();
  if (offlinePendente > 0) {
    $('offlineVal').textContent = fmt(offlinePendente);
    $('offlineModal').classList.remove('hidden');
  }
}

function recolherOffline() {
  state.moedas += offlinePendente;
  offlinePendente = 0;
  $('offlineModal').classList.add('hidden');
  bip(880, .1); setTimeout(() => bip(1180, .12), 90);
  toast(t('recolhido'));
  atualizarHUD();
  renderUpgradesSeVisivel();
  guardar();
}
