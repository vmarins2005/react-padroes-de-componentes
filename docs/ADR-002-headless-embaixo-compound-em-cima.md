# ADR-002 — Comportamento no hook headless, aparência no compound component

- **Status:** Aceito
- **Data:** 2026-09-04

## Contexto

Os componentes interativos do design system (abas, disclosure, popover, combobox)
carregam duas naturezas com ciclos de vida muito diferentes:

- **Comportamento e acessibilidade** — papéis ARIA, navegação por teclado, roving
  tabindex, gestão de foco, ids cruzados. É difícil de acertar, quase nunca muda,
  e quando está errado está errado em todos os lugares ao mesmo tempo.
- **Aparência** — espaçamento, cor, tipografia, animação. É fácil, muda a cada
  redesign, e precisa variar por contexto na mesma aplicação.

Acoplar as duas produz o pior dos casos: um redesign obriga a mexer no arquivo
que contém a lógica de acessibilidade, e cada mexida é uma chance de regredir
algo que ninguém testa manualmente.

## Decisão

Arquitetura em duas camadas para todo componente interativo do design system:

1. **Camada headless** — um hook (`useDisclosure`, `useTabs`) que expõe estado,
   handlers e *prop getters* já com os atributos ARIA corretos. Zero markup, zero
   estilo, zero dependência de CSS.
2. **Camada estilizada** — um compound component construído sobre o hook, que é o
   que a maioria das telas consome.

Telas com necessidade visual incompatível com o compound consomem o hook
diretamente, em vez de pedir mais uma prop ao compound.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| Só compound estilizado | Uma camada; consumo trivial | Toda variação visual vira prop; volta à explosão combinatória | É o problema que o projeto inteiro discute |
| Só headless | Máxima flexibilidade | Cada tela reimplementa markup — e reimplementa as falhas de acessibilidade junto | Transfere o trabalho difícil para quem tem menos contexto |
| Adotar Radix/React Aria e estilizar | Acessibilidade auditada por terceiros; economiza meses | Dependência externa; bundle; limites da API deles | **Recomendado em produção**; aqui a implementação própria é o objetivo didático |
| Headless embaixo + compound em cima | Cada natureza no seu ciclo de vida; escape sem escape hatch | Duas camadas para ler; hook vira API pública | **Escolhido** |

## Consequências

**Positivas**
- Um redesign toca apenas a camada estilizada. A lógica de acessibilidade não é
  aberta, logo não regride.
- Uma correção de ARIA no hook conserta todas as peles de uma vez.
- A tela com necessidade excêntrica tem uma saída legítima (usar o hook) que não
  polui a API do compound com escape hatches.
- O hook é testável sem DOM complexo, e a pele é testável visualmente.

**Negativas**
- Duas camadas para entender antes de contribuir. Onboarding fica mais longo.
- O hook passa a ser API pública: mudar a assinatura de um prop getter é breaking
  change para quem o consome direto.
- Existe risco de divergência — uma tela usa o hook e reimplementa o markup com
  um detalhe a menos. Mitigação: teste automatizado de acessibilidade (`axe`) em
  todas as peles, não só na oficial. Ver o projeto [acessibilidade-na-pratica](https://github.com/vmarins2005/acessibilidade-na-pratica).

**Monitorar**
- Se, depois de seis meses, ninguém tiver consumido o hook diretamente, a segunda
  camada não está se pagando e devemos colapsar para um compound simples.
- Se três ou mais telas consumirem o hook com markup semelhante, isso é uma
  segunda pele legítima e deve virar componente do design system.

## Nota transferível

A regra que generaliza esta decisão: **separe pelo eixo de "com que frequência
isto muda"**, não pelo eixo de "isto é lógica ou é view". Comportamento de
acessibilidade e aparência mudam em ritmos radicalmente diferentes, e é essa
diferença de ritmo — não a categoria — que justifica a fronteira.
