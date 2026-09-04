import { useState, type ReactNode } from 'react'
import { Tabs } from './patterns/compound/Tabs'
import { AccordionSkin, PopoverSkin } from './patterns/headless/skins'
import { MousePosition } from './patterns/render-props/MousePosition'
import { SlottableButton } from './patterns/slots/Slot'
import { toggleReducer, useToggle } from './patterns/state-reducer/useToggle'

function Pattern(props: { title: string; lead: string; children: ReactNode }) {
  return (
    <section>
      <h2>{props.title}</h2>
      <p>{props.lead}</p>
      {props.children}
    </section>
  )
}

function ControlledTabsDemo() {
  // O mesmo componente, agora controlado de fora. Nenhuma linha do Tabs mudou.
  const [tab, setTab] = useState('billing')
  return (
    <div className="panel">
      <div className="row" style={{ marginBottom: '0.75rem' }}>
        <span className="muted">controle externo:</span>
        {['profile', 'billing', 'team'].map((value) => (
          <button key={value} onClick={() => setTab(value)} disabled={tab === value}>
            {value}
          </button>
        ))}
      </div>
      <Tabs.Root value={tab} defaultValue="profile" onValueChange={setTab}>
        <Tabs.List label="Configurações da conta">
          <Tabs.Trigger value="profile">Perfil</Tabs.Trigger>
          <Tabs.Trigger value="billing">Cobrança</Tabs.Trigger>
          <Tabs.Trigger value="team">Equipe</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="profile">Dados pessoais e foto.</Tabs.Panel>
        <Tabs.Panel value="billing">Plano, faturas e método de pagamento.</Tabs.Panel>
        <Tabs.Panel value="team">Convites e permissões.</Tabs.Panel>
      </Tabs.Root>
      <p className="muted">
        Estado externo atual: <code>{tab}</code>
      </p>
    </div>
  )
}

function StateReducerDemo() {
  const padrao = useToggle()

  // O consumidor injeta a própria regra de transição. O hook não sabe que
  // "travar após 4" existe, e nunca vai saber.
  const travado = useToggle({
    reducer(state, action) {
      if (action.type === 'toggle' && state.toggleCount >= 4) return state
      return toggleReducer(state, action)
    },
  })

  return (
    <div className="grid cols-2">
      <div className="panel">
        <h3>Comportamento padrão</h3>
        <button onClick={padrao.toggle}>{padrao.on ? 'Ligado' : 'Desligado'}</button>
        <p className="muted">alternâncias: {padrao.toggleCount}</p>
      </div>
      <div className="panel">
        <h3>Regra injetada pelo consumidor</h3>
        <button onClick={travado.toggle}>{travado.on ? 'Ligado' : 'Desligado'}</button>
        <p className="muted">
          alternâncias: {travado.toggleCount} — trava em 4{' '}
          <button onClick={travado.reset}>reset</button>
        </p>
      </div>
    </div>
  )
}

export function App() {
  return (
    <main>
      <h1>Padrões de componentes</h1>
      <p>
        Cinco padrões que resolvem o mesmo problema de fundo: <strong>como absorver
        variação sem que o componente vire um interpretador de configuração.</strong> A
        discussão de cada um está no topo do arquivo correspondente em{' '}
        <code>src/patterns/</code>.
      </p>

      <Pattern
        title="1. Compound component"
        lead="Peças que compartilham estado implícito por contexto. Navegue com Tab até as abas e depois use as setas — a lista inteira tem um único ponto de parada de Tab (roving tabindex)."
      >
        <ControlledTabsDemo />
      </Pattern>

      <Pattern
        title="2. Headless"
        lead="Duas aparências completamente diferentes construídas sobre o mesmo useDisclosure. Nenhuma linha de lógica duplicada, nenhuma linha de estilo imposta."
      >
        <div className="grid cols-2">
          <AccordionSkin title="Como funciona o reembolso?">
            Solicitações feitas em até 7 dias são processadas automaticamente.
          </AccordionSkin>
          <div className="panel">
            <PopoverSkin label="Abrir popover">
              <p style={{ margin: 0 }}>
                Mesmo hook, outra pele. Pressione <kbd>Esc</kbd>: fecha e devolve o foco ao
                gatilho.
              </p>
            </PopoverSkin>
          </div>
        </div>
      </Pattern>

      <Pattern
        title="3. Estado controlável"
        lead="O componente funciona sem estado externo, mas aceita ser controlado. É o contrato do <input> nativo — e o que evita que metade dos consumidores precise de um useState que não queria."
      >
        <div className="panel">
          <p className="muted" style={{ marginTop: 0 }}>
            As abas acima estão no modo controlado. Remova a prop <code>value</code> em{' '}
            <code>App.tsx</code> e elas continuam funcionando, agora gerenciando o próprio
            estado.
          </p>
        </div>
      </Pattern>

      <Pattern
        title="4. State reducer (inversão de controle)"
        lead="O consumidor intercepta a transição de estado em vez de pedir mais uma prop. A regra excêntrica de uma tela deixa de ser complexidade permanente de todas."
      >
        <StateReducerDemo />
      </Pattern>

      <Pattern
        title="5. Slot / asChild"
        lead="O componente funde suas props no filho em vez de renderizar um elemento próprio. Resolve o clássico 'preciso do estilo do Button mas o elemento tem que ser um link'."
      >
        <div className="panel row">
          <SlottableButton onClick={() => alert('sou um button')}>button de verdade</SlottableButton>
          <SlottableButton asChild>
            <a href="#slots">mesmo estilo, mas é um &lt;a&gt;</a>
          </SlottableButton>
        </div>
        <p className="muted">
          Inspecione o segundo no DevTools: existe um único <code>&lt;a&gt;</code>, sem
          botão em volta. Aninhar <code>&lt;a&gt;</code> dentro de{' '}
          <code>&lt;button&gt;</code> seria HTML inválido e quebraria o teclado.
        </p>
      </Pattern>

      <Pattern
        title="6. Render props — e por que hooks os substituíram"
        lead="Para compartilhar dado, hook. Para ceder o controle de renderização, render prop. O arquivo explica a distinção e os casos em que o padrão continua vivo."
      >
        <div className="panel">
          <MousePosition>
            {(position) => (
              <span>
                mouse: <code>{position.x}</code> x <code>{position.y}</code>
              </span>
            )}
          </MousePosition>
        </div>
      </Pattern>
    </main>
  )
}
