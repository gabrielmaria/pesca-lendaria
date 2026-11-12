"use strict";

/* ==========================================================================
   Pesca Lendária: main.js
   Arranque do jogo, eventos globais e loop de integração.
   Carregado por último; chama iniciar().
   ========================================================================== */
/* ==========================================================================
   14) ARRANQUE, EVENTOS E INTEGRAÇÃO
   ========================================================================== */

/** Primeira experiência: upgrade grátis + boost de raridades (só no 1º dia). */
function primeiraVez() {
  if (!state.novato) return;
  const id = CONFIG.PRIMEIRO_UPGRADE_GRATIS;
  if ((state.up[id] || 0) < 1) {
    state.up[id] = 1;
    const u = UPGRADES_DADOS.find(function (x) { return x.id === id; });
    setTimeout(function () { toast(tf('primeiroUpgrade', { n: nomeUpgrade(u) })); }, 400);
  }
}

function alternarSom() {
  state.som = !state.som;
  atualizarBotaoSom();
  if (state.som) bip(700, .08);
  guardar();
}

/** Toque/clique na zona do mar também conta como "toco" durante a barra. */
function toqueNoMar(ev) {
  if (fase !== 'bar') return;
  if (ev) ev.preventDefault();
  resolverBarra($('marker').style.left ? parseFloat($('marker').style.left) / 100 : 0);
}

function aplicarIdioma() {
  try {
    if (document.documentElement) {
      document.documentElement.lang = idiomaAtual() === 'en' ? 'en' : 'pt-PT';
    }
    document.title = t('tituloJogo');

    const nos = document.querySelectorAll('[data-i18n]');
    for (let i = 0; i < nos.length; i++) {
      const chave = nos[i].getAttribute('data-i18n');
      if (chave) nos[i].textContent = t(chave);
    }

    const b = $('btnIdioma');
    if (b) {
      b.textContent = idiomaAtual() === 'en' ? 'PT' : 'EN';
      const titulo = t(idiomaAtual() === 'en' ? 'idiomaParaPT' : 'idiomaParaEN');
      b.title = titulo;
      b.setAttribute('aria-label', titulo);
    }

    atualizarBotaoSom();
    mostrarSeloEvento();
    atualizarHUD();
    atualizarChefeUI();
    renderUpgrades();
    renderLivro();
    renderIscas();
    renderModo();
    renderLegado();
    renderNovidades();
    renderNovidadesLink();
    botaoLancar();

    if (fase === 'waiting') {
      setStatus((bossAtual ? t('statusAproxima') : t('statusLancar')) +
        '<span class="dots"><span>.</span><span>.</span><span>.</span></span>');
    } else if (fase === 'bar') {
      setStatus('<span class="bite">' + (bossAtual ? t('statusChefeMordida') : t('statusMordida')) + '</span>');
    } else if (fase === 'idle') {
      setStatus(t('statusPronto'));
    }

    const ev = eventoAtual();
    $('evTitle').textContent = nomeEvento(ev);
    $('evDesc').textContent = descEvento(ev);

    if (!$('fimModal').classList.contains('hidden')) abrirFimDia();
    guardar();
  } catch (e) {}
}

function alternarIdioma() {
  state.idioma = idiomaAtual() === 'en' ? 'pt' : 'en';
  aplicarIdioma();
  toast(idiomaAtual() === 'en' ? 'Language: English' : 'Idioma: Português');
  bip(620, .06);
}

