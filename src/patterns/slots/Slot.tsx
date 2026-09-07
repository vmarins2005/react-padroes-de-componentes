import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/**
 * PADRÃO: slot / `asChild` (polimorfismo por delegação).
 *
 * O problema: você tem um `<Button>` com estilo e comportamento, e precisa que
 * ele seja renderizado como o `<Link>` do seu roteador — sem duplicar o estilo,
 * sem aninhar `<a>` dentro de `<button>` (que é HTML inválido e quebra o
 * teclado), e sem inventar uma prop `href` que o botão não deveria conhecer.
 *
 * A solução do Radix, reproduzida aqui: em vez de renderizar o próprio elemento,
 * o componente **funde suas props no único filho** que recebeu.
 *
 *     <Button asChild>
 *       <Link to="/perfil">Perfil</Link>
 *     </Button>
 *
 * O resultado é um `<a>` só, com o estilo do Button e o comportamento do Link.
 *
 * Diferença para o `as="a"` (visto no projeto `react-solid-principles`):
 *
 *   as       -> o componente cria o elemento. Simples, mas ele precisa aceitar e
 *               repassar as props do elemento alvo, e o tipo fica complexo.
 *   asChild  -> quem cria o elemento é o consumidor. O componente só decora.
 *               Funciona com QUALQUER componente, inclusive os de terceiros que
 *               você não pode alterar.
 */

type SlotProps = { children: ReactNode } & Record<string, unknown>

export function Slot({ children, ...slotProps }: SlotProps) {
  if (!isValidElement(children)) {
    throw new Error('Slot espera exatamente um elemento React como filho.')
  }
  if (Children.count(children) > 1) {
    throw new Error('Slot espera um único filho. Envolva-os num fragmento próprio.')
  }

  const child = children as ReactElement<Record<string, unknown>>
  return cloneElement(child, mergeProps(slotProps, child.props))
}

/**
 * A fusão é a parte sutil, e onde implementações ingênuas quebram.
 *
 *  - handlers: os DOIS precisam rodar (o do slot e o do filho), na ordem certa
 *  - className: precisa concatenar, não sobrescrever
 *  - style: precisa mesclar, com o do filho tendo prioridade
 *  - o resto: o filho vence, porque quem escreveu a chamada foi mais específico
 */
function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...slotProps, ...childProps }

  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key]
    const childValue = childProps[key]

    const isHandler = /^on[A-Z]/.test(key)
    if (isHandler && typeof slotValue === 'function' && typeof childValue === 'function') {
      merged[key] = (...args: unknown[]) => {
        // O do filho primeiro: se ele chamar preventDefault, o do slot ainda
        // roda e pode inspecionar o evento já tratado.
        childValue(...args)
        slotValue(...args)
      }
    } else if (key === 'className' && typeof slotValue === 'string') {
      merged[key] = [slotValue, childValue].filter(Boolean).join(' ')
    } else if (key === 'style' && slotValue && childValue) {
      merged[key] = { ...(slotValue as object), ...(childValue as object) }
    }
  }

  return merged
}

/**
 * Uso: o componente decide entre renderizar-se ou delegar ao filho.
 *
 * Repare que o estilo (`style`) é aplicado nos dois caminhos, e é exatamente
 * isso que torna o padrão útil: a decoração é do componente, o elemento é de
 * quem chama.
 */
export function SlottableButton({
  asChild = false,
  children,
  ...rest
}: {
  asChild?: boolean
  children: ReactNode
} & ComponentPropsWithoutRef<'button'>) {
  const decoration: CSSProperties = {
    display: 'inline-block',
    padding: '0.45rem 0.85rem',
    borderRadius: 6,
    border: '1px solid var(--accent)',
    background: 'var(--surface)',
    color: 'var(--text)',
    textDecoration: 'none',
    cursor: 'pointer',
  }

  if (asChild) {
    return (
      <Slot style={decoration} {...rest}>
        {children}
      </Slot>
    )
  }

  return (
    <button style={decoration} {...rest}>
      {children}
    </button>
  )
}
