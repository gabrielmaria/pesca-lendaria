"use strict";

/* ==========================================================================
   Pesca Lendária — data.js
   Conteúdo do jogo: raridades, peixes, upgrades e eventos.
   Carregado depois de config.js.
   ========================================================================== */
/* ==========================================================================
   2) DADOS DE CONTEÚDO (troca o tema alterando só estes arrays)
   ========================================================================== */

/* --- Raridades: peso em %, multiplicador de valor e cor --- */
const RARIDADES = [
  { id:'comum',    nome:'Comum', en:'Common',    peso:60,   mult:1,    cor:'var(--r0)', emoji:'⚪' },
  { id:'incomum',  nome:'Incomum', en:'Uncommon',  peso:25,   mult:3,    cor:'var(--r1)', emoji:'🟢' },
  { id:'raro',     nome:'Raro', en:'Rare',     peso:10,   mult:10,   cor:'var(--r2)', emoji:'🔵' },
  { id:'epico',    nome:'Épico', en:'Epic',    peso:4,    mult:40,   cor:'var(--r3)', emoji:'🟣' },
  { id:'lendario', nome:'Lendário', en:'Legendary', peso:0.9,  mult:200,  cor:'var(--r4)', emoji:'🟡' },
  { id:'mitico',   nome:'Mítico', en:'Mythic',   peso:0.1,  mult:1000, cor:'var(--r5)', emoji:'🔴' },
  { id:'abissal',  nome:'Abissal', en:'Abyssal', peso:0.10, mult:5000, cor:'var(--r6)', emoji:'🌊' }
];