function iniciar() {
  /* --- Estado já carregado; primeiro a viragem de dia e o offline --- */
  const mudouDia = verificarNovoDia();
  verificarRefill();
  if (!state.hoje.missao) state.hoje.missao = gerarMissao(state.dataDia);
  if (!state.hoje.chefe) state.hoje.chefe = gerarChefe(state.dataDia);
  calcularOffline();
  primeiraVez();

  /* --- Interface --- */
  iniciarAnuncios();
  iniciarAnalytics();
  aplicarHora();
  hidratarSprites(document);
  aplicarIdioma();
  cancelarPesca();
  guardar();

  /* --- Se o jogo guardou no fim do dia, reabrir o resumo --- */
  if (state.tempo <= 0 && offlinePendente <= 0) encerrarDia();

  /* --- Evento do dia (cartão de 2s na primeira abertura do dia) --- */
  if (!state.eventoVisto && state.tempo > 0) setTimeout(mostrarEvento, 350);

  if (mudouDia) toast(t('novoDia'));
  setTimeout(verificarAbismo, 1200);

  /* --- Separadores --- */
  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { mudarSeparador(b.dataset.tab); });
  });
  document.querySelectorAll('.book-tab').forEach(function (b) {
    b.addEventListener('click', function () {
      const v = b.dataset.livro;
      if (v === 'abisso' && !abissoAtivo()) {
        toast(tf('abissoBloqueado', { e: CONFIG.ABISMO_EPOCA }));
        return;
      }
      livroVista = v;
      renderLivro();
      bip(620, .06);
    });
  });
  document.querySelectorAll('[data-legado-vista]').forEach(function (b) {
    b.addEventListener('click', function () {
      legadoVista = b.dataset.legadoVista;
      renderLegado();
      bip(620, .06);
    });
  });

  /* --- Conquistas já alcançadas (inclui saves antigos) --- */
  setTimeout(agendarConquistas, 1500);

  /* --- Novidades / changelog --- */
  renderNovidadesLink();
  $('btnNovidades').addEventListener('click', function (e) {
    e.preventDefault();
    abrirNovidades();
  });
  $('btnFecharNovidades').addEventListener('click', fecharNovidades);
  setTimeout(verificarNovidades, 2600);

  /* --- Pesca --- */
  $('castBtn').addEventListener('click', function () {
    if (fase === 'bar') { toqueNoMar(); return; }
    if (fase === 'result') { esconderCaptura(); return; }
    lancar();
  });
  $('sea').addEventListener('click', toqueNoMar);

  /* --- Iscas --- */
  document.querySelectorAll('.isca').forEach(function (b) {
    b.addEventListener('click', function () { escolherIsca(b.dataset.isca); });
  });

  /* --- Modo: Superfície / Mar Profundo --- */
  document.querySelectorAll('.modo-tab').forEach(function (b) {
    b.addEventListener('click', function () { escolherModo(b.dataset.modo); });
  });

  /* --- Prestígio --- */
  $('btnEpoca').addEventListener('click', prestigiar);

  /* --- Teclado (desktop) --- */
  document.addEventListener('keydown', function (e) {
    if (e.code !== 'Space') return;
    if ($('fimModal').classList.contains('hidden') === false) return;
    e.preventDefault();
    if (fase === 'bar') toqueNoMar();
    else if (fase === 'result') esconderCaptura();
    else lancar();
  });

  /* --- Evento / som --- */
  $('evClose').addEventListener('click', fecharEvento);
  $('btnSom').addEventListener('click', alternarSom);
  $('btnIdioma').addEventListener('click', alternarIdioma);

  /* --- Fim do dia / partilha / anúncios --- */
  $('btnPartilhar').addEventListener('click', partilhar);
  $('btnFecharFim').addEventListener('click', fecharFimDia);
  $('btnAnuncio').addEventListener('click', verAnuncio);

  /* --- Offline --- */
  $('btnRecolher').addEventListener('click', recolherOffline);

  /* --- Consentimento de anúncios --- */
  if ($('consentSim')) $('consentSim').addEventListener('click', function () { responderConsentimento(true); });
  if ($('consentNao')) $('consentNao').addEventListener('click', function () { responderConsentimento(false); });

  /* --- Page Visibility API --- */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      ultimoAgora = Date.now();
      verificarNovoDia();
      atualizarHUD();
      atualizarChefeUI();
    } else {
      guardar();
    }
  });

  /* --- Gravação de segurança --- */
  window.addEventListener('pagehide', guardar);
  window.addEventListener('beforeunload', guardar);

  /* --- Loop principal --- */
  ultimoAgora = Date.now();
  setInterval(loop, CONFIG.TICK_MS);
}

iniciar();
