# 🎣 Pesca Lendária — Pixel Edition

Tycoon de pesca para browser com uma regra central: **só podes pescar 180 segundos por dia**.

Um único ficheiro `index.html` — HTML, CSS e JavaScript puro, sem frameworks, bibliotecas ou imagens externas.
O visual é pixel art inspirado em jogos de fazenda: madeira, papel, mar e **sprites desenhados pixel a pixel em `<canvas>`** pelo próprio código (peixes, barco, cana, ícones e sol).

## Como jogar

```bash
python3 -m http.server 8080
# abre http://localhost:8080
```

- **LANÇAR** → espera curta → **MORDE!** → toca na zona verde.
- **Perfeito** dá +50% e sobe o **combo** (até ×2,2); falhar zera o combo.
- A barra de timing **acelera** à medida que o combo sobe — mais risco, mais recompensa.
- Cada peixe tem **peso aleatório** (0,85× a 1,35× no valor).
- **Missão do dia** (determinística): apanhar peixes, raros+ ou acertos perfeitos, com prémio em moedas.
- 30 espécies para colecionar no **Livro de Pesca**, com selo por raridade completa.
- 5 upgrades (Cana, Isco, Barco, Pescador Contratado, Geleira), 10 níveis cada.
- Pescadores rendem moedas mesmo offline (até 24 h).
- Evento do dia igual para todos, gerado por hash da data; efeitos visuais na cena (chuva, nevoeiro, lua…).
- O dia reinicia à meia-noite local; o tempo só desconta com o separador visível (Page Visibility API).

## Equilíbrio (foi rebalanceado)

A progressão foi simulada: com jogo diário completo, **maxar os 5 upgrades leva ~3 semanas** (mediana de 22 dias numa simulação de 15 partidas). Sem sorte grande, a primeira sessão dá apenas alguns níveis.

Ideias-chave do novo equilíbrio:

- Os **valores base dos peixes são planos por raridade** (8 a 44). Quem escala o valor é o multiplicador de raridade (1× a 1000×) — antes os dois escalavam ao mesmo tempo e qualquer lendário comprava tudo.
- Custos a crescer **×2 por nível** (antes ×1,5), com base 300–1000.
- **Isco** agora tem multiplicadores por escalão (Incomum+ até Mítico), em vez de um bónus fraco.
- **Pescador** com rendimento quadrático suave e cap offline de 24 h.

Tudo ajustável no objeto `CONFIG` no topo do `<script>`:

| Quero… | Variável |
|---|---|
| Tempo diário | `DIA_SEGUNDOS` |
| Ritmo do ciclo | `ESPERA_MIN_MS`, `ESPERA_MAX_MS`, `BARRA_MS` |
| Dificuldade do timing | `ZONA_BASE`, `JANELA_PERFEITA` |
| Força do combo | `COMBO_MAX`, `COMBO_PASSO`, `BARRA_ACELERA_COMBO` |
| Economia | `CUSTO_BASE`, `CRESCIMENTO` |
| Upgrades | `BARCO_VALOR_NIVEL`, `GELEIRA_VALOR_NIVEL`, `ISCO_*` |
| Passivo | `PESCADOR_MOEDAS_MIN`, `PESCADOR_ESCALA`, `OFFLINE_CAP_HORAS` |
| Missões | `MISSAO` |
| Anúncios | `ANUNCIO_SEGUNDOS`, `ANUNCIO_MAX_DIA` |

## Trocar o tema

- **Peixes:** array `PEIXES` (`id, nome, emoji, r, base`). O emoji decide o sprite: 🐟 peixe, 🦈 tubarão, 🐡 baiacu, 🐙 polvo, 🦑 lula, 🦀 caranguejo, 🐋/🐳 baleia, 🐉 dragão.
- **Eventos:** array `EVENTOS` com efeitos em `fx` (`espera`, `valor`, `grande`, `raro`, `naoComum`, `mitico`, `iscoGratis`).
- **Upgrades:** `UPGRADES_DADOS` + `SPRITE_UP` (ícones) + `efeitoTexto()`.
- **Cores:** variáveis CSS em `:root`.

## Reiniciar para testar

- No separador **Upgrades** existe o botão **↺ Apagar progresso** (pede confirmação).
- Ou abre o jogo com **`?reset`** no endereço (ex.: `index.html?reset`) — apaga a progressão e limpa o parâmetro do URL.
- Manualmente: DevTools → Application → Local Storage → apagar a chave `pescaLendaria.v2`.

## Anúncios

`#ad-banner` (320×100) e `verAnuncio()` estão marcados com `LIGAR SDK REAL MAIS TARDE`.

## Publicar (GitHub Pages)

1. `git push`
2. **Settings → Pages** → branch `main`, pasta `/ (root)`.

> Nota: o save mudou de chave (`pescaLendaria.v2`) porque o equilíbrio foi refeito — quem já tinha tudo no máximo recomeça com a nova economia.