/* --- 30 espécies de superfície: 8 comuns, 7 incomuns, 6 raras, 4 épicas, 3 lendárias, 2 míticas --- */
const PEIXES = [
  /* Comuns */
  { id:'sardinha_sem_nocao',   nome:'Sardinha Sem Noção', en:'Clueless Sardine',           emoji:'🐟', r:0, base:8 },
  { id:'carapau_perdido',      nome:'Carapau Perdido', en:'Lost Mackerel',              emoji:'🐠', r:0, base:9 },
  { id:'golo_apressado',       nome:'Golo Apressado', en:'Hasty Goal',               emoji:'🐟', r:0, base:10 },
  { id:'tainha_fria',          nome:'Tainha Quase Fria', en:'Almost Cold Mullet',            emoji:'🐟', r:0, base:11 },
  { id:'sargo_improvisado',    nome:'Sargo Improvisado', en:'Improvised Bream',            emoji:'🐠', r:0, base:12 },
  { id:'anchova_reservada',    nome:'Anchova Reservada', en:'Reserved Anchovy',            emoji:'🐟', r:0, base:13 },
  { id:'baiacu_inflado',       nome:'Baiacu Inflado', en:'Puffed Pufferfish',               emoji:'🐡', r:0, base:14 },
  { id:'peixe_voador_parque',  nome:'Peixe Voador de Parque', en:'Park Flying Fish',       emoji:'🐟', r:0, base:15 },
  /* Incomuns */
  { id:'caranguejo_dedicado',  nome:'Caranguejo Dedicado', en:'Dedicated Crab',          emoji:'🦀', r:1, base:10 },
  { id:'polvo_reformado',      nome:'Polvo Reformado', en:'Retired Octopus',              emoji:'🐙', r:1, base:11 },
  { id:'atum_segunda_mao',     nome:'Atum de Segunda Mão', en:'Second-Hand Tuna',          emoji:'🐟', r:1, base:12 },
  { id:'lula_simpatica',       nome:'Lula Simpática', en:'Friendly Squid',               emoji:'🦑', r:1, base:13 },
  { id:'xarroco_malhumorado',  nome:'Xarroco Mal-Humorado', en:'Grumpy Rockfish',         emoji:'🐟', r:1, base:14 },
  { id:'mero_de_elevador',     nome:'Mero de Elevador', en:'Elevator Grouper',             emoji:'🐟', r:1, base:15 },
  { id:'robalo_influencer',    nome:'Robalo Influencer', en:'Influencer Sea Bass',            emoji:'🐟', r:1, base:16 },
  /* Raras */
  { id:'dourada_encartada',    nome:'Dourada Encartada', en:'Dressed-Up Sea Bream',            emoji:'🐟', r:2, base:14 },
  { id:'congro_filosofico',    nome:'Congro Filosófico', en:'Philosophical Conger',            emoji:'🐟', r:2, base:15 },
  { id:'lula_sigma',           nome:'Lula Sigma', en:'Sigma Squid',                   emoji:'🦑', r:2, base:16 },
  { id:'espadarte_contabilista',nome:'Espadarte Contabilista', en:'Accountant Swordfish',      emoji:'🐟', r:2, base:17 },
  { id:'barracuda_assertiva',  nome:'Barracuda Assertiva', en:'Assertive Barracuda',          emoji:'🐟', r:2, base:18 },
  { id:'kraken_iniciante',     nome:'Kraken Iniciante', en:'Beginner Kraken',             emoji:'🐙', r:2, base:19 },
  /* Épicas */
  { id:'tubarao_estimacao',    nome:'Tubarão de Estimação', en:'Pet Shark',         emoji:'🦈', r:3, base:18 },
  { id:'baiacu_nuclear',       nome:'Baiacu Nuclear', en:'Nuclear Pufferfish',               emoji:'☢️🐡', r:3, base:20 },
  { id:'baleia_fiscal',        nome:'Baleia Fiscal', en:'Tax Whale',                emoji:'🐋', r:3, base:22 },
  { id:'kraken_de_feira',      nome:'Kraken de Feira', en:'Fairground Kraken',              emoji:'🐙', r:3, base:24 },
  /* Lendárias */
  { id:'baleia_outro_mundo',   nome:'Baleia do Outro Mundo', en:'Otherworldly Whale',        emoji:'🐳', r:4, base:26 },
  { id:'tubarao_ouro',         nome:'Tubarão de Ouro', en:'Golden Shark',              emoji:'🦈', r:4, base:30 },
  { id:'polvo_reencarnado',    nome:'Polvo Reencarnado', en:'Reincarnated Octopus',            emoji:'🐙', r:4, base:34 },
  /* Míticas */
  { id:'cetus',                nome:'Cetus, o Come-Mundos', en:'Cetus, the World-Eater',         emoji:'🐋', r:5, base:38 },
  { id:'dragao_marinho',       nome:'Dragão-Marinho Ancestral', en:'Ancestral Sea Dragon',     emoji:'🐉', r:5, base:44 },
  /* Abissais (Mar Profundo — desbloqueia na Época 3) */
  { id:'enguia_abissal',       nome:'Enguia das Fendas', en:'Trench Eel',                    emoji:'🐟', r:6, base:42 },
  { id:'peixe_lanterna',       nome:'Peixe-Lanterna Nervoso', en:'Nervous Lanternfish',      emoji:'🐠', r:6, base:44 },
  { id:'camarao_cego',         nome:'Camarão Cego', en:'Blind Shrimp',                      emoji:'🦀', r:6, base:46 },
  { id:'lula_vampira',         nome:'Lula Vampira', en:'Vampire Squid',                     emoji:'🦑', r:6, base:48 },
  { id:'polvo_do_vazio',       nome:'Polvo do Vazio', en:'Void Octopus',                    emoji:'🐙', r:6, base:50 },
  { id:'tubarao_gelido',       nome:'Tubarão Glacial', en:'Glacial Shark',                   emoji:'🦈', r:6, base:52 },
  { id:'baiacu_pressao',       nome:'Baiacu de Pressão', en:'Pressure Pufferfish',           emoji:'🐡', r:6, base:54 },
  { id:'arraia_fantasma',      nome:'Arraia Fantasma', en:'Ghost Ray',                       emoji:'🐟', r:6, base:56 },
  { id:'celacanto_centenario', nome:'Celacanto Centenário', en:'Centenarian Coelacanth',     emoji:'🐟', r:6, base:58 },
  { id:'caranguejo_yeti',      nome:'Caranguejo Yeti', en:'Yeti Crab',                       emoji:'🦀', r:6, base:60 },
  { id:'medusa_do_abismo',     nome:'Medusa do Abismo', en:'Abyss Jellyfish',                emoji:'🐙', r:6, base:62 },
  { id:'tubarao_duende',       nome:'Tubarão-Duende', en:'Goblin Shark',                     emoji:'🦈', r:6, base:64 },
  { id:'baleia_ossea',         nome:'Baleia Ossuária', en:'Skeletal Whale',                  emoji:'🐋', r:6, base:66 },
  { id:'leviata_das_fossas',   nome:'Leviatã das Fossas', en:'Trench Leviathan',             emoji:'🐳', r:6, base:68 },
  { id:'dragao_do_nucleo',     nome:'Dragão do Núcleo', en:'Core Dragon',                     emoji:'🐉', r:6, base:72 }
];

