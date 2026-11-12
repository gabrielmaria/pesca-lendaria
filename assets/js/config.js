"use strict";

/* ==========================================================================
   Pesca Lendária — config.js
   Configuração, textos PT/EN, anúncios e analytics.
   Carregado primeiro.
   ========================================================================== */
/* ==========================================================================
   1) CONFIG — TODOS OS NÚMEROS DE EQUILÍBRIO (ajusta aqui)
   ========================================================================== */
const CONFIG = {
  /* --- Tempo de jogo --- */
  DIA_SEGUNDOS: 180,          // tempo de pesca por sessão
  INTERVALO_SESSAO_HORAS: 12, // horas entre sessões (2 por dia)
  ANUNCIO_SEGUNDOS: 60,       // segundos ganhos por anúncio
  ANUNCIO_MAX_DIA: 2,         // anúncios máximos por dia
  OFFLINE_CAP_HORAS: 24,      // cap do rendimento offline

  /* --- Ciclo de pesca --- */
  ESPERA_MIN_MS: 1500,        // espera mínima após lançar
  ESPERA_MAX_MS: 3000,        // espera máxima após lançar
  ESPERA_REDUCAO_NIVEL: 0.08, // -8% de espera por nível de Cana
  ESPERA_MIN_MS_ABS: 450,     // tecto inferior da espera
  ZONA_BASE: 0.16,            // largura inicial da zona verde (fração da barra)
  ZONA_GANHO_NIVEL: 0.02,     // +2% de zona verde por nível de Cana
  BARRA_MS: 1150,             // duração base da varredura da barra de timing
  BARRA_MIN_MS: 620,          // duração mínima (com combo alto)
  BARRA_ACELERA_COMBO: 0.045, // -4,5% de barra por ponto de combo
  JANELA_PERFEITA: 0.4,       // fração central da zona que conta como "Perfeito"
  MOSTRA_CAPTURA_MS: 1500,    // tempo de ecrã do peixe apanhado
  BONUS_PERFEITO: 1.5,        // +50% no valor por acerto perfeito
  PESO_MIN: 0.85,             // multiplicador de peso mínimo de cada peixe
  PESO_MAX: 1.35,             // multiplicador de peso máximo
  COMBO_MAX: 12,              // pontos de combo que contam para o multiplicador
  COMBO_PASSO: 0.10,          // +10% de valor por ponto de combo

  /* --- Upgrades --- */
  UPGRADE_MAX: 10,
  CUSTO_BASE:  { rod:300, bait:400, boat:600, fisher:750, freezer:1000 },
  CRESCIMENTO: { rod:2.0, bait:2.0, boat:2.1, fisher:2.05, freezer:2.1 },
  BARCO_VALOR_NIVEL: 0.20,    // +20% no valor de tudo por nível de Barco
  GELEIRA_VALOR_NIVEL: 0.25,  // +25% no valor de Raro+ por nível de Geleira
  ISCO_UNC: 0.15,             // Isco: multiplicador por nível em Incomum+
  ISCO_RARO: 0.20,            // Isco: multiplicador por nível em Raro+
  ISCO_EPICO: 0.25,           // Isco: multiplicador por nível em Épico+
  ISCO_LEND: 0.30,            // Isco: multiplicador por nível em Lendário+
  ISCO_MIT: 0.40,             // Isco: multiplicador por nível em Mítico
  PESCADOR_MOEDAS_MIN: 2,     // moedas/min base por nível de Pescador
  PESCADOR_ESCALA: 0.25,      // ganho extra por nível (crescimento quadrático suave)

  /* --- Missão diária --- */
  MISSAO: {
    peixes:    { alvo: 20, nome: 'peixes',    nomeEn: 'fish' },
    raros:     { alvo: 4,  nome: 'raros+',    nomeEn: 'rare+' },
    perfeitos: { alvo: 6,  nome: 'perfeitos', nomeEn: 'perfect' }
  },

  /* --- Coleção --- */
  COLECAO_BONUS: 0.05,        // +5% de valor por cada raridade completa

  /* --- Prestígio (Nova Época) --- */
  EPOCA_NIVEIS: 30,           // níveis totais mínimos para prestigiar
  EPOCA_POR_NIVEL: 5,         // 1 estrela por cada 5 níveis
  EPOCA_ESTRELA: 0.08,        // +8% de valor permanente por estrela

  /* --- Mar Profundo (endgame) --- */
  ABISMO_EPOCA: 3,            // época a partir da qual o Mar Profundo abre
  ABISMO_PESO: 0.10,          // peso base da raridade abissal (só depois de abrir)
  ISCO_ABISSO: 0.30,          // upgrade Isco: multiplicador abissal por nível
  CHEFE_BONUS_ABISSO: 6,      // recompensa do chefe abissal = valor normal x6
  CHEFE_ABISMO_DIAS: 4,       // 1 em cada N dias o chefe é abissal

  /* --- Iscas (escolha antes de lançar) --- */
  ISCAS: {
    comum:  { nome: 'Comum',  espera: 1,    valor: 1,    raro: 1   },
    rapida: { nome: 'Rápida', espera: 0.65, valor: 0.85, raro: 1   },
    funda:  { nome: 'Funda',  espera: 1.35, valor: 1,    raro: 1.5 },
    abissal:  { nome: 'Abissal',  espera: 1.2, valor: 0.9, raro: 0.7, abisso: 30 },
    reliquia: { nome: 'Relíquia', espera: 1.5, valor: 1.6, raro: 0.6, abisso: 12 }
  },

  /* --- Chefe do dia (gancho de regresso) --- */
  CHEFE_BONUS: 4,             // recompensa do chefe = valor normal x4
  CHEFE_ZONA: 0.10,           // zona verde no confronto com o chefe
  CHEFE_BARRA: 0.8,           // barra do chefe mais rápida
  CHEFE_APOS: 4,              // capturas até o chefe aparecer
  CHEFE_RETRY: 3,             // capturas até reaparecer depois de fugir

  /* --- Primeira experiência --- */
  PRIMEIRO_DIA_RARIDADE: 1.8, // multiplicador extra de raridades altas no 1º dia
  PRIMEIRO_UPGRADE_GRATIS: 'rod', // upgrade grátis no 1º dia

  /* --- Persistência --- */
  SAVE_KEY: 'pescaLendaria.v2',
  SAVE_INTERVAL: 5000,        // guarda automática periódica
  TICK_MS: 100                // cadência do loop principal
};

