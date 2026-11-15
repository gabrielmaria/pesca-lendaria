"use strict";

/* ==========================================================================
   Pesca Lendária: updates.js
   Versão atual e histórico de novidades (PT/EN).
   Carregado depois de data.js.
   ========================================================================== */

const APP_VERSION = '1.5.10';

const ATUALIZACOES = [
  {
    versao: '1.5.10',
    data: '15/11/2026',
    titulo: 'Peixe-caramelo',
    tituloEn: 'Snailfish',
    itens: [
      'A Medusa do Núcleo deu lugar ao Peixe-Caramelo das Fossas.',
      'É uma espécie hadal real, para a Fossa não ter alforrecas.',
      'O id antigo mantém-se para não quebrar saves.'
    ],
    itensEn: [
      'Core Jellyfish is now the Hadal Snailfish.',
      'A real hadal species, so the Trench no longer has jellyfish.',
      'The old id is kept so saves do not break.'
    ]
  },
  {
    versao: '1.5.9',
    data: '15/11/2026',
    titulo: 'Vida da Fossa',
    tituloEn: 'Trench life',
    itens: [
      'Saíram as medusas e as fissuras pontiagudas da Fossa.',
      'Entraram anfípodes hadal e paredes de sedimento arredondadas.',
      'A transição para a Fossa também troca medusas por anfípodes.'
    ],
    itensEn: [
      'Removed the jellyfish and spiky cracks from the Trench.',
      'Added hadal amphipods and rounded sediment walls.',
      'The descent into the Trench now uses amphipods instead of jellyfish.'
    ]
  },
  {
    versao: '1.5.8',
    data: '15/11/2026',
    titulo: 'Fluidez extra',
    tituloEn: 'Extra smoothness',
    itens: [
      'O sonar do cenário só pulsa quando a ferramenta está armada.',
      'Luz, plâncton e animações do céu escondido deixam de correr no fundo.',
      'Se detetar menos de ~50 FPS ou muitos frames lentos, ativa sozinho o modo de fluidez.',
      'Podes forçar todos os efeitos com ?fx=full.'
    ],
    itensEn: [
      'The scenery sonar only pulses while the tool is armed.',
      'Light, plankton and hidden-sky animations stop running in the deep.',
      'If it detects under ~50 FPS or many slow frames, it automatically enables fluidity mode.',
      'You can force all effects with ?fx=full.'
    ]
  },
  {
    versao: '1.5.7',
    data: '15/11/2026',
    titulo: 'Fluidez',
    tituloEn: 'Smoothness',
    itens: [
      'Animações da Fossa passam a usar transform e opacity, mais leves para a GPU.',
      'Removidas animações contínuas de página inteira e efeitos de layout.',
      'A loja de ferramentas deixou de ser reconstruída a cada captura.',
      'O HUD só redesenha quando os valores mudam.',
      'Bolhas e poeira mantêm o efeito, mas com menos trabalho de pintura.'
    ],
    itensEn: [
      'Trench animations now use transform and opacity, which are lighter on the GPU.',
      'Removed continuous full-page animations and layout-triggering effects.',
      'The tool shop is no longer rebuilt on every catch.',
      'The HUD only redraws when values change.',
      'Bubbles and dust keep the effect with less paint work.'
    ]
  },
  {
    versao: '1.5.6',
    data: '15/11/2026',
    titulo: 'Pressão da Fossa',
    tituloEn: 'Trench Pressure',
    itens: [
      'Nova transição para a Fossa: fendas, sonar, poeira e leitura de profundidade.',
      'Tema da Fossa renovado: HUD, cartões, cenário, livro e botões em violeta e rosa.',
      'Fossa mais difícil: zona mais estreita, barra mais rápida e janela perfeita menor.',
      'Upgrades +15% no Mar Profundo e +30% na Fossa, porque o fundo paga melhor.',
      'Ferramentas ativas: Sonar de Pressão e Garra Hidráulica.'
    ],
    itensEn: [
      'New Trench descent: cracks, sonar, dust and a depth readout.',
      'Reworked Trench theme: HUD, cards, scenery, book and buttons in violet and pink.',
      'Harder Trench: narrower zone, faster bar and a smaller perfect window.',
      'Upgrades +15% in the Deep Sea and +30% in the Trench, because the deep pays better.',
      'Active tools: Pressure Sonar and Hydraulic Claw.'
    ]
  },
  {
    versao: '1.5.5',
    data: '15/11/2026',
    titulo: 'A Fossa',
    tituloEn: 'The Trench',
    itens: [
      'Nova zona: a Fossa abre na Época 5 ou com 10 espécies abissais.',
      'Raridade Hadal (×12000) e 13 espécies novas, com livro próprio.',
      'Iscas Fossa e Pressão, chefe da Fossa (×8) e 3 conquistas novas.'
    ],
    itensEn: [
      'New zone: the Trench unlocks at Season 5 or with 10 abyssal species.',
      'Hadal rarity (×12000) and 13 new species, with their own book.',
      'Trench and Pressure baits, a Trench boss (×8) and 3 new achievements.'
    ]
  },
  {
    versao: '1.5.4',
    data: '15/11/2026',
    titulo: 'Patrocinador +60s',
    tituloEn: 'Sponsor +60s',
    itens: [
      'Novo patrocinador interno no fim da sessão: 15s para ganhar +60s de pesca.',
      'Preparado para trocar pelo rewarded real quando o H5 Games Ads estiver disponível.'
    ],
    itensEn: [
      'New internal sponsor at the end of the session: 15s to earn +60s of fishing.',
      'Ready to switch to real rewarded ads when H5 Games Ads is available.'
    ]
  },
  {
    versao: '1.5.3',
    data: '12/11/2026',
    titulo: 'Cenários da transição',
    tituloEn: 'Transition scenery',
    itens: [
      'Rochas e medusas bioluminescentes ao descer para o Mar Profundo.',
      'Colinas, árvores e o farol no fim da subida à superfície.'
    ],
    itensEn: [
      'Rocks and bioluminescent jellyfish when descending to the Deep Sea.',
      'Hills, trees and the lighthouse at the end of the ascent to the surface.'
    ]
  },
  {
    versao: '1.5.2',
    data: '12/11/2026',
    titulo: 'Vida na transição',
    tituloEn: 'Life in the transition',
    itens: [
      '5 peixes a nadar ao trocar de ambiente.',
      'Árvores no fim da subida, como se estivesses a chegar à superfície.'
    ],
    itensEn: [
      '5 fish swimming when switching environments.',
      'Trees at the end of the ascent, as if you were arriving at the surface.'
    ]
  },
  {
    versao: '1.5.1',
    data: '12/11/2026',
    titulo: 'Transição de profundidade',
    tituloEn: 'Depth transition',
    itens: [
      'Animação de água ao descer para o Mar Profundo.',
      'Animação de subida ao voltar à superfície.',
      'Bolhas e texto de direção durante a mudança de ambiente.'
    ],
    itensEn: [
      'Water animation when descending to the Deep Sea.',
      'Ascent animation when returning to the surface.',
      'Bubbles and direction text while switching environments.'
    ]
  },
  {
    versao: '1.5.0',
    data: '12/11/2026',
    titulo: 'Novidades',
    tituloEn: 'What’s new',
    itens: [
      'Nova zona de atualizações, disponível no rodapé.',
      'Aviso automático na primeira visita a cada versão.',
      'Histórico com as mudanças mais recentes do jogo.'
    ],
    itensEn: [
      'New updates area, available in the footer.',
      'Automatic notice on the first visit to each version.',
      'History with the latest game changes.'
    ]
  },
  {
    versao: '1.4.0',
    data: '12/11/2026',
    titulo: 'Legado',
    tituloEn: 'Legacy',
    itens: [
      '37 conquistas de longo prazo que dão Pérolas.',
      'Loja com 9 melhorias permanentes.',
      'Chefes do dia dão 1 Pérola; o chefe abissal dá 2.'
    ],
    itensEn: [
      '37 long-term achievements that award Pearls.',
      'Shop with 9 permanent upgrades.',
      'Daily bosses give 1 Pearl; the abyssal boss gives 2.'
    ]
  },
  {
    versao: '1.3.0',
    data: '12/11/2026',
    titulo: 'Mar Profundo',
    tituloEn: 'Deep Sea',
    itens: [
      'Novo modo Superfície / Mar Profundo com cenário e fundo próprios.',
      '15 espécies abissais, raridade Abissal e duas iscas dedicadas.',
      'Chefe abissal a cada 4 dias, com bónus ×6.',
      'Novo livro de pesca abissal.'
    ],
    itensEn: [
      'New Surface / Deep Sea mode with its own scene and page background.',
      '15 abyssal species, the Abyssal rarity and two dedicated baits.',
      'Abyssal boss every 4 days, with a ×6 bonus.',
      'New abyssal fishing book.'
    ]
  },
  {
    versao: '1.2.0',
    data: '09/11/2026',
    titulo: 'O jogo',
    tituloEn: 'The game',
    itens: [
      '180 segundos de pesca a cada 12 horas.',
      'Livro com 30 espécies de superfície.',
      'Chefe, evento e missão diários.',
      'Prestígio com estrelas permanentes.',
      'Pescadores a render moedas offline.'
    ],
    itensEn: [
      '180 seconds of fishing every 12 hours.',
      'Book with 30 surface species.',
      'Daily boss, event and mission.',
      'Prestige with permanent stars.',
      'Fishermen earning coins offline.'
    ]
  }
];
