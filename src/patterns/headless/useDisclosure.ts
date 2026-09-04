import { useCallback, useId, useRef } from 'react'
import { useControllableState } from '@/lib/useControllableState'

/**
 * PADRÃO: headless (comportamento sem aparência).
 *
 * O hook entrega estado, handlers e **as props de acessibilidade prontas**.
 * Quem consome decide o markup e o estilo inteiros. É a arquitetura de Radix,
 * React Aria, Headless UI e TanStack Table — e a razão pela qual essas
 * bibliotecas sobrevivem a qualquer redesign.
 *
 * Por que isto é o padrão certo para design system: o comportamento correto de
 * um disclosure (ligar `aria-controls`/`aria-expanded`, manter o id estável,
 * devolver o foco ao gatilho ao fechar) é difícil e sempre igual. A aparência é
 * fácil e sempre diferente. Separá-los deixa cada parte no lugar em que ela é
 * barata de mudar.
 *
 * O contraste com o compound component não é de qualidade, é de escopo:
 *
 *   Compound  -> entrego markup + comportamento. Menos flexível, mais rápido de usar.
 *   Headless  -> entrego só comportamento. Mais flexível, exige mais de quem usa.
 *
 * Um design system maduro costuma ter os dois: o hook headless embaixo e o
 * compound estilizado por cima, construído com ele.
 */
export function useDisclosure(options: {
  open?: boolean | undefined
  defaultOpen?: boolean
  onOpenChange?: ((open: boolean) => void) | undefined
} = {}) {
  const contentId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [open, setOpen] = useControllableState<boolean>({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  })

  const close = useCallback(() => {
    setOpen(false)
    // Devolver o foco ao gatilho é a regra que quase todo mundo esquece. Sem ela,
    // ao fechar por Escape o foco volta para o <body> e o usuário de teclado
    // recomeça a navegação do topo da página.
    triggerRef.current?.focus()
  }, [setOpen])

  return {
    open,
    setOpen,
    close,
    toggle: useCallback(() => setOpen(!open), [open, setOpen]),

    /** Props para o elemento que dispara. Espalhe: <button {...getTriggerProps()}> */
    getTriggerProps: () => ({
      ref: triggerRef,
      'aria-expanded': open,
      'aria-controls': contentId,
      onClick: () => setOpen(!open),
    }),

    /** Props para o conteúdo. `hidden` em vez de desmontar preserva o estado interno. */
    getContentProps: () => ({
      id: contentId,
      role: 'region' as const,
      hidden: !open,
    }),
  }
}