/* ==========================================================================
   1.b) ANÚNCIOS — GameDistribution (rewarded)
   --------------------------------------------------------------------------
   COMO LIGAR:
   1. Cria conta em https://gamedistribution.com e regista o jogo.
   2. Publica o index.html como jogo no portal (eles alojam ou dão o embed).
   3. Muda ADS.modo para 'gamedistribution'.
   4. (Opcional) Liga o intersticial no fim do dia.
   O SDK é carregado só quando o modo é este; caso contrário fica a
   simulação (nada quebra, nada é enviado para a rede).
   ========================================================================== */
const ADS = {
  modo: 'adsense',             // 'simulado' | 'gamedistribution' | 'adsense'
  sdkUrl: 'https://html5.api.gamedistribution.com/main.min.js',
  intersticialFimDia: false,   // true para interstitial quando o dia acaba
  adsense: {
    client: 'ca-pub-5123386402594330',
    // Unidades 320x100. O slot do jogo já está ligado; falta o do fim do dia.
    slotMain: '1850117685',
    slotEnd: '5629580595'
  },
  consentKey: 'pescaLendariaConsent.v1',
  rewarded: 'h5'               // 'h5' (Ad Placement API) | 'simulado'
};

/* ==========================================================================
   1.c) ANALYTICS (opcional) — visitas e origens
   --------------------------------------------------------------------------
   Recomendado: GoatCounter (grátis, sem cookies, dashboard simples).
   1. Cria conta em https://www.goatcounter.com e adiciona o site.
   2. Copia o URL do contador: https://OTEUCODIGO.goatcounter.com/count
   3. Põe ANALYTICS.ativo = true e preenche goatcounter + painel.
   4. Divulga com ?ref=reddit_incremental (ou utm_source/utm_campaign).
      Cada origem aparece no dashboard e como evento "origem/...".
   Alternativa: GA4 (preenche ga4 com G-XXXXXXXXXX e provedor 'ga4').
   ========================================================================== */