/* --- Upgrades --- */
const UPGRADES_DADOS = [
  { id:'rod',     nome:'Cana',                 emoji:'🎣', desc:'Reduz a espera e alarga a zona verde do timing.', nomeEn:'Rod', descEn:'Reduces wait time and widens the timing zone.' },
  { id:'bait',    nome:'Isco',                 emoji:'🪱', desc:'Aumenta a probabilidade das raridades altas.', nomeEn:'Bait', descEn:'Increases the odds of higher rarities.' },
  { id:'boat',    nome:'Barco',                emoji:'⛵', desc:'Multiplica o valor de todos os peixes.', nomeEn:'Boat', descEn:'Multiplies the value of all fish.' },
  { id:'fisher',  nome:'Pescador Contratado',  emoji:'🧑‍🌾', desc:'Gera moedas por minuto, mesmo com o jogo fechado.', nomeEn:'Hired Fisherman', descEn:'Earns coins per minute, even offline.' },
  { id:'freezer', nome:'Geleira',              emoji:'🧊', desc:'Aumenta o valor de venda dos peixes raros ou superiores.', nomeEn:'Freezer', descEn:'Increases the value of rare or better fish.' }
];

/* --- Eventos do dia (8) — efeitos aplicados ao calcular cada lance --- */
const EVENTOS = [
  { id:'chuva',   emoji:'☔', nome:'Dia de Chuva',       desc:'+30% de peixes raros ou superiores.', nomeEn:'Rainy Day', descEn:'+30% chance of rare or better fish.',   fx:{ raro:1.3 } },
  { id:'nevoeiro',emoji:'🌫️', nome:'Nevoeiro',           desc:'Espera +50%, mas valor +40%.', nomeEn:'Fog', descEn:'+50% wait, +40% value.',           fx:{ espera:1.5, valor:1.4 } },
  { id:'lua',     emoji:'🌕', nome:'Lua Cheia',          desc:'O peixe mítico aparece 5x mais.', nomeEn:'Full Moon', descEn:'Mythic fish appear 5x more.',        fx:{ mitico:5 } },
  { id:'tubaroes',emoji:'🦈', nome:'Dia de Tubarões',    desc:'Peixes grandes valem o dobro.', nomeEn:'Shark Day', descEn:'Big fish are worth double.',          fx:{ grande:2 } },
  { id:'calmo',   emoji:'😴', nome:'Dia Calmo',          desc:'Sem efeitos negativos, mas +1 isco grátis.', nomeEn:'Calm Day', descEn:'No negative effects, +1 free bait.', fx:{ iscoGratis:1 } },
  { id:'mare',    emoji:'💨', nome:'Maré Favorável',     desc:'Espera -40%: pesca muito mais rápida.', nomeEn:'Favorable Tide', descEn:'-40% wait: much faster fishing.',  fx:{ espera:0.6 } },
  { id:'dourado', emoji:'💰', nome:'Dia Dourado',        desc:'+30% de valor em todas as capturas.', nomeEn:'Golden Day', descEn:'+30% value on every catch.',    fx:{ valor:1.3 } },
  { id:'polvos',  emoji:'🐙', nome:'Invasão de Polvos',  desc:'Incomuns e superiores aparecem +50%.', nomeEn:'Octopus Invasion', descEn:'Uncommon and better appear 50% more.',   fx:{ naoComum:1.5 } }
];

/* ==========================================================================
   CONQUISTAS — metas de longo prazo que dão Pérolas
   ========================================================================== */
const CONQUISTAS_CATS = [
  { id:'pesca',     nome:'Pesca',                 nomeEn:'Fishing' },
  { id:'chefe',     nome:'Chefes',                nomeEn:'Bosses' },
  { id:'progresso', nome:'Progresso',             nomeEn:'Progress' },
  { id:'colecao',   nome:'Coleção',               nomeEn:'Collection' },
  { id:'sessao',    nome:'Sessões & Economia',    nomeEn:'Sessions & Economy' }
];

