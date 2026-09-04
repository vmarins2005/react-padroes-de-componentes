import type { ReactNode } from 'react'
import { useDisclosure } from './useDisclosure'

/**
 * Duas aparências completamente diferentes, construídas sobre o MESMO hook.
 *
 * É esta a prova de valor do padrão headless: nenhuma linha de lógica foi
 * duplicada, e nenhuma linha de estilo foi imposta. Se amanhã o WAI-ARIA mudar
 * a recomendação para disclosure, corrigimos `useDisclosure.ts` e as duas peles
 * ficam corretas de imediato.
 */

export function AccordionSkin(props: { title: string; children: ReactNode }) {
  const disclosure = useDisclosure()

  return (
    <div className="panel">
      <h3 style={{ margin: 0 }}>
        <button {...disclosure.getTriggerProps()} style={{ width: '100%', textAlign: 'left' }}>
          {disclosure.open ? '▾' : '▸'} {props.title}
        </button>
      </h3>
      <div {...disclosure.getContentProps()} style={{ paddingTop: '0.75rem' }}>
        {props.children}
      </div>
    </div>
  )
}

export function PopoverSkin(props: { label: string; children: ReactNode }) {
  const disclosure = useDisclosure()

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button {...disclosure.getTriggerProps()}>{props.label}</button>
      <div
        {...disclosure.getContentProps()}
        onKeyDown={(event) => {
          // Escape fecha e devolve o foco ao gatilho — comportamento esperado de
          // qualquer camada sobreposta, e verificado por auditoria de WCAG.
          if (event.key === 'Escape') disclosure.close()
        }}
        className="panel"
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          minWidth: '16rem',
          zIndex: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        {props.children}
      </div>
    </div>
  )
}