const ANALYTICS = {
  ativo: true,
  provedor: 'goatcounter',                       // 'goatcounter' | 'ga4'
  // Proxy first-party no Vercel (ver vercel.json): evita bloqueadores
  goatcounter: '/count',
  script: '/count.js',                            // fallback automático para gc.zgo.at
  ga4: 'G-XXXXXXXXXX',
  painel: 'https://pescalendaria.goatcounter.com', // botão "Ver estatísticas" (com ?dono)
  vercelAtivo: true                               // Vercel Web Analytics (script first-party)
};

/* ==========================================================================
   1.d) TEXTOS PT / EN
   ========================================================================== */
const TEXTOS = {
  pt: {
    tituloJogo: "Pesca Lendária",
    tempo: "TEMPO DE PESCA",
    som: "Som",
    idiomaParaEN: "Mudar para inglês",
    idiomaParaPT: "Mudar para português",
    abaPesca: "Pesca",
    abaUpgrades: "Upgrades",
    abaLivro: "Livro",
    dica: "Tens 3 minutos a cada 12 horas. Pesca!",
    chefeTitulo: "Chefe do dia",
    chefeCalculando: "A calcular…",
    iscaComum: "Comum",
    iscaComumSub: "equilíbrio",
    iscaRapida: "Rápida",
    iscaRapidaSub: "-35% espera · -15% valor",
    iscaFunda: "Funda",
    iscaFundaSub: "+50% raros · +35% espera",
    iscaAbissal: "Abissal",
    iscaAbissalSub: "abissais ×30 · -10% valor",
    iscaReliquia: "Relíquia",
    iscaReliquiaSub: "abissais ×12 · +60% valor",
    modoAbismoSub: "raridade abissal",
    modoAbismoOn: "A descer ao Mar Profundo…",
    modoSuperficieOn: "De volta à superfície.",
    modoOcupado: "Espera pela captura para mudar de fundo.",
    lancar: "LANÇAR",
    esperar: "… A ESPERAR",
    agora: "AGORA!",
    terminado: "DIA TERMINADO",
    statusPronto: "Gira a cana e lança!",
    statusLancar: "A lançar",
    statusAproxima: "Algo enorme se aproxima",
    statusMordida: "MORDIDA! Toca!",
    statusChefeMordida: "CHEFE! TOCA AGORA!",
    chefeApanhadoHoje: "Apanhado hoje! Amanhã há outro.",
    chefeAparece1: "Aparece daqui a 1 peixe · bónus ×4",
    chefeApareceN: "Aparece daqui a {n} peixes · bónus ×4",
    chefeAVista: "Está à vista! Lança a cana · bónus ×4",
    chefeAparece1Abismo: "Aparece daqui a 1 peixe · bónus ×6",
    chefeApareceNAbismo: "Aparece daqui a {n} peixes · bónus ×6",
    chefeAVistaAbismo: "Está à vista! Lança a cana · bónus ×6",
    chefeEscapou: "O chefe escapou… volta a tentar.",
    chefeApanhado: "Chefe do dia apanhado! Bónus ×4",
    chefeApanhadoAbismo: "Chefe abissal apanhado! Bónus ×6",
    escapou: "Escapou!",
    chefeTituloCatch: "O chefe escapou!",
    tentaOutra: "Tenta outra vez",
    tentaOutraBreve: "Tenta outra vez daqui a pouco",
    novo: "NOVO!",
    chefeFlag: "CHEFE DO DIA",
    chefeFlagAbismo: "CHEFE ABISSAL",
    abissoFlag: "MAR PROFUNDO",
    perfeito: "PERFEITO +50%",
    bonusChefe: "BÓNUS ×4",
    bonusChefeAbismo: "BÓNUS ×6",
    bonusChefeN: "BÓNUS ×{n}",
    missaoFeita: "Feita +{v}",
    upgradesDica: "Compras rápidas — não gastam tempo de pesca.",
    epocaNome: "Nova Época",
    epocaDesc: "Recomeças moedas e upgrades e ganhas estrelas permanentes (+8% de valor cada). O Livro, o streak e o dia ficam. Na Época 3 abre o Mar Profundo.",
    epocaLabel: "Época",
    estrela: "estrela",
    estrelas: "estrelas",
    valorSufixo: "% valor",
    epocaProg: "Níveis {n}/30 · faltam {f}",
    epocaPronto: "Pronto! Vais ganhar +{g} estrelas",
    prestigiar: "Prestigiar",
    prestigiarAgora: "Prestigiar agora",
    comprarPor: "Comprar por {v}",
    maximo: "MÁXIMO",
    stats: "Ver estatísticas",
    privacidade: "Privacidade",
    sobre: "Sobre",
    novidades: "Novidades",
    novidadesTitulo: "Novidades",
    novidadesSub: "O que mudou no jogo",
    novidadesNovo: "NOVO",
    consentTexto: "Usamos armazenamento local para guardar o jogo e, com o teu consentimento, anúncios e estatísticas.",
    consentAceitar: "Aceitar",
    consentEssenciais: "Só essenciais",
    livroContagem: "{n}/{t} descobertas",
    livroDica: "? = por descobrir",
    livroBonus: "Bónus de coleção: +{p}%",
    livroSuperficie: "Superfície",
    livroAbismo: "Mar Profundo",
    livroAbismoBloqueado: "Mar Profundo · Época {e}",
    livroDicaAbismo: "usa a isca Abissal para os encontrar",
    abaLegado: "Legado",
    legadoDica: "As conquistas dão Pérolas. Gasta-as em melhorias permanentes.",
    legadoConquistas: "Conquistas",
    legadoLoja: "Loja",
    legadoProgresso: "{n}/{t} conquistas",
    perolasUnit: "Pérolas",
    perolasInsuficientes: "Pérolas insuficientes!",
    comprarPorPerolas: "Comprar · {v}",
    legadoNivel: "{n} → nível {l}",
    conquistasGanhas: "Conquistas concluídas! +{p} Pérolas",
    perolasGanhas: "Pérolas +{n}",
    conquistaFeita: "Concluída",
    legadoEfeitoTempo: "+{v}s por sessão",
    legadoEfeitoSorte: "+{v}% chance abissal",
    legadoEfeitoOffline: "+{v}h offline",
    legadoEfeitoAnuncios: "+{v} anúncios/dia",
    legadoEfeitoInicio: "época começa com nível {v}",
    legadoEfeitoChefe: "+{v}× bónus do chefe",
    legadoEfeitoCombo: "+{v} combo máximo",
    legadoEfeitoValor: "+{v}% valor",
    legadoEfeitoLivro: "+{v}% bónus do livro",
    abissoDesbloqueado: "Mar Profundo desbloqueado! Escolhe o modo acima da cena.",
    abissoBloqueado: "Desbloqueia na Época {e}.",
    efeitoAbissal: "abissal ×{a}",
    offlineTitulo: "Equipa a trabalhar",
    offlineAntes: "Enquanto estiveste fora, os teus pescadores ganharam",
    offlineDepois: "moedas.",
    recolher: "Recolher",
    fimTitulo: "Fim da Sessão",
    fimTexto: "O negócio continua a render. Volta daqui a algumas horas!",
    moedasHoje: "moedas na sessão",
    peixesLabel: "peixes",
    melhorLabel: "Melhor:",
    nenhumaCaptura: "Nenhuma captura hoje. Amanhã há mais!",
    streakLabel: "Streak:",
    diasLabel: "dias",
    chefeFimOk: "Chefe do dia apanhado! Grande trabalho.",
    chefeFimEscapou: "O chefe de hoje ({n}) escapou. Amanhã há outro.",
    partilhar: "Partilhar",
    amanhaLabel: "Amanhã",
    proximoDia: "Próxima sessão em",
    anuncio: "Anúncio",
    verAnuncio: "Ver anúncio: +60s de pesca",
    fechar: "Fechar",
    anuncioIndisponivel: "Anúncio indisponível. Tenta outra vez.",
    jaVisteAnuncios: "Já viste os anúncios de hoje. Volta amanhã!",
    anuncioSimulado: "[Simulação de anúncio]\n\nAqui entraria o anúncio recompensado real (GameDistribution).\n+60 segundos de pesca!",
    segundosExtra: " +60 segundos de pesca!",
    missaoConcluida: "Missão concluída: +{v} moedas!",
    raridadeCompleta: "Raridade completa! +{p}% de valor permanente.",
    copiado: "Resultado copiado!",
    naoCopiado: "Não foi possível copiar.",
    recolhido: "Moedas recolhidas!",
    novoDia: "Novo dia! Novo evento e nova missão.",
    novaSessao: "Nova sessão! Tempo reposto.",
    upgradeNivel: "{n} → nível {l}",
    moedasUnit: "moedas",
    perfeitoMin: "perfeito",
    novaEpoca: "Nova época! +{g} estrelas",
    nivel: "Nível",
    nivelMax: "Nível máximo atingido",
    agoraLabel: "Agora:",
    proximoLabel: "Próximo:",
    moedasInsuficientes: "Moedas insuficientes!",
    semNiveis: "Ainda precisas de mais níveis.",
    confirmarPrestigio: "Começar uma nova época?\n\nPerdes moedas e upgrades, mas ganhas {g} estrelas permanentes (+{p}% de valor).",
    primeiroUpgrade: "Primeiro upgrade grátis: {n} nível 1!",
    iscaSelecionada: "Isca {n} selecionada.",
    efeitoEspera: "espera {v} · zona {z}",
    efeitoRaros: "raros ×{v} · mítico ×{m}",
    efeitoValor: "valor ×{v}",
    efeitoMoedas: "{v} moedas/min",
    efeitoGeleira: "+{v}% em Raro+",
    partilhaTitulo: "🎣 Pesca Lendária #{n}",
    partilhaPeixes: "🐟 {p} peixes | 💰 {m}",
    partilhaMelhor: "🏆 Melhor captura: {r}",
    partilhaStreak: "🔥 Streak: {s}"
  },
  en: {
    tituloJogo: "Pesca Lendária",
    tempo: "FISHING TIME",
    som: "Sound",
    idiomaParaEN: "Switch to English",
    idiomaParaPT: "Switch to Portuguese",
    abaPesca: "Fishing",
    abaUpgrades: "Upgrades",
    abaLivro: "Book",
    dica: "You get 3 minutes every 12 hours. Fish!",
    chefeTitulo: "Daily boss",
    chefeCalculando: "Calculating…",
    iscaComum: "Common",
    iscaComumSub: "balanced",
    iscaRapida: "Fast",
    iscaRapidaSub: "-35% wait · -15% value",
    iscaFunda: "Deep",
    iscaFundaSub: "+50% rare · +35% wait",
    iscaAbissal: "Abyssal",
    iscaAbissalSub: "abyssal ×30 · -10% value",
    iscaReliquia: "Relic",
    iscaReliquiaSub: "abyssal ×12 · +60% value",
    modoAbismoSub: "abyssal rarity",
    modoAbismoOn: "Descending to the Deep Sea…",
    modoSuperficieOn: "Back to the surface.",
    modoOcupado: "Wait for the catch to change depth.",
    lancar: "CAST",
    esperar: "… WAITING",
    agora: "NOW!",
    terminado: "DAY OVER",
    statusPronto: "Line up the rod and cast!",
    statusLancar: "Casting",
    statusAproxima: "Something huge is coming",
    statusMordida: "BITE! Tap!",
    statusChefeMordida: "BOSS! TAP NOW!",
    chefeApanhadoHoje: "Caught today! Another one tomorrow.",
    chefeAparece1: "Appears after 1 more fish · ×4 bonus",
    chefeApareceN: "Appears after {n} more fish · ×4 bonus",
    chefeAVista: "It is here! Cast your rod · ×4 bonus",
    chefeAparece1Abismo: "Appears after 1 more fish · ×6 bonus",
    chefeApareceNAbismo: "Appears after {n} more fish · ×6 bonus",
    chefeAVistaAbismo: "It is here! Cast your rod · ×6 bonus",
    chefeEscapou: "The boss got away… try again.",
    chefeApanhado: "Daily boss caught! ×4 bonus",
    chefeApanhadoAbismo: "Abyssal boss caught! ×6 bonus",
    escapou: "It got away!",
    chefeTituloCatch: "The boss got away!",
    tentaOutra: "Try again",
    tentaOutraBreve: "Try again in a moment",
    novo: "NEW!",
    chefeFlag: "DAILY BOSS",
    chefeFlagAbismo: "ABYSSAL BOSS",
    abissoFlag: "DEEP SEA",
    perfeito: "PERFECT +50%",
    bonusChefe: "×4 BONUS",
    bonusChefeAbismo: "×6 BONUS",
    bonusChefeN: "×{n} BONUS",
    missaoFeita: "Done +{v}",
    upgradesDica: "Quick buys — they do not use fishing time.",
    epocaNome: "New Season",
    epocaDesc: "You reset coins and upgrades and earn permanent stars (+8% value each). Your Book, streak and day stay. Season 3 opens the Deep Sea.",
    epocaLabel: "Season",
    estrela: "star",
    estrelas: "stars",
    valorSufixo: "% value",
    epocaProg: "Levels {n}/30 · {f} to go",
    epocaPronto: "Ready! You will earn +{g} stars",
    prestigiar: "Prestige",
    prestigiarAgora: "Prestige now",
    comprarPor: "Buy for {v}",
    maximo: "MAXED",
    stats: "View stats",
    privacidade: "Privacy",
    sobre: "About",
    novidades: "Updates",
    novidadesTitulo: "Updates",
    novidadesSub: "What changed in the game",
    novidadesNovo: "NEW",
    consentTexto: "We use local storage to save the game and, with your consent, ads and analytics.",
    consentAceitar: "Accept",
    consentEssenciais: "Essentials only",
    livroContagem: "{n}/{t} discovered",
    livroDica: "? = undiscovered",
    livroBonus: "Collection bonus: +{p}%",
    livroSuperficie: "Surface",
    livroAbismo: "Deep Sea",
    livroAbismoBloqueado: "Deep Sea · Season {e}",
    livroDicaAbismo: "use Abyssal bait to find them",
    abaLegado: "Legacy",
    legadoDica: "Achievements award Pearls. Spend them on permanent upgrades.",
    legadoConquistas: "Achievements",
    legadoLoja: "Shop",
    legadoProgresso: "{n}/{t} achievements",
    perolasUnit: "Pearls",
    perolasInsuficientes: "Not enough Pearls!",
    comprarPorPerolas: "Buy · {v}",
    legadoNivel: "{n} → level {l}",
    conquistasGanhas: "Achievements complete! +{p} Pearls",
    perolasGanhas: "Pearls +{n}",
    conquistaFeita: "Completed",
    legadoEfeitoTempo: "+{v}s per session",
    legadoEfeitoSorte: "+{v}% abyssal chance",
    legadoEfeitoOffline: "+{v}h offline",
    legadoEfeitoAnuncios: "+{v} ads/day",
    legadoEfeitoInicio: "season starts at level {v}",
    legadoEfeitoChefe: "+{v}× boss bonus",
    legadoEfeitoCombo: "+{v} combo cap",
    legadoEfeitoValor: "+{v}% value",
    legadoEfeitoLivro: "+{v}% collection bonus",
    abissoDesbloqueado: "Deep Sea unlocked! Pick the mode above the scene.",
    abissoBloqueado: "Unlocks in Season {e}.",
    efeitoAbissal: "abyssal ×{a}",
    offlineTitulo: "Crew at work",
    offlineAntes: "While you were away, your fishermen earned",
    offlineDepois: "coins.",
    recolher: "Collect",
    fimTitulo: "Session Over",
    fimTexto: "The business keeps earning. Come back in a few hours!",
    moedasHoje: "coins this session",
    peixesLabel: "fish",
    melhorLabel: "Best:",
    nenhumaCaptura: "No catches today. More tomorrow!",
    streakLabel: "Streak:",
    diasLabel: "days",
    chefeFimOk: "Daily boss caught! Great job.",
    chefeFimEscapou: "The daily boss ({n}) got away. Another one tomorrow.",
    partilhar: "Share",
    amanhaLabel: "Tomorrow",
    proximoDia: "Next session in",
    anuncio: "Ad",
    verAnuncio: "Watch ad: +60s of fishing",
    fechar: "Close",
    anuncioIndisponivel: "Ad unavailable. Try again.",
    jaVisteAnuncios: "All ads for today are done. Come back tomorrow!",
    anuncioSimulado: "[Ad simulation]\n\nA real rewarded ad (GameDistribution) would play here.\n+60 seconds of fishing!",
    segundosExtra: " +60 seconds of fishing!",
    missaoConcluida: "Mission complete: +{v} coins!",
    raridadeCompleta: "Rarity complete! +{p}% permanent value.",
    copiado: "Result copied!",
    naoCopiado: "Could not copy.",
    recolhido: "Coins collected!",
    novoDia: "New day! New event and mission.",
    novaSessao: "New session! Time restored.",
    upgradeNivel: "{n} → level {l}",
    moedasUnit: "coins",
    perfeitoMin: "perfect",
    novaEpoca: "New season! +{g} stars",
    nivel: "Level",
    nivelMax: "Max level reached",
    agoraLabel: "Now:",
    proximoLabel: "Next:",
    moedasInsuficientes: "Not enough coins!",
    semNiveis: "You need more levels.",
    confirmarPrestigio: "Start a new season?\n\nYou lose coins and upgrades, but earn {g} permanent stars (+{p}% value).",
    primeiroUpgrade: "Free first upgrade: {n} level 1!",
    iscaSelecionada: "{n} bait selected.",
    efeitoEspera: "wait {v} · zone {z}",
    efeitoRaros: "rare ×{v} · mythic ×{m}",
    efeitoValor: "value ×{v}",
    efeitoMoedas: "{v} coins/min",
    efeitoGeleira: "+{v}% on Rare+",
    partilhaTitulo: "🎣 Pesca Lendária #{n}",
    partilhaPeixes: "🐟 {p} fish | 💰 {m}",
    partilhaMelhor: "🏆 Best catch: {r}",
    partilhaStreak: "🔥 Streak: {s}"
  }
};
