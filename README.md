# 🎣 Pesca Lendária

Tycoon de pesca para browser com uma regra central: **só podes pescar 180 segundos por dia**.

O jogo é um único ficheiro `index.html` — HTML, CSS e JavaScript puro, sem frameworks, sem bibliotecas externas e sem imagens externas (só emojis e CSS). Os dados são guardados em `localStorage`.

## Como jogar

Abre o `index.html` num browser (duplo clique ou serve a pasta):

```bash
# opção simples, sem dependências
python3 -m http.server 8080
# depois abre http://localhost:8080
```

- **LANÇAR** → espera curta → **MORDE!** → toca na zona verde.
- Perfeito dá +50% de valor; falhar deixa o peixe escapar.
- 30 espécies para colecionar no **Livro de Pesca**.
- 5 upgrades (Cana, Isco, Barco, Pescador Contratado, Geleira), 10 níveis cada.
- Pescadores contratados rendem moedas mesmo offline (até 24 h).
- Um evento do dia igual para todos os jogadores, gerado por hash da data.
- O dia reinicia à meia-noite local; o tempo só desconta com o separador visível.

## Estrutura

| Zona do ficheiro | Conteúdo |
|---|---|
| `<style>` | Tema escuro azul-marinho com acentos neon, animações CSS e suporte a `prefers-reduced-motion` |
| `CONFIG` | Todos os números de equilíbrio (tempos, custos, probabilidades, multiplicadores) |
| `RARIDADES` | Pesos, multiplicadores e cores das 6 raridades |
| `PEIXES` | As 30 espécies editáveis |
| `EVENTOS` | Os 8 eventos diários e respetivos efeitos |
| `UPGRADES_DADOS` | Nomes, ícones e descrições dos 5 upgrades |
| Restante JS | Estado, persistência, ciclo de pesca, render e integração |

## Ajustar o equilíbrio

Tudo o que é número está no objeto `CONFIG`, no topo do `<script>`:

- `DIA_SEGUNDOS` — tempo de pesca diário
- `ESPERA_MIN_MS` / `ESPERA_MAX_MS` / `BARRA_MS` — ritmo do ciclo
- `ZONA_BASE` / `JANELA_PERFEITA` — dificuldade do timing
- `CUSTO_BASE` / `CRESCIMENTO` — economia dos upgrades
- `BARCO_VALOR_NIVEL` / `GELEIRA_VALOR_NIVEL` / `ISCO_SHIFT_NIVEL` — força dos upgrades
- `PESCADOR_MOEDAS_MIN` — rendimento passivo
- `PRIMEIRO_DIA_RARIDADE` / `PRIMEIRO_UPGRADE_GRATIS` — primeira experiência
- `ANUNCIO_SEGUNDOS` / `ANUNCIO_MAX_DIA` — anúncio recompensado (simulado)
- `OFFLINE_CAP_HORAS` — limite do rendimento offline

## Anúncios

O bloco `#ad-banner` (320×100) e a função `verAnuncio()` estão marcados com comentários
`LIGAR SDK REAL MAIS TARDE`, prontos para ligar a um SDK de anúncios recompensados.

## Publicar (GitHub Pages)

1. Cria um repositório no GitHub e adiciona o remoto.
2. `git push -u origin main`
3. Em **Settings → Pages**, escolhe a branch `main` e a pasta `/ (root)`.
