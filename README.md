# Padrões de componentes

> **Stack:** React 19 + Vite + TypeScript strict
> **Conceito:** os padrões que absorvem variação sem transformar o componente
> num interpretador de configuração

---

## O problema que este projeto ataca

Todo componente compartilhado enfrenta a mesma pressão: **mais consumidores,
mais variações**. A resposta de menor esforço é adicionar uma prop por variação,
e ela funciona até a quinta — depois disso o componente vira um arquivo que
ninguém quer abrir, com combinações de props inválidas que só a tela revela.

Os padrões deste projeto são as cinco respostas maduras para essa pressão. Não
são intercambiáveis: cada um cede uma quantidade diferente de controle ao
consumidor, e escolher errado custa caro nas duas direções.

| Padrão | O componente entrega | O consumidor controla | Custo |
|---|---|---|---|
| Compound | markup + comportamento | estrutura e ordem | menos flexível |
| Headless | só comportamento e ARIA | markup e estilo inteiros | consumidor escreve mais |
| Controlável | estado interno opcional | quando quiser, o estado | duas fontes de verdade se mal feito |
| State reducer | transição padrão | a transição inteira | expõe o estado interno como API |
| Slot / `asChild` | decoração | qual elemento é renderizado | fusão de props é sutil |

---

## Rodando

```bash
npm install
npm run dev
```

Boa parte do que interessa aqui só se percebe **navegando por teclado**. Use Tab,
setas, Home/End e Escape na página — não só o mouse.

---

## O que ler, em ordem

1. **`lib/useControllableState.ts`** — a base de tudo. O contrato
   controlado/não-controlado que o `<input>` do DOM define e que quase nenhum
   componente de aplicação implementa.

2. **`patterns/compound/Tabs.tsx`** — compound component completo, com roving
   tabindex e a discussão de ativação automática vs. manual. É o arquivo mais
   denso do projeto e o que mais rende em entrevista.

3. **`patterns/headless/useDisclosure.ts` + `skins.tsx`** — o mesmo hook servindo
   um accordion e um popover. Inclui o detalhe que quase todo mundo esquece:
   devolver o foco ao gatilho ao fechar.

4. **`patterns/state-reducer/useToggle.ts`** — inversão de controle. Como deixar
   o consumidor mudar a regra sem que o componente precise conhecê-la.

5. **`patterns/slots/Slot.tsx`** — `asChild` do Radix, reimplementado. A fusão de
   props (handlers que precisam rodar os dois, `className` que concatena) é a
   parte que implementações ingênuas erram.

6. **`patterns/render-props/MousePosition.tsx`** — por que hooks substituíram
   render props para compartilhar dado, e os casos em que o padrão continua sendo
   a resposta certa.

---

## As decisões de escolha (o que responder em entrevista)

**"Quando compound e quando headless?"**
Compound quando o layout é estável e você quer que o time acerte por padrão.
Headless quando o mesmo comportamento precisa de aparências incompatíveis, ou
quando você entrega uma biblioteca. Um design system maduro tem os dois: hook
headless embaixo, compound estilizado por cima.

**"Por que não só props?"**
Porque props booleanas de aparência crescem em combinação e permitem estados
inválidos. `<Card compact showFooter footerText="" />` compila e quebra na tela.
Composição elimina a classe inteira de bug: o rodapé só existe se alguém
escrever o rodapé.

**"Qual o custo do state reducer?"**
O formato interno do estado vira API pública. Renomear um campo passa a ser
breaking change. Use quando a variação de regra é real e recorrente — não por
princípio.

**"`as` ou `asChild`?"**
`as` é mais simples e basta para elementos nativos. `asChild` é necessário quando
o alvo é um componente de terceiros que você não controla (o `Link` do roteador,
por exemplo) — e é o único que evita aninhar `<a>` dentro de `<button>`.

---

## Decisões documentadas

- [ADR-001 — Componentes compartilhados nascem controláveis](./docs/ADR-001-componentes-controlaveis-por-padrao.md)
- [ADR-002 — Comportamento no hook headless, aparência no compound](./docs/ADR-002-headless-embaixo-compound-em-cima.md)

---

## Exercícios

1. **Roving tabindex.** Em `Tabs.tsx`, troque `tabIndex={selected ? 0 : -1}` por
   `tabIndex={0}` em todos. Navegue a página só com Tab e conte quantas paradas
   você precisa para atravessar as abas. Depois desfaça e conte de novo.

2. **Ativação manual.** Ainda em `Tabs.tsx`, remova o `next?.click()` do
   `handleKeyDown`. Agora a seta move o foco sem ativar, e é preciso Enter. Essa
   é a variante correta quando cada painel dispara requisição — escreva um ADR
   curto decidindo qual das duas o seu design system adota, e por quê.

