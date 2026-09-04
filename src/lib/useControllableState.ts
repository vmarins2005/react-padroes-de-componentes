import { useCallback, useState } from 'react'

/**
 * PADRÃO: estado controlável (controlled / uncontrolled híbrido).
 *
 * É o padrão que todo componente de biblioteca séria implementa, e que quase
 * nenhum componente de aplicação implementa — apesar de ser exatamente o que
 * falta quando alguém diz "eu precisava abrir esse modal de fora e não deu".
 *
 * O contrato, que vem do próprio `<input>` do DOM:
 *
 *   - `value` presente        -> CONTROLADO: quem manda é o pai; o componente
 *                               só avisa a intenção via `onChange`.
 *   - `value` ausente         -> NÃO CONTROLADO: o componente guarda o estado,
 *                               e `defaultValue` define o inicial.
 *
 * Por que isso importa em projeto real: um componente só controlado obriga TODO
 * consumidor a criar um `useState`, mesmo os 90% que não precisam. Um componente
 * só não controlado é impossível de sincronizar com URL, com formulário ou com
 * outro componente. O híbrido atende os dois sem custo para nenhum.
 *
 * Regra do React que este hook respeita: um componente não deve alternar entre
 * controlado e não controlado durante a vida. Aqui isso é garantido porque a
 * decisão depende apenas de `value !== undefined` — se o consumidor mudar isso
 * no meio, é bug dele, e o React reclama no console.
 */
export function useControllableState<T>(options: {
  value?: T | undefined
  defaultValue: T
  onChange?: ((value: T) => void) | undefined
}): [T, (next: T) => void] {
  const isControlled = options.value !== undefined
  const [internal, setInternal] = useState<T>(options.defaultValue)

  const value = isControlled ? (options.value as T) : internal

  const setValue = useCallback(
    (next: T) => {
      // No modo controlado NÃO escrevemos no estado interno: manter uma cópia
      // seria uma segunda fonte de verdade, e as duas divergiriam na primeira
      // vez que o pai rejeitasse a mudança.
      if (!isControlled) setInternal(next)
      options.onChange?.(next)
    },
    // `options` é recriado a cada render; dependemos só do que de fato importa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isControlled, options.onChange],
  )

  return [value, setValue]
}
