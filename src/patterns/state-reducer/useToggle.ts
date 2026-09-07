import { useReducer } from 'react'

/**
 * PADRÃO: state reducer (inversão de controle).
 *
 * O problema que ele resolve é real e frequente: **um consumidor precisa de uma
 * regra que o componente não previu**, e a resposta usual é adicionar mais uma
 * prop (`maxClicks`, `preventToggleWhen`, `lockAfter`). Cada uma dessas props é
 * uma regra de negócio de UM consumidor virando complexidade permanente de TODOS.
 *
 * O state reducer inverte isso: em vez de o componente prever regras, ele expõe
 * a **transição de estado** e deixa o consumidor interceptá-la. O componente
 * continua com uma responsabilidade só; quem tem a regra excêntrica paga por ela
 * no próprio arquivo.
 *
 * É o padrão que Kent C. Dodds popularizou (Downshift) e o mesmo princípio por
 * trás de `getDerivedStateFromProps` em bibliotecas de tabela e de formulário.
 */

export type ToggleState = { on: boolean; toggleCount: number }
export type ToggleAction = { type: 'toggle' } | { type: 'reset' } | { type: 'set'; on: boolean }

/** A transição padrão. Exportada para que o consumidor possa reusá-la e só desviar no caso dele. */
export function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
  switch (action.type) {
    case 'toggle':
      return { on: !state.on, toggleCount: state.toggleCount + 1 }
    case 'set':
      return { ...state, on: action.on }
    case 'reset':
      return { on: false, toggleCount: 0 }
    default: {
      // `never` aqui é uma verificação de exaustividade em tempo de compilação:
      // se alguém adicionar uma variante a ToggleAction e esquecer de tratá-la,
      // isto deixa de compilar. Ver o projeto `react-typescript-safety`.
      const exhaustive: never = action
      throw new Error(`Ação não tratada: ${JSON.stringify(exhaustive)}`)
    }
  }
}

export function useToggle(options: { reducer?: typeof toggleReducer } = {}) {
  const [state, dispatch] = useReducer(options.reducer ?? toggleReducer, {
    on: false,
    toggleCount: 0,
  })

  return {
    ...state,
    toggle: () => dispatch({ type: 'toggle' }),
    reset: () => dispatch({ type: 'reset' }),
    setOn: (on: boolean) => dispatch({ type: 'set', on }),
  }
}

/**
 * Exemplo de uso pelo consumidor, sem que o hook precise saber que isto existe:
 *
 *     const toggle = useToggle({
 *       reducer(state, action) {
 *         // regra desta tela: trava depois de 4 alternâncias
 *         if (action.type === 'toggle' && state.toggleCount >= 4) return state
 *         return toggleReducer(state, action)
 *       },
 *     })
 *
 * Compare com a alternativa por prop (`<Toggle maxToggles={4} />`): ali, a regra
 * "travar após N" entra no código de todo mundo, precisa de teste próprio, e a
 * próxima regra excêntrica ("travar aos domingos") pede mais uma prop. Aqui o
 * componente não muda nunca.
 *
 * O trade-off honesto: o consumidor agora depende do FORMATO interno do estado
 * e das ações. Isso é API pública — mudar `toggleCount` de nome vira breaking
 * change. Use o padrão quando a variação de regra é real e recorrente, não por
 * princípio; em componente com uma regra só, é indireção sem retorno.
 */