const CONQUISTAS = [
  /* Pesca */
  { id:'peixes_50',        categoria:'pesca', tipo:'peixes',    alvo:50,     premio:2, icone:'peixe',   nome:'Primeira Rede',        nomeEn:'First Net',          desc:'Apanha {n} peixes.',                 descEn:'Catch {n} fish.' },
  { id:'peixes_250',       categoria:'pesca', tipo:'peixes',    alvo:250,    premio:3, icone:'peixe',   nome:'Pescador de Bairro',   nomeEn:'Neighborhood Fisher', desc:'Apanha {n} peixes.',                 descEn:'Catch {n} fish.' },
  { id:'peixes_1000',      categoria:'pesca', tipo:'peixes',    alvo:1000,   premio:5, icone:'peixe',   nome:'Veterano do Cais',     nomeEn:'Dock Veteran',       desc:'Apanha {n} peixes.',                 descEn:'Catch {n} fish.' },
  { id:'peixes_5000',      categoria:'pesca', tipo:'peixes',    alvo:5000,   premio:8, icone:'peixe',   nome:'Lenda do Mar',         nomeEn:'Sea Legend',         desc:'Apanha {n} peixes.',                 descEn:'Catch {n} fish.' },
  { id:'perfeitos_25',     categoria:'pesca', tipo:'perfeitos', alvo:25,     premio:2, icone:'alvo',    nome:'Mão Firme',            nomeEn:'Steady Hand',        desc:'Faz {n} acertos perfeitos.',          descEn:'Land {n} perfect hits.' },
  { id:'perfeitos_100',    categoria:'pesca', tipo:'perfeitos', alvo:100,    premio:4, icone:'alvo',    nome:'Timing de Mestre',     nomeEn:'Master Timing',      desc:'Faz {n} acertos perfeitos.',          descEn:'Land {n} perfect hits.' },
  { id:'combo_12',         categoria:'pesca', tipo:'combo',     alvo:12,     premio:4, icone:'raio',    nome:'Sequência Perfeita',   nomeEn:'Perfect Streak',     desc:'Alcança um combo de {n}.',           descEn:'Reach a {n} combo.' },

  /* Chefes */
  { id:'chefes_5',         categoria:'chefe', tipo:'chefes',       alvo:5,  premio:3, icone:'trofeu', nome:'Caçador de Chefes',    nomeEn:'Boss Hunter',        desc:'Apanha {n} chefes do dia.',           descEn:'Catch {n} daily bosses.' },
  { id:'chefes_25',        categoria:'chefe', tipo:'chefes',       alvo:25, premio:5, icone:'trofeu', nome:'Domador de Chefes',    nomeEn:'Boss Tamer',         desc:'Apanha {n} chefes do dia.',           descEn:'Catch {n} daily bosses.' },
  { id:'chefes_100',       categoria:'chefe', tipo:'chefes',       alvo:100, premio:8, icone:'trofeu', nome:'Pesadelo dos Chefes',  nomeEn:'Boss Nightmare',     desc:'Apanha {n} chefes do dia.',           descEn:'Catch {n} daily bosses.' },
  { id:'chefe_abissal_1',  categoria:'chefe', tipo:'chefeAbissal', alvo:1,  premio:2, icone:'abismo', nome:'Primeiro Abismo',      nomeEn:'First Abyss',        desc:'Apanha {n} chefe abissal.',           descEn:'Catch {n} abyssal boss.' },
  { id:'chefe_abissal_10', categoria:'chefe', tipo:'chefeAbissal', alvo:10, premio:6, icone:'abismo', nome:'Senhor das Fossas',    nomeEn:'Lord of the Trenches', desc:'Apanha {n} chefes abissais.',        descEn:'Catch {n} abyssal bosses.' },

  /* Progresso */
  { id:'epoca_3',          categoria:'progresso', tipo:'epoca',   alvo:3,   premio:3,  icone:'estrela', nome:'Nova Era',             nomeEn:'New Era',            desc:'Chega à Época {n}.',                 descEn:'Reach Season {n}.' },
  { id:'epoca_5',          categoria:'progresso', tipo:'epoca',   alvo:5,   premio:5,  icone:'estrela', nome:'Ciclo Eterno',         nomeEn:'Eternal Cycle',      desc:'Chega à Época {n}.',                 descEn:'Reach Season {n}.' },
  { id:'epoca_10',         categoria:'progresso', tipo:'epoca',   alvo:10,  premio:8,  icone:'estrela', nome:'Lenda Imortal',        nomeEn:'Immortal Legend',    desc:'Chega à Época {n}.',                 descEn:'Reach Season {n}.' },
  { id:'estrelas_25',      categoria:'progresso', tipo:'estrelas',alvo:25,  premio:4,  icone:'estrela', nome:'Constelação',          nomeEn:'Constellation',      desc:'Junta {n} estrelas.',                 descEn:'Collect {n} stars.' },
  { id:'estrelas_50',      categoria:'progresso', tipo:'estrelas',alvo:50,  premio:6,  icone:'estrela', nome:'Céu Completo',         nomeEn:'Full Sky',           desc:'Junta {n} estrelas.',                 descEn:'Collect {n} stars.' },
  { id:'estrelas_100',     categoria:'progresso', tipo:'estrelas',alvo:100, premio:10, icone:'estrela', nome:'Galáxia',              nomeEn:'Galaxy',             desc:'Junta {n} estrelas.',                 descEn:'Collect {n} stars.' },
  { id:'streak_7',         categoria:'progresso', tipo:'streak',  alvo:7,   premio:2,  icone:'fogo',    nome:'Semana Perfeita',      nomeEn:'Perfect Week',       desc:'Mantém um streak de {n} dias.',       descEn:'Keep a {n}-day streak.' },
  { id:'streak_30',        categoria:'progresso', tipo:'streak',  alvo:30,  premio:5,  icone:'fogo',    nome:'Mês de Maré',          nomeEn:'Month of Tides',     desc:'Mantém um streak de {n} dias.',       descEn:'Keep a {n}-day streak.' },
  { id:'streak_100',       categoria:'progresso', tipo:'streak',  alvo:100, premio:10, icone:'fogo',    nome:'Cem Dias',             nomeEn:'Hundred Days',       desc:'Mantém um streak de {n} dias.',       descEn:'Keep a {n}-day streak.' },

  /* Coleção */
  { id:'livro_sup_15',     categoria:'colecao', tipo:'livroSuperficie', alvo:15, premio:2, icone:'medalha', nome:'Meio Livro',           nomeEn:'Half Book',          desc:'Descobre {n} espécies de superfície.', descEn:'Discover {n} surface species.' },
  { id:'livro_sup_30',     categoria:'colecao', tipo:'livroSuperficie', alvo:30, premio:5, icone:'medalha', nome:'Livro Completo',       nomeEn:'Complete Book',      desc:'Descobre {n} espécies de superfície.', descEn:'Discover {n} surface species.' },
  { id:'livro_abismo_5',   categoria:'colecao', tipo:'livroAbismo',     alvo:5,  premio:3, icone:'abismo',  nome:'Descida Inicial',      nomeEn:'First Descent',      desc:'Descobre {n} espécies abissais.',     descEn:'Discover {n} abyssal species.' },
  { id:'livro_abismo_15',  categoria:'colecao', tipo:'livroAbismo',     alvo:15, premio:7, icone:'abismo',  nome:'Cartógrafo do Abismo', nomeEn:'Abyss Cartographer', desc:'Descobre {n} espécies abissais.',     descEn:'Discover {n} abyssal species.' },
  { id:'abissais_100',     categoria:'colecao', tipo:'abissais',        alvo:100, premio:4, icone:'abismo', nome:'Habitué do Fundo',     nomeEn:'Deep Regular',       desc:'Apanha {n} peixes abissais.',         descEn:'Catch {n} abyssal fish.' },
  { id:'abissais_500',     categoria:'colecao', tipo:'abissais',        alvo:500, premio:8, icone:'abismo', nome:'Filho das Fossas',     nomeEn:'Child of the Trenches', desc:'Apanha {n} peixes abissais.',      descEn:'Catch {n} abyssal fish.' },

  /* Sessões & Economia */
  { id:'moedas_100k',      categoria:'sessao', tipo:'moedasTotal',       alvo:100000,   premio:2,  icone:'moeda',   nome:'Bolso Cheio',       nomeEn:'Full Pockets',       desc:'Ganha {n} moedas no total.',          descEn:'Earn {n} coins in total.' },
  { id:'moedas_1m',        categoria:'sessao', tipo:'moedasTotal',       alvo:1000000,  premio:4,  icone:'moeda',   nome:'Magnata',           nomeEn:'Tycoon',             desc:'Ganha {n} moedas no total.',          descEn:'Earn {n} coins in total.' },
  { id:'moedas_100m',      categoria:'sessao', tipo:'moedasTotal',       alvo:100000000,premio:7,  icone:'moeda',   nome:'Fortuna Abissal',   nomeEn:'Abyssal Fortune',    desc:'Ganha {n} moedas no total.',          descEn:'Earn {n} coins in total.' },
  { id:'moedas_1b',        categoria:'sessao', tipo:'moedasTotal',       alvo:1000000000,premio:10,icone:'moeda',   nome:'Bilião',            nomeEn:'Billionaire',        desc:'Ganha {n} moedas no total.',          descEn:'Earn {n} coins in total.' },
  { id:'sessoes_25',       categoria:'sessao', tipo:'sessoes',           alvo:25,  premio:3, icone:'ampulheta', nome:'Rotina',            nomeEn:'Routine',            desc:'Completa {n} sessões.',               descEn:'Complete {n} sessions.' },
  { id:'sessoes_100',      categoria:'sessao', tipo:'sessoes',           alvo:100, premio:6, icone:'ampulheta', nome:'Dedicação',         nomeEn:'Dedication',         desc:'Completa {n} sessões.',               descEn:'Complete {n} sessions.' },
  { id:'anuncios_10',      categoria:'sessao', tipo:'anuncios',          alvo:10,  premio:2, icone:'tv',       nome:'Patrocinado',        nomeEn:'Sponsored',          desc:'Vê {n} anúncios recompensados.',      descEn:'Watch {n} rewarded ads.' },
  { id:'anuncios_50',      categoria:'sessao', tipo:'anuncios',          alvo:50,  premio:4, icone:'tv',       nome:'Apoiante',           nomeEn:'Supporter',          desc:'Vê {n} anúncios recompensados.',      descEn:'Watch {n} rewarded ads.' },
  { id:'melhor_sessao_1m', categoria:'sessao', tipo:'melhorSessaoMoedas',alvo:1000000,  premio:4, icone:'trofeu', nome:'Sessão de Ouro',   nomeEn:'Golden Session',     desc:'Faz {n} moedas numa sessão.',         descEn:'Earn {n} coins in one session.' },
  { id:'melhor_sessao_100m',categoria:'sessao',tipo:'melhorSessaoMoedas',alvo:100000000,premio:8, icone:'trofeu', nome:'Sessão Lendária',  nomeEn:'Legendary Session',  desc:'Faz {n} moedas numa sessão.',         descEn:'Earn {n} coins in one session.' }
];

