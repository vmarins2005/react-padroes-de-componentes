import { useEffect, useState, type ReactNode } from 'react'

/**
 * PADRÃO: render props (children as function).
 *
 * Historicamente foi a resposta do React à pergunta "como compartilhar lógica
 * com estado entre componentes?", antes dos hooks (2019). Hoje, **para esse fim,
 * está obsoleto** — e saber por quê é mais importante do que saber usá-lo.
 *
 * O problema que hooks resolveram: render props aninhadas viram "wrapper hell".
 *
 *     <Mouse>{(pos) =>
 *       <Window>{(size) =>
 *         <Theme>{(theme) => <Card ... />}
 *       }</Window>
 *     }</Mouse>
 *
 * Com hooks, isso é `const pos = useMouse()` — três linhas planas, sem
 * indentação, e componível sem limite.
 *
 * **Quando render props ainda é a resposta certa:** quando o que você compartilha
 * não é só dado, é *controle de renderização*. Quem decide O QUE renderizar é o
 * consumidor, mas QUANDO e QUANTAS VEZES renderizar é o componente. Um hook não
 * consegue fazer isso, porque ele não participa da árvore.
 *
 * Casos reais em que o padrão continua vivo:
 *   - virtualização (`react-window`, `@tanstack/react-virtual` no modo render)
 *   - `<AutoSizer>{({width, height}) => ...}` — precisa medir antes de renderizar
 *   - tabela genérica que renderiza uma célula por linha/coluna
 *   - error boundary com `fallbackRender`
 *
 * A regra: **dado compartilhado -> hook. Controle de renderização -> render prop.**
 */

type Position = { x: number; y: number }

/** A forma moderna: um hook. É isto que você deve escrever em 95% dos casos. */
export function useMousePosition(): Position {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })

  useEffect(() => {
    const handle = (event: MouseEvent) => setPosition({ x: event.clientX, y: event.clientY })
    window.addEventListener('mousemove', handle)
    return () => window.removeEventListener('mousemove', handle)
  }, [])

  return position
}

/**
 * A forma antiga, mantida como referência. Note que ela é implementada COM o
 * hook: quando você precisa oferecer as duas APIs (bibliotecas costumam
 * precisar), o hook é a base e o render prop é uma casca fina por cima.
 */
export function MousePosition(props: { children: (position: Position) => ReactNode }) {
  const position = useMousePosition()
  return <>{props.children(position)}</>
}

/**
 * Exemplo de render prop que hook NÃO substitui: quem decide quantas vezes
 * chamar `children` é o componente, não o consumidor.
 */
export function Repeat(props: { times: number; children: (index: number) => ReactNode }) {
  return (
    <>
      {Array.from({ length: props.times }, (_, index) => (
        <span key={index}>{props.children(index)}</span>
      ))}
    </>
  )
}
