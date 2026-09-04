import { createContext, useContext, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { useControllableState } from '@/lib/useControllableState'

/**
 * PADRÃO: compound component.
 *
 * Peças que só fazem sentido juntas e compartilham estado implícito por contexto.
 * O consumidor monta a estrutura; o componente cuida do comportamento.
 *
 * O ganho que raramente é citado, e que é o mais valioso: **a acessibilidade
 * fica centralizada**. Papéis ARIA, `aria-controls`/`aria-labelledby` cruzados,
 * navegação por seta e roving tabindex vivem aqui, uma vez. Se cada tela
 * montasse suas abas com `<div onClick>`, cada tela teria a própria falha.
 *
 * Duas decisões de acessibilidade estão explícitas no código abaixo, e valem
 * uma resposta de entrevista:
 *
 * 1. **Roving tabindex.** Uma lista de abas expõe UM único ponto de parada de
 *    Tab. Chegou na lista, você navega entre abas com as setas, e Tab leva ao
 *    painel. Sem isso, uma lista com 8 abas obriga 8 Tabs para atravessar.
 *
 * 2. **Ativação automática vs. manual.** Aqui a seta já ativa a aba (automática),
 *    que é o padrão recomendado quando o painel é barato de renderizar. Se cada
 *    painel disparasse uma requisição, o correto seria ativação manual: a seta
 *    move o foco, e só Enter/Espaço ativa.
 */

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) throw new Error(`<${component}> precisa estar dentro de <Tabs.Root>.`)
  return context
}

function TabsRoot(props: {
  /** Presente => controlado pelo pai. Ausente => o componente gerencia. */
  value?: string
  defaultValue: string
  onValueChange?: (value: string) => void
  children: ReactNode
}) {
  const baseId = useId()
  const [value, setValue] = useControllableState<string>({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange,
  })

  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div>{props.children}</div>
    </TabsContext.Provider>
  )
}

function TabsList(props: { label: string; children: ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    )
    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement)
    if (currentIndex === -1) return

    const lastIndex = tabs.length - 1
    let nextIndex: number
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1
        break
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = lastIndex
        break
      default:
        return
    }

    // preventDefault só depois de saber que a tecla é nossa: sequestrar Home/End
    // indiscriminadamente quebraria a rolagem da página.
    event.preventDefault()
    const next = tabs[nextIndex]
    next?.focus()
    next?.click()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={props.label}
      onKeyDown={handleKeyDown}
      className="row"
      style={{ gap: '0.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}
    >
      {props.children}
    </div>
  )
}

function TabsTrigger(props: { value: string; disabled?: boolean; children: ReactNode }) {
  const { value, setValue, baseId } = useTabsContext('Tabs.Trigger')
  const selected = value === props.value

  return (
    <button
      role="tab"
      id={`${baseId}-tab-${props.value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${props.value}`}
      // Roving tabindex: apenas a aba selecionada é alcançável por Tab.
      tabIndex={selected ? 0 : -1}
      disabled={props.disabled ?? false}
      onClick={() => setValue(props.value)}
      style={{
        borderColor: selected ? 'var(--accent)' : 'transparent',
        background: selected ? 'var(--surface)' : 'transparent',
        fontWeight: selected ? 600 : 400,
      }}
    >
      {props.children}
    </button>
  )
}

function TabsPanel(props: { value: string; children: ReactNode }) {
  const { value, baseId } = useTabsContext('Tabs.Panel')
  if (value !== props.value) return null

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${props.value}`}
      aria-labelledby={`${baseId}-tab-${props.value}`}
      // tabIndex={0} torna o painel focável, para que Tab a partir da aba caia
      // dentro do conteúdo mesmo quando ele não tem nenhum elemento interativo.
      tabIndex={0}
      style={{ padding: '1rem 0' }}
    >
      {props.children}
    </div>
  )
}

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
} as const
