import {
  type Component,
  Match,
  Switch,
  onMount,
  createSignal,
  createEffect
} from 'solid-js'

import styles from './App.module.scss'
import Shelf from './Shelf'
import Read from './Read'
import { useSelected } from './Providers/SelectedProvider'
import { useBooks } from './Providers/BooksProvider'
import { useState } from './Providers/StateProvider'
import Config from './Config'

export interface Book {
  name: string
  url: string
  content: Selector
  next: Selector
  prev: Selector
  blacklist: Selector[]
}

export interface Selector {
  value: string
  type: 'css' | 'innerText'
}

export type State = '/' | '/read' | '/config'

const App: Component = () => {
  // DEBUGDEBUGDEBUG
  onMount(() => {
    // console.log(selected(), state());
    // console.log(unwrap(books));
    // setSelected(1);
    // setState("/read");
  })

  const [state] = useState()
  const books = useBooks()
  const [selected] = useSelected()

  const [dark, setDark] = createSignal(
    ((): boolean => {
      const a = localStorage.getItem('dark')
      if (a) {
        return JSON.parse(a)
      } else {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    })()
  )
  createEffect(() => {
    localStorage.setItem('dark', dark().toString())
    console.log(dark())
  })

  return (
    <div
      id={styles.main}
      class={`${state() === '/read' ? styles.root : ''} ${
        dark() ? styles.dark : styles.light
      }`}
    >
      <Switch>
        <Match when={state() === '/'}>
          <Shelf setDark={setDark} />
        </Match>
        <Match when={state() === '/read'}>
          <Read book={books[selected()]} />
        </Match>
        <Match when={state() === '/config'}>
          <Config book={books[selected()]} />
        </Match>
      </Switch>
    </div>
  )
}

export default App
