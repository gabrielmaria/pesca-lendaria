# ROADMAP — Pesca Lendária

> Nota de ideias para não perder o fio. O jogo fica **congelado por agora**; isto é o plano para expansões futuras, não uma promessa de datas.

## Direção principal: descer mais fundo

**Superfície → Mar Profundo → Fossa → Fontes Hidrotermais → Inferno**

Cada camada nova deve trazer:

- 10–15 peixes novos
- 1 raridade nova
- 1–2 iscas próprias
- 1 chefe da zona
- cenário, fundo da página e botões com paleta própria
- **1 mecânica simples e diferente** (não só multiplicadores maiores)

| Camada | Mecânica | Ambiente |
|---|---|---|
| **Fossa** | Pressão: zona de timing mais estreita, mas recompensa maior | Azul quase negro, falhas e luz rara |
| **Fontes Hidrotermais** | Calor: a barra acelera, mas os peixes valem mais | Negro, laranja e vapor |
| **Inferno** | Fumo/cinza: eventos tapam partes da zona; iscas limpam | Vermelho, brasas e fumo |

Ideia de desbloqueio: seguir a lógica atual — uma camada nova abre com época/livro da camada anterior completo, para não atropelar quem ainda está a começar.

## Regras dos nomes

Manter o nome parvo é parte da identidade do jogo.

- **Base = animal real + profissão/situação absurda.**
  - Ex.: “Sardinha Despistada”, “Polvo Reformado”, “Baleia Fiscal”.
- **O absurdo escala com a profundidade:**
  - Superfície: vida quotidiana, tascas, transportes, feriados.
  - Mar Profundo: burocracia, escritórios, cosmos.
  - Fossa: pressão, geologia, coisas antigas.
  - Fontes Hidrotermais: calor, cozinha, trabalho, sobrevivência.
  - Inferno: condomínio, recursos humanos, papelada eterna, fogo.
- **PT-PT primeiro.** O inglês deve ser adaptado, não traduzido à letra.
- Nomes curtos, com sonoridade engraçada e que caibam no cartão do livro.
- **Nunca mudar os `id` dos peixes** — o `id` é a chave do save; o nome visível pode mudar.
- Exceções assumidas: **Kraken**, **Cetus** e **Dragão** são criaturas míticas, não espécies reais.
- Pendente: **“Golo Apressado”** usa “golo” (futebol), não um animal. Se quisermos uma base real, trocar por algo como **“Pargo Apressado”**, mantendo o `id` `golo_apressado`.

## Backlog de outras ideias

Ainda por decidir; não é obrigatório implementar tudo.

- **Variantes de peixe**: Gigante, Dourado e Brilhante (bónus e efeitos visuais).
- **Farol & Aquário**: sink de moedas para depois dos upgrades, com bónus permanentes e coleção visual.
- **Desafios semanais**: modificadores e recompensas em Pérolas.
- **Árvore de prestígio**: trocar o +8% plano por escolhas de valor, raridade, tempo, offline e chefe.
- **Novo bioma**: rio, lago ou zona vulcânica, com livro e chefe próprios.
- **Estatísticas e recordes**: totais, melhores capturas e partilha com imagem gerada.
- **Acessibilidade**: opções para daltonismo, mais contraste e menos movimento.

## Checklist para adicionar uma camada

- [ ] Definir o tema e a mecânica da camada
- [ ] Adicionar 10–15 peixes em `assets/js/data.js` (PT-PT + EN)
- [ ] Adicionar raridade nova e cor em `styles.css` / `data.js`
- [ ] Adicionar iscas e chefe da zona
- [ ] Criar cenário, fundo da página e tema dos botões
- [ ] Adicionar vista no Livro e conquistas
- [ ] Passar pelo equilíbrio (valores, chances, custos)
- [ ] Testar save antigo e modo Superfície
- [ ] Atualizar `assets/js/updates.js` e subir `APP_VERSION`
- [ ] Atualizar README e este ROADMAP

## Princípios de equilíbrio

- Cada camada é uma **nova coleção/desafio**, não apenas “+1000% de valor”.
- Manter a regra dos **180 segundos a cada 12 horas**.
- Não invalidar o conteúdo anterior: o Mar Profundo continua útil depois de abrir a Fossa.
- Uma mecânica nova por camada, simples de explicar em duas linhas.
- O jogo tem de continuar a funcionar bem no telemóvel e sem backend.

---

Última atualização: 12/11/2026.