3. **Prove o controlável.** Em `App.tsx`, remova a prop `value` do
   `<Tabs.Root>`. Tudo continua funcionando, agora sem estado externo. Depois
   tente o inverso: faça o `Tabs` só controlado e veja quanto código a mais cada
   consumidor precisa escrever.

4. **Quebre o Slot.** Em `Slot.tsx`, remova a fusão de `onClick` (deixe
   `{...slotProps, ...childProps}` puro). Descubra qual dos dois handlers para de
   rodar e por quê. Depois inverta a ordem de chamada e observe o efeito quando o
   filho chama `preventDefault`.

5. **State reducer na prática.** Escreva um segundo consumidor do `useToggle` com
   a regra "só permite desligar depois de 3 segundos ligado". Note que você não
   tocou no hook.

6. **O exercício de tech lead.** Pegue um componente do seu trabalho que já tenha
   quatro ou mais props booleanas. Escolha qual dos cinco padrões o resolve,
   escreva o ADR justificando, e liste o que quebra para os consumidores atuais e
   qual é o caminho de migração.

---

## Armadilha comum

Todos estes padrões custam indireção. Aplicá-los num componente com um consumidor
só é over-engineering puro — você paga complexidade e não compra flexibilidade
nenhuma, porque não há variação para absorver.

O gatilho correto é sempre o mesmo, e é observável: **a terceira prop booleana de
aparência**, ou **o segundo consumidor que pediu um escape hatch**. Antes disso,
o componente simples é a resposta certa. Ver o projeto [react-when-to-abstract](https://github.com/vmarins2005/react-when-to-abstract).


---

## Faz parte de uma série

16 projetos independentes, um por conceito, sobre o que separa um dev pleno de um
senior/tech lead em React e Next.js. Cada um tem README, ADRs documentando as
decisões, e exercícios.

| Projeto | Conceito |
|---|---|
| [react-solid-principles](https://github.com/vmarins2005/react-solid-principles) | Os 5 principios SOLID traduzidos para componentes React, com anti-exemplo e versao boa lado a lado |
| [react-when-to-abstract](https://github.com/vmarins2005/react-when-to-abstract) | A mesma feature em 3 versoes: duplicada, abstraida cedo demais, e abstraida na hora certa |
| `react-component-patterns` **(você está aqui)** | Compound, headless, slots, state reducer e estado controlavel: como absorver variacao sem explodir em props |
| [react-feature-architecture](https://github.com/vmarins2005/react-feature-architecture) | Organizacao por feature em Next.js, com fronteiras garantidas por ESLint em vez de disciplina |
| [react-clean-architecture](https://github.com/vmarins2005/react-clean-architecture) | Clean Architecture no front: dominio puro, portas e adaptadores, sem uma linha de React no nucleo |
| [react-state-management](https://github.com/vmarins2005/react-state-management) | Os 6 tipos de estado em React e a ferramenta certa para cada um |
| [react-state-machines](https://github.com/vmarins2005/react-state-machines) | Da sopa de booleanos ao XState: tornar estados invalidos inexprimiveis |
| [react-typescript-safety](https://github.com/vmarins2005/react-typescript-safety) | Tipo nao existe em runtime: validacao com Zod, branded types e verificacao de exaustividade |
| [react-testing-strategy](https://github.com/vmarins2005/react-testing-strategy) | Testing Trophy com Vitest, Testing Library, MSW, Playwright e axe |
| [react-nextjs-performance](https://github.com/vmarins2005/react-nextjs-performance) | Waterfalls de requisicao, streaming com Suspense e o que RSC realmente economiza de bundle |
| [react-nextjs-caching](https://github.com/vmarins2005/react-nextjs-caching) | As 4 camadas de cache do App Router e como diagnosticar dado velho na tela |
| [react-accessibility](https://github.com/vmarins2005/react-accessibility) | WCAG 2.2 AA em React: foco, teclado, live regions e os requisitos invisiveis em code review |
| [react-nextjs-security](https://github.com/vmarins2005/react-nextjs-security) | Server Action e endpoint publico: autorizacao, validacao, rate limit e CSP com nonce |
| [react-nextjs-observability](https://github.com/vmarins2005/react-nextjs-observability) | Taxonomia de erros, error boundaries, log estruturado e feature flags com kill switch |
| [react-design-system-monorepo](https://github.com/vmarins2005/react-design-system-monorepo) | Design system como pacote versionado: Turborepo, design tokens e changesets |
| [react-git-workflow](https://github.com/vmarins2005/react-git-workflow) | Commit atomico e Conventional Commits, com historico curado e um bug para achar via git bisect |

---

## Licença

[MIT](./LICENSE) — use, copie e adapte à vontade, inclusive em projeto comercial.
Se este material ajudou, uma estrela no repositório é o suficiente.