/* ==========================================================================
   LEGADO — melhorias permanentes compradas com Pérolas
   ========================================================================== */
const LEGADO = [
  { id:'tempo',    max:4, custo:[3,5,7,9],       efeito:15,   icone:'ampulheta', nome:'Maré Longa',       nomeEn:'Long Tide',        desc:'+{v}s em cada sessão de pesca.',                  descEn:'+{v}s in each fishing session.' },
  { id:'sorte',    max:4, custo:[3,5,7,9],       efeito:0.15, icone:'abismo',    nome:'Sonda Abissal',    nomeEn:'Abyssal Sonar',    desc:'+{v}% de peso da raridade abissal.',              descEn:'+{v}% abyssal rarity weight.' },
  { id:'offline',  max:3, custo:[2,4,6],         efeito:6,    icone:'pescador',  nome:'Rede Funda',       nomeEn:'Deep Net',         desc:'+{v}h no limite de rendimento offline.',          descEn:'+{v}h offline earnings cap.' },
  { id:'anuncios', max:2, custo:[4,8],           efeito:1,    icone:'tv',        nome:'Patrocínio',       nomeEn:'Sponsorship',      desc:'+{v} anúncio recompensado por dia.',              descEn:'+{v} rewarded ad per day.' },
  { id:'inicio',   max:2, custo:[5,10],          efeito:1,    icone:'estrela',   nome:'Herança',          nomeEn:'Legacy',           desc:'Começas cada época com +{v} nível em todos os upgrades.', descEn:'Start each season with +{v} level in all upgrades.' },
  { id:'chefe',    max:2, custo:[8,16],          efeito:1,    icone:'trofeu',    nome:'Troféu do Chefe',  nomeEn:'Boss Trophy',      desc:'Chefe do dia dá +{v}× de bónus.',                 descEn:'Daily boss gives +{v}× bonus.' },
  { id:'combo',    max:2, custo:[4,8],           efeito:2,    icone:'raio',      nome:'Ritmo Perfeito',   nomeEn:'Perfect Rhythm',   desc:'+{v} ao limite de combo.',                        descEn:'+{v} combo cap.' },
  { id:'valor',    max:5, custo:[3,6,9,12,15],   efeito:0.08, icone:'moeda',     nome:'Nome Lendário',    nomeEn:'Legendary Name',   desc:'+{v}% de valor em todas as capturas.',             descEn:'+{v}% value on all catches.' },
  { id:'livro',    max:3, custo:[5,8,11],        efeito:0.01, icone:'medalha',   nome:'Curador',          nomeEn:'Curator',          desc:'+{v}% no bónus de coleção.',                       descEn:'+{v}% collection bonus.' }
];
