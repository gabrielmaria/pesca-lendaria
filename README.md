# 🎣 Pesca Lendária — Pixel Edition

Tycoon de pesca para browser com uma regra central: **só podes pescar 180 segundos por dia**.

Um único ficheiro `index.html` — HTML, CSS e JavaScript puro, sem frameworks, bibliotecas ou imagens externas.
Todo o visual é pixel art (à Celeste/Stardew): **sprites desenhados pixel a pixel em `<canvas>` pelo próprio código** — peixes, chefe do dia, farol, morros, pescador, ícones e eventos. Não há um único emoji na interface.

## Como jogar

```bash
python3 -m http.server 8080
# abre http://localhost:8080
```

- **LANÇAR** → espera → **MORDE!** → toca na zona verde.
- **Perfeito** dá +50% e sobe o **combo** (até ×2,2); falhar zera. A barra **acelera** com o combo.
- Cada peixe tem **peso aleatório** (0,85×–1,35× no valor).
- **Escolhe o isco antes de lançar**: Comum (equilíbrio), Rápida (−35% espera, −15% valor) ou Funda (+50% raros, +35% espera).
- **Chefe do dia**: um peixe épico+ diferente todos os dias. Aparece após algumas capturas, dá **×4** e muda à meia-noite — é a razão para voltares.
- **Missão do dia** (peixes / raros+ / perfeitos) com prémio que escala.
- **Livro de Pesca**: 30 espécies; cada raridade completa dá **+5% de valor permanente** (até +30%).
- **Nova Época (prestígio)**: aos 30 níveis de upgrades podes recomeçar trocando progresso por **estrelas permanentes (+8% de valor cada)**. O Livro e o streak ficam.
- **Fim do dia** mostra o resumo e **o evento de amanhã** — para saberes o que te espera.
- Pescadores rendem moedas offline (até 24h); o dia reinicia à meia-noite local; o tempo só desconta com o separador visível (Page Visibility API).

## Equilíbrio

Economia simulada: maxar os 5 upgrades leva **~3 semanas** de jogo diário (antes maximizava-se em 3 minutos). A primeira sessão dá poucos níveis.

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
| Passivo | `PESCADOR_MOEDAS_MIN`, `PESCADOR_ESCALA`, `OFFLINE_CAP_HORAS` |
| Missões | `MISSAO` |
| Anúncios | `ANUNCIO_SEGUNDOS`, `ANUNCIO_MAX_DIA` |

## Trocar o tema

- **Peixes:** array `PEIXES` (`id, nome, emoji, r, base`). O emoji é só a "assinatura" que escolhe a silhueta: 🐟 peixe, 🦈 tubarão, 🐡 baiacu, 🐙 polvo, 🦑 lula, 🦀 caranguejo, 🐋/🐳 baleia, 🐉 dragão.
- **Eventos:** `EVENTOS` com efeitos em `fx`; o ícone é desenhado por `spriteEvento(id)` (adiciona um `case` para eventos novos).
- **Upgrades:** `UPGRADES_DADOS` + `SPRITE_UP` + `efeitoTexto()`.
- **Cores:** variáveis CSS em `:root`.

## Analytics (visitas e origens)

Já está configurado com **GoatCounter** (grátis, sem cookies):

```js
const ANALYTICS = {
  ativo: true,
  provedor: 'goatcounter',
  goatcounter: 'https://pescalendaria.goatcounter.com/count',
  ga4: 'G-XXXXXXXXXX',
  painel: 'https://pescalendaria.goatcounter.com'
};
```

- **Dashboard:** <https://pescalendaria.goatcounter.com>
- Divulga com `?ref=reddit_incremental` (ou `utm_source`/`utm_campaign`). Cada origem aparece como `origem/...`.
- Abre o site com **`?dono`** para aparecer o botão **Ver estatísticas** no separador Upgrades (os jogadores não o veem).
- O jogo envia eventos `captura`, `chefe`, `prestigio`, `partilha` e `anuncio`.

Nota: o plano gratuito do GoatCounter é para uso não comercial; se o site passar a ter anúncios, usa o plano pago ou aloja o GoatCounter tu mesmo.

Alternativa: GA4 — `provedor: 'ga4'` e `ga4: 'G-XXXXXXXXXX'`.

O jogo envia eventos `captura`, `chefe`, `prestigio`, `partilha` e `anuncio` para saberes o que as visitas fazem.

## Reiniciar para testar

- Separador **Upgrades** → botão **↺ Apagar progresso**.
- Ou abre com **`?reset`** no endereço.
- Manualmente: DevTools → Application → Local Storage → apagar `pescaLendaria.v2`.

## Anúncios (GameDistribution)

O jogo já traz um adaptador de anúncios. Por defeito está em **modo simulado** (não envia nada para a rede).

Para ligar a **GameDistribution**:

1. Cria conta e regista o jogo em <https://gamedistribution.com>.
2. Publica o `index.html` no portal.
3. No topo do `<script>`, muda `ADS.modo` para `'gamedistribution'`.
4. Opcional: `ADS.intersticialFimDia = true` para um interstitial quando o dia acaba.
5. Enquanto o SDK não carregar, o botão "+60s" mostra "anúncio indisponível" (não dá recompensa sem anúncio).

O SDK pausa o relógio de pesca durante o anúncio (`SDK_GAME_PAUSE` / `SDK_GAME_START`), para não perderes tempo.

O `#ad-banner` (320×100) continua reservado para uma futura integração AdSense no teu site.

## Habilitar anúncios reais

Tudo está em `const ADS` no topo do script:

```js
const ADS = {
  modo: 'simulado',            // 'simulado' | 'gamedistribution'
  sdkUrl: 'https://html5.api.gamedistribution.com/main.min.js',
  intersticialFimDia: false
};
```

## Publicar (GitHub Pages)

1. `git push`
2. **Settings → Pages** → branch `main`, pasta `/ (root)`.
