# 🎣 Pesca Lendária — Pixel Edition

Tycoon de pesca para browser com uma regra central: **só podes pescar 180 segundos a cada 12 horas** (duas sessões por dia).

Um único ficheiro `index.html` — HTML, CSS e JavaScript puro, sem frameworks, bibliotecas ou imagens externas.
Todo o visual é pixel art (à Celeste/Stardew): **sprites desenhados pixel a pixel em `<canvas>` pelo próprio código** — peixes, chefe do dia, farol, morros, pescador, ícones e eventos. Não há um único emoji na interface.

## Idiomas (PT / EN)

O jogo deteta o idioma do browser (português → PT, resto → EN) e tem um botão **EN/PT** no cabeçalho. A escolha fica guardada.

Para forçar num link de divulgação: `?lang=en` ou `?lang=pt`.

## Como jogar

```bash
python3 -m http.server 8080
# abre http://localhost:8080
```

- **LANÇAR** → espera → **MORDE!** → toca na zona verde.
- **Perfeito** dá +50% e sobe o **combo** (até ×2,2); falhar zera. A barra **acelera** com o combo.
- Cada peixe tem **peso aleatório** (0,85×–1,35× no valor).
- **Escolhe o isco antes de lançar**: Comum (equilíbrio), Rápida (−35% espera, −15% valor), Funda (+50% raros, +35% espera) e, a partir da Época 3, **Abissal** e **Relíquia**.
- **Chefe do dia**: um peixe épico+ diferente todos os dias. Aparece após algumas capturas, dá **×4** e muda à meia-noite — é a razão para voltares. A cada 4 dias o chefe é **abissal** (×6).
- **Missão do dia** (peixes / raros+ / perfeitos) com prémio que escala.
- **Livro de Pesca**: 30 espécies de superfície; cada raridade completa dá **+5% de valor permanente** (até +30%).
- **Mar Profundo (endgame)**: abre na **Época 3**. No topo da pesca escolhes **Superfície** ou **Mar Profundo**; no fundo o cenário muda (água escura, plâncton, bolhas) e só lá aparecem as **15 espécies abissais**. Tem a raridade **Abissal** (×5000), duas iscas próprias (**Abissal** e **Relíquia**) e um **chefe abissal** (×6) a cada 4 dias. Escolher uma isca abissal desce automaticamente. Completar a raridade abissal dá mais **+5%** (total +35%).
- **Nova Época (prestígio)**: aos 30 níveis de upgrades podes recomeçar trocando progresso por **estrelas permanentes (+8% de valor cada)**. O Livro, o Mar Profundo e o streak ficam.
- **Fim de cada sessão** mostra o resumo, o **evento de amanhã** e a contagem para a próxima sessão.
- Pescadores rendem moedas offline (até 24h). A sessão renova a cada **12h**; o evento, a missão e o chefe são **diários**. O tempo só desconta com o separador visível (Page Visibility API).

## Equilíbrio

Economia simulada: maxar os 5 upgrades leva **~3 semanas** de jogo (duas sessões de 3 minutos por dia). A primeira sessão dá poucos níveis.

Princípios:

- Valores base dos peixes **planos por raridade** (8–44); quem escala é o multiplicador de raridade (1× a 1000×).
- Custos a crescer **×2 por nível** (base 300–1000 → 4,1M no total).
- Isco com multiplicadores **por escalão** (Incomum+ → Mítico).
- Pescador com rendimento quadrático suave e cap offline.
- Chefe diário e bónus de coleção adicionam receita, mas exigem jogar.

Tudo ajustável no `CONFIG` no topo do `<script>`:

| Quero… | Variável |
|---|---|
| Tempo diário | `DIA_SEGUNDOS` |
| Ritmo do ciclo | `ESPERA_MIN_MS`, `ESPERA_MAX_MS`, `BARRA_MS` |
| Dificuldade do timing | `ZONA_BASE`, `JANELA_PERFEITA` |
| Combo | `COMBO_MAX`, `COMBO_PASSO`, `BARRA_ACELERA_COMBO` |
| Economia | `CUSTO_BASE`, `CRESCIMENTO` |
| Upgrades | `BARCO_VALOR_NIVEL`, `GELEIRA_VALOR_NIVEL`, `ISCO_*` |
| Iscas | `ISCAS` |
| Chefe do dia | `CHEFE_*` |
| Coleção | `COLECAO_BONUS` |
| Prestígio | `EPOCA_NIVEIS`, `EPOCA_POR_NIVEL`, `EPOCA_ESTRELA` |
| Mar Profundo | `ABISMO_EPOCA`, `ABISMO_PESO`, `ISCO_ABISSO`, `CHEFE_BONUS_ABISMO`, `CHEFE_ABISMO_DIAS` |
| Passivo | `PESCADOR_MOEDAS_MIN`, `PESCADOR_ESCALA`, `OFFLINE_CAP_HORAS` |
| Missões | `MISSAO` |
| Anúncios | `ANUNCIO_SEGUNDOS`, `ANUNCIO_MAX_DIA` |

## Trocar o tema

