# ADR-001 — Componentes compartilhados nascem controláveis (controlled/uncontrolled híbridos)

- **Status:** Aceito
- **Data:** 2026-09-04

## Contexto

Um padrão recorrente de retrabalho no time: um componente compartilhado é escrito
gerenciando o próprio estado, funciona por meses, e então alguém precisa
sincronizá-lo com algo externo — a URL, um formulário, outro componente, um teste
E2E que precisa posicionar a UI num estado específico.

Nesse momento existem duas saídas ruins:

1. Adicionar uma prop `initialValue` e um `useEffect` que sincroniza. Isso cria
   duas fontes de verdade e a divergência aparece na primeira vez que o pai
   rejeita a mudança.
2. Converter o componente para totalmente controlado, quebrando todos os
   consumidores existentes que não queriam gerenciar estado nenhum.

O caminho inverso — nascer totalmente controlado — também tem custo: obriga
**todo** consumidor a criar um `useState`, inclusive os 90% que não precisam.

## Decisão

Todo componente exportado para consumo por outras features implementa o contrato
híbrido, via o hook `useControllableState`:

- `value` presente → **controlado**: o pai é a fonte de verdade; o componente só
  comunica intenção por `onChange`.
- `value` ausente → **não controlado**: o componente guarda o estado, e
  `defaultValue` define o inicial.

Componentes internos de uma feature única ficam isentos: aplicar o padrão onde há
um consumidor só é indireção sem retorno.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| Só não controlado | API mínima | Impossível sincronizar com URL, form ou teste sem gambiarra | É a situação que gerou este ADR |
| Só controlado | Fonte de verdade única e óbvia | Todo consumidor precisa de `useState`, inclusive quem não quer | Empurra boilerplate para dezenas de chamadas |
| `initialValue` + `useEffect` de sincronização | Parece resolver | Duas fontes de verdade; render extra; divergência silenciosa | Anti-padrão clássico de estado derivado |
| Híbrido via `useControllableState` | Atende os dois usos; é o contrato do `<input>` nativo, então já é familiar | Hook a mais; exige disciplina de não escrever no estado interno quando controlado | **Escolhido** |

## Consequências

**Positivas**
- O consumidor simples escreve `<Tabs.Root defaultValue="a">` e acabou.
- O consumidor que precisa sincronizar com a URL passa `value` e `onValueChange`,
  sem que o componente mude uma linha.
- Testes E2E conseguem posicionar a UI diretamente no estado desejado.
- A API é imediatamente compreensível porque replica o comportamento do DOM.

**Negativas**
- Existe uma regra que precisa ser respeitada e que o TypeScript não garante:
  no modo controlado, **não** escrever no estado interno. Quebrá-la reintroduz o
  problema das duas fontes de verdade de forma silenciosa.
- Alternar entre controlado e não controlado durante a vida do componente é bug
  do consumidor. O React avisa no console, mas só em desenvolvimento.
- Um hook a mais na leitura de cada componente.

**Monitorar**
- Se aparecerem casos em que o pai precisa **rejeitar** uma mudança (validação
  assíncrona antes de aceitar), o padrão a avaliar é o state reducer (ADR-002 do
  projeto), que dá controle sobre a transição e não só sobre o valor.

## Nota transferível

Se você está escrevendo um componente que outra pessoa vai consumir, a pergunta
não é "ele precisa ser controlado?". É **"eu consigo prever todos os motivos
pelos quais alguém vai querer controlá-lo?"**. Como a resposta é sempre não, o
híbrido é o custo mais baixo de estar errado.
