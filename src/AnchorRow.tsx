import { Component, Show } from 'solid-js'
import styles from './App.module.scss'
import { Book } from './App'
import { useState } from './Providers/StateProvider'

import BackSvg from './assets/back.svg?component'

export const AnchorRow: Component<{
  next: string | undefined
  prev: string | undefined
  book: Book
}> = (props) => {
  const setState = useState()[1]
  return (
    <div class={styles.anchorRow}>
      <BackSvg
        onClick={() => {
          setState('/')
        }}
        id={styles.back}
        class={styles.svg}
      />
      <div>
        <Show when={props.prev !== undefined}>
          <a
            href={props.prev}
            onClick={(e) => {
              e.preventDefault()
              props.book.url = props.prev!
            }}
          >
            prev
          </a>
        </Show>
        <Show when={props.next !== undefined}>
          <a
            onClick={(e) => {
              e.preventDefault()
              props.book.url = props.next!
            }}
          >
            next
          </a>
        </Show>
      </div>
    </div>
  )
}