- **Peixes:** array `PEIXES` (`id, nome, emoji, r, base`). O emoji é só a "assinatura" que escolhe a silhueta: 🐟 peixe, 🦈 tubarão, 🐡 baiacu, 🐙 polvo, 🦑 lula, 🦀 caranguejo, 🐋/🐳 baleia, 🐉 dragão.
- **Eventos:** `EVENTOS` com efeitos em `fx`; o ícone é desenhado por `spriteEvento(id)` (adiciona um `case` para eventos novos).
- **Upgrades:** `UPGRADES_DADOS` + `SPRITE_UP` + `efeitoTexto()`.
- **Cores:** variáveis CSS em `:root`.

## Analytics (visitas e origens)

O jogo usa **GoatCounter** através de um **proxy first-party no Vercel** (`vercel.json`), para reduzir o bloqueio por adblockers:

- `/count` → `https://pescalendaria.goatcounter.com/count`
- `/count.js` → `https://gc.zgo.at/count.js`

No topo do `<script>`:

```js
const ANALYTICS = {
  ativo: true,
  provedor: 'goatcounter',
  goatcounter: '/count',
  script: '/count.js',
  ga4: 'G-XXXXXXXXXX',
  painel: 'https://pescalendaria.goatcounter.com',
  vercelAtivo: false
};
```

- **Dashboard GoatCounter:** <https://pescalendaria.goatcounter.com>
- Divulga com `?ref=reddit_incremental`; cada origem aparece como `origem/...`.
- Abre o site com **`?dono`** para aparecer o botão **Ver estatísticas** no separador Upgrades.
- O jogo envia eventos `captura`, `chefe`, `prestigio`, `partilha` e `anuncio`.

### Vercel Web Analytics (first-party)

1. No painel do Vercel: **Project → Analytics → Enable Web Analytics**.
2. No código, põe `vercelAtivo: true` em `ANALYTICS`.
3. Faz deploy. O Vercel passa a mostrar **visitors, page views, páginas, referrers, países e dispositivos**.

O Vercel Analytics é servido do teu domínio (`/_vercel/insights/script.js`), por isso os adblockers têm muito mais dificuldade em bloqueá-lo. Compara os números com o GoatCounter: a diferença é, aproximadamente, a fatia que estava a ser perdida.

> Nem o Vercel nem o GoatCounter contam a 100%: são JavaScript. Para contagens server-side (incluindo quem bloqueia JS/analytics) só com logs de servidor ou CDN. O `plano` gratuito do Vercel tem limite mensal de eventos.

## Nota para desenvolvimento

O jogo **não tem botão para apagar o progresso** (para os jogadores não perderem tudo por engano). Para testar do zero: DevTools → Application → Local Storage → apagar `pescaLendaria.v2`, ou usar uma janela anónima.

## Anúncios

O jogo suporta dois caminhos, configurados em `const ADS` no topo do `<script>`.

### AdSense no teu site (recomendado para o Vercel)

O publisher ID `ca-pub-5123386402594330` já está no `index.html` e no `ads.txt`.

1. No AdSense cria **duas unidades** de 320×100 (uma para o jogo, outra para o fim do dia).
2. Preenche os slots:
   ```js
   ADS.adsense.slotMain = '1234567890';
   ADS.adsense.slotEnd  = '0987654321';
   ```
3. Ativa a mensagem de consentimento RGPD no AdSense (**Privacy & messaging**) e faz deploy.
4. Sem slots configurados só funcionam os **Auto ads** (se os ativares no AdSense); com slots, os dois espaços manuais enchem.

O jogo mostra um aviso de consentimento; só carrega anúncios depois de **Aceitar**. Os slots ficam escondidos enquanto não houver IDs configurados.

### Rewarded (+60s)

O botão "Ver anúncio: +60s" usa a **Ad Placement API / H5 Games Ads** do Google (a mesma conta AdSense), que é o formato permitido para recompensas:

- `adConfig({ preloadAdBreaks: 'on', sound: 'on' })`
- `adBreak({ type: 'reward' })`
- a recompensa só é dada com `breakStatus === 'viewed'`
- o relógio de pesca pausa durante o anúncio
- se a API não estiver habilitada na conta, o botão diz "anúncio indisponível" e **não dá tempo** (não há recompensa sem anúncio)
- para testar sem rede: `ADS.rewarded = 'simulado'`

Se a H5 Games Ads não estiver disponível na tua conta, a alternativa com rewarded real é um SDK de portal (GameDistribution/CrazyGames) ou uma rede de rewarded.

Páginas de apoio para a aprovação: `privacidade.html` e `sobre.html` (ligadas no rodapé).

### GameDistribution (portal)

Para publicar o jogo no portal da GameDistribution:

```js
ADS.modo = 'gamedistribution';
```

O SDK trata de rewarded e interstitials, mas **só faz sentido quando o jogo é servido no portal** (com o game ID associado). No teu domínio, usa AdSense.

### Notas

- O `#ad-banner` (320×100) continua reservado no fim do dia.
- O consentimento é guardado em `pescaLendariaConsent.v1`.
- Sem consentimento não há pedidos ao Google.
- Para rewarded no teu domínio seria preciso o **H5 Games Ads** (Ad Placement API) ou um SDK de portal.

## Publicar (GitHub Pages)

1. `git push`
2. **Settings → Pages** → branch `main`, pasta `/ (root)`.
